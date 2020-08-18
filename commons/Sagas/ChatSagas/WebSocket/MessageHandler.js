import { channel, delay } from 'redux-saga'
import { put, call, select, take, spawn, race } from 'redux-saga/effects'
import { path, isEmpty, isNil } from 'ramda'
import uuidv1 from 'uuid/v1'
import request from 'superagent'

import Actions, { ChatTypes } from 'commons/Redux/ChatRedux'
import WebrtcActions from 'commons/Redux/WebrtcRedux'
import { promiseUint8ArrayDataFromFile } from 'commons/Lib/FileReader'
import { handleCallEvent } from 'commons/Sagas/WebrtcSagas/CallEvents'

import { DISCONNECT_MESSAGE, EVENT_TYPE, ROOM_UPDATE_TYPE, IMAGE_MIME_TYPES } from '../Constants'
import { PING_MESSAGE, PONG_MESSAGE, PING_INTERVAL, PING_TIMEOUT } from './Constants'
import { setupExistingRoomRequest } from '../NewRoom'

import { chatAPI } from './index'
import { doHandShakeOnSocket } from './HandShake'

function * playPingPongOnSocket (channel) {
  console.info('playPingPongOnSocket: entered')

  let pingFailure = false

  while (true) {
    // Wait for interval if there hasn't been ping failure
    if (!pingFailure) {
      const intervalResult = yield race({
        interval: delay(PING_INTERVAL),
        disconnect: take(ChatTypes.CHAT_SOCKET_DISCONNECTED)
      })

      if (intervalResult.disconnect) return
    }

    // console.info('playPingPongOnSocket: sending PING')
    yield call([chatAPI, chatAPI.sendRawPayload], PING_MESSAGE, false)

    const result = yield race({
      pong: take(channel),
      timeout: delay(PING_TIMEOUT),
      disconnect: take(ChatTypes.CHAT_SOCKET_DISCONNECTED)
    })

    if (result.pong) {
      // console.info('playPingPongOnSocket: PONG received')
      pingFailure = false
    } else if (result.timeout) {
      console.info('playPingPongOnSocket: timed out waiting for PONG, closing socket')
      // If there's already been a ping failure once, close socket
      // else set pingFailure flag to true
      if (pingFailure) {
        chatAPI.close(false)
        return
      } else {
        pingFailure = true
      }
    } else if (result.disconnect) {
      console.info('playPingPongOnSocket: socket disconnected')
      return
    }
  }
}

/**
 * Keep listening for messages on socket
 * and deal with different event types.
 *
 * @param socketChannel
 */
export function * listenForMessages (socketChannel) {
  console.info('listenForMessages: entered')

  const pongChannel = yield call(channel)
  yield spawn(playPingPongOnSocket, pongChannel)

  while (true) {
    if (!chatAPI.userSessionStarted) break

    const message = yield take(socketChannel)

    // First check if it's the disconnect message
    // If so, dispatch chatSocketDisconnected redux action
    // and break the loop
    if (message === DISCONNECT_MESSAGE) {
      // console.info('disconnected...')
      yield put(Actions.chatSocketDisconnected())
      // console.info('listenForMessages: Message Handler disconnected!')
      // break
      continue
    }

    if (message === PONG_MESSAGE) {
      yield put(pongChannel, 1)
      continue
    }

    // When connect message is received on an existing socket
    if (message.public_key) {
      // yield put(Actions.chatSocketDisconnected())
      console.info('listenForMessages: Got socket connect message unexpectedly when socket is already connected.')
      yield call(doHandShakeOnSocket, message.public_key, socketChannel)
      continue
    }

    yield spawn(messageHandler, message)
  }

  console.info('listenForMessages: exiting')
}

function * messageHandler (decrypted) {
  // todo: validate call_id here for call events
  console.info(`listenForMessages: socket event - ${decrypted.type}`, decrypted)

  if (decrypted.type === EVENT_TYPE.WEBRTC_ANNOUNCE_EVENT) {
    yield call(handleCallEvent, decrypted)
    return
  }

  if (decrypted.type === EVENT_TYPE.WEBRTC_OFFER) {
    // Use global on react native to get and set inboundCallId
    // For inbound calls, the app can receive call offer on both, websocket and push notification
    // at a very close interval of time (under 50ms) and updating offer in redux & checking for
    // it another place takes too much time. To avoid race condition here, we needed a faster way
    // to set flag that app has received inbound call offer and check it in another place.
    if (typeof global !== 'undefined') {
      // If there's already data for a call, ignore the next one
      if (decrypted.call_id === global.inboundCallId) {
        console.info('listenForMessages: received WEBRTC_OFFER but theres already an offer for same call_id')
        return
      }

      // Set global.inboundCallId
      global.inboundCallId = decrypted.call_id

    // Check on webapp
    } else {
      const localCallId = yield select(s => s.webrtc.localCallId)
      if (localCallId === decrypted.call_id) {
        console.info('listenForMessages: received WEBRTC_OFFER but theres already an offer for same call_id')
        return
      }
    }

    if (decrypted.status) {
      yield put(WebrtcActions.setInboundVideoCallOffer(decrypted))
      yield put(WebrtcActions.inboundVideoCallOfferReceived(decrypted))
    }
    return
  }

  if (decrypted.type === EVENT_TYPE.WEBRTC_ANSWER) {
    yield put(WebrtcActions.outboundVideoCallAnswerReceived(decrypted))
    return
  }

  if (decrypted.type === EVENT_TYPE.WEBRTC_END_CALL) {
    yield put(WebrtcActions.endVideoCall(decrypted.call_end_reason, true))
    return
  }

  if (decrypted.type === EVENT_TYPE.WEBRTC_ANNOUNCE_REMOTE_VIDEO_TOGGLE) {
    yield put(WebrtcActions.remoteToggledCallCamera(decrypted.is_enabled))
    return
  }

  if (decrypted.type === EVENT_TYPE.WEBRTC_CALL_DELIVERED) {
    yield put(WebrtcActions.outboundCallDelivered(decrypted.call_id))
    return
  }

  // For auto room join events
  if (decrypted.type === EVENT_TYPE.AUTO_JOINED_ROOM) {
    yield spawn(setupExistingRoomRequest, { roomId: decrypted.room_id, identityEmail: decrypted.member_email, createIfNotExisting: true })
    return
  }

  // Don't process the event if the chat data isn't yet available
  const chatData = yield select(s => s.chat.data)
  if (isNil(chatData) || isEmpty(chatData)) return

  const roomId = path(['room_id'], decrypted) || path(['data', 'room_id'], decrypted)
  const room = chatData[roomId]
  if (!room) {
    console.info('listenForMessages: room not found for room_id - ', roomId)
    return
  }

  switch (decrypted.type) {
    // Normal message received
    case EVENT_TYPE.MESSAGE_INLINE:
      yield put(Actions.chatMessageReceived(decrypted.data))
      yield put(Actions.chatAckMessage(decrypted.data.room_id, decrypted.data.message_id, false, true))
      break

    // E2EE message or file received
    case EVENT_TYPE.MESSAGE_INLINE_E2EE:
    case EVENT_TYPE.FILE_GET_E2EE:
      const room = yield select(s => path(['chat', 'data', roomId], s))
      if (!room) return

      let sender = room.members.filter(m => m.email === decrypted.user_from)
      sender = sender[0]
      if (sender) {
        sender = sender.asMutable()
        sender.public_key = yield select(s => s.chat.memberPublicKey[sender.email])
      }
      if (!sender || !sender.public_key || !sender.public_key.length) {
        console.info('MESSAGE_INLINE_E2EE: sender\'s public key not found...')
        break
      }

      // Iterate through all of the sender's public keys and try to decrypt
      for (const key of sender.public_key) {
        try {
          // If the message is for E2EE inline file and there's a data_url
          // do an http fetch on the message
          if (decrypted.type === EVENT_TYPE.FILE_GET_E2EE && decrypted.data_url) {
            if (decrypted.file_size < 10 * 1024 * 1024 && IMAGE_MIME_TYPES[decrypted.mime_type]) {
              const encryptedFile = yield request.get(decrypted.data_url).responseType('blob')
              const encryptedBinary = yield promiseUint8ArrayDataFromFile(encryptedFile.body)
              const decryptedString = yield call([chatAPI, chatAPI.decryptBinaryMessage], encryptedBinary, key, true)
              yield put(Actions.chatMessageReceived({
                body: null,
                message_id: uuidv1(),
                room_id: decrypted.room_id,
                user_from: decrypted.user_from,
                is_image: true,
                data: decrypted,
                image_data: decryptedString
              }, true))
            } else {
              yield put(Actions.chatMessageReceived({
                body: null,
                message_id: uuidv1(),
                room_id: decrypted.room_id,
                user_from: decrypted.user_from,
                is_url: true,
                data: decrypted
              }, true))
            }
            return
          } else {
            const decryptedBody = yield call([chatAPI, chatAPI.decryptBase64Message], decrypted.data, key)
            yield put(Actions.chatMessageReceived({
              body: decryptedBody,
              message_id: uuidv1(),
              room_id: decrypted.room_id,
              user_from: decrypted.user_from,
              is_file: decrypted.type === EVENT_TYPE.FILE_GET_E2EE
            }, true))
          }
          break
        } catch (e) {
          console.info('failed to decrypt a message...', e)
        }
      }
      break

    case EVENT_TYPE.ROOM_UPDATE:
      // Do nothing if there's no data
      if (!decrypted.data) break

      // if the update is for the same user
      if (room && decrypted.data.member === room.member_email) break

      if (decrypted.data.event === ROOM_UPDATE_TYPE.MEMBERSHIP_CHANGE) {
        yield put(Actions.chatRefreshRoomRequest(decrypted.room_id, true))
      } else if (
        decrypted.data.event === ROOM_UPDATE_TYPE.STARTED_TYPING ||
        decrypted.data.event === ROOM_UPDATE_TYPE.STARTED_TYPING_E2EE
      ) {
        const isE2EE = decrypted.data.event === ROOM_UPDATE_TYPE.STARTED_TYPING_E2EE

        yield put(Actions.chatOtherUserStartedTyping(decrypted.room_id, decrypted.data.member, isE2EE))
      } else if (
        decrypted.data.event === ROOM_UPDATE_TYPE.STOPPED_TYPING ||
        decrypted.data.event === ROOM_UPDATE_TYPE.STOPPED_TYPING_E2EE
      ) {
        const isE2EE = decrypted.data.event === ROOM_UPDATE_TYPE.STOPPED_TYPING_E2EE

        yield put(Actions.chatOtherUserStoppedTyping(decrypted.room_id, decrypted.data.member, isE2EE))
      }
      break

    case EVENT_TYPE.ROOM_LEAVE:
      yield put(Actions.chatRefreshRoomRequest(roomId, true))
      break

    case EVENT_TYPE.MESSAGE_DELIVERED:
      yield put(Actions.chatMessageDelivered(decrypted.room_id, decrypted.message_id))
      break
  }
}
