import { all, call, select, take, put } from 'redux-saga/effects'
import { path } from 'ramda'
import uuidv1 from 'uuid/v1'

import Actions, { ChatTypes, MESSAGE_STATUS } from 'commons/Redux/ChatRedux'
import { uuidv1ToDate } from 'commons/Lib/Utils'

import { chatAPI } from './WebSocket/index'
import { sendE2EEMessage } from './E2EE'

/**
 * Get messages on a room.
 *
 * @param roomId
 * @param paginate
 * @param paginateNew
 */
export function * getMessagesRequest ({ roomId, paginate, paginateNew, messageId = null, limit = null }) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  const args = { room_id: roomId }
  if (limit) {
    args.limit = limit
  }
  if (paginate || paginateNew) {
    let messageIds = []
    if (!messageId) {
      messageIds = yield select(s => path(['chat', 'data', roomId, 'regular', 'messageIds'], s))
    } else {
      messageIds = [messageId]
    }
    if (messageIds && messageIds.length) {
      if (paginate) args.lt_message_id = messageIds[0]
      if (paginateNew) args.gt_message_id = messageIds[messageIds.length - 1]
    }
  }

  const isRN = yield select(s => s.device.isReactNative)
  const chatMessagesSuccessAction = isRN ? Actions.chatGetMessagesSuccessForCache : Actions.chatGetMessagesSuccess

  try {
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/message/list',
      args
    })

    yield put(chatMessagesSuccessAction(res, paginateNew))
    if (res && res.messages && res.messages.length) {
      const currentLastDeliveredMessageId = yield select(s => path(['chat', 'data', roomId, 'last_delivered_message_id'], s))
      const largestMessageIdOnResponse = res.messages[0].message_id
      if (
        !paginate &&
        (!currentLastDeliveredMessageId || uuidv1ToDate(currentLastDeliveredMessageId) < uuidv1ToDate(largestMessageIdOnResponse))
      ) {
        yield call([chatAPI, chatAPI.sendRequestWithoutResponse], {
          cmd: '/message/ack',
          args: { room_id: roomId, message_id: res.messages[0].message_id, event: 'DELIVERED' }
        })
      }
    }

    return res
  } catch (e) {
    yield put(Actions.chatGetMessagesError(roomId))
  }
}

/**
 * Acknowledge that a message on a channel has been read.
 *
 * @param roomId
 * @param messageId
 * @param isE2EE
 */
export function * ackMessage ({ roomId, messageId, isE2EE, isDeliveryAck }) {
  // the message last read logic is handled locally
  // since there could not be a shared state between
  // devices for e2ee chat
  if (isE2EE) {
    return
  }

  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    yield call([chatAPI, chatAPI.sendRequestWithoutResponse], {
      cmd: '/message/ack',
      args: { room_id: roomId, message_id: messageId, event: isDeliveryAck ? 'DELIVERED' : 'READ' }
    })
  } catch (e) {}
}

/**
 * Send message on a channel.
 *
 * @param roomId
 * @param message
 * @param isE2EE
 */
export function * sendMessageRequest ({ roomId, message, isE2EE }) {
  const seqId = uuidv1()
  const room = yield select(s => s.chat.data[roomId])
  const data = {
    body: message,
    message_id: seqId,
    room_id: roomId,
    user_from: room.member_email,
    is_file: false,
    status: MESSAGE_STATUS.PENDING
  }
  // go ahead and push the message to redux store
  // so user sees it instantly
  yield put(Actions.chatMessageReceived(data, isE2EE))

  // wait for chat api if not ready yet
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_SUCCESS)
    // check whether the room exists in redux or not. If not, simply return
    if (yield select(s => !s.chat.data[roomId])) return
  }

  // If end-to-end-encrypted
  if (isE2EE) {
    yield call(sendE2EEMessage, { roomId, message, data })
    return
  }

  try {
    // send the message to chatd
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/message/add',
      args: {
        room_id: roomId,
        enc_msg: message,
        member: room.member_email
      }
    })

    // the response returns the real, database id of the message
    // so we update the id of the message that we already pushed to
    // redux store, so we are consistent with chatd
    yield put(Actions.chatMessageChangeId(res.room_id, seqId, res.message_id, false))

    const inviteInProgress = yield select(s => s.chat.data[roomId].inviteInProgress)

    // if contact left the room, autojoin him with the message_id
    const contact = room.history.find(item => item.email !== room.member_email)
    if (!contact.is_joined && !inviteInProgress) {
      yield put(Actions.chatSetRoomInviteInProgress(roomId, true))
      yield call([chatAPI, chatAPI.sendRequest], {
        cmd: '/room/invite',
        args: {
          room_id: roomId,
          member_email: contact.email,
          override_identity_email: room.member_email,
          message_id: res.message_id
        }
      })
      yield put(Actions.chatRoomInviteSuccess(roomId, contact.email))
      yield put(Actions.chatSetRoomInviteInProgress(roomId, false))
    }

    // the message is considered sent if we get here, because
    // we got the response for `/message/add` event
    yield put(Actions.chatMessageModified({
      ...data,
      message_id: res.message_id,
      status: MESSAGE_STATUS.SENT
    }, false))
    yield put(Actions.chatSendMessageSuccess(res, message))
  } catch (e) {
    yield put(Actions.chatSendMessageError(e))
    yield put(Actions.chatSetRoomInviteInProgress(roomId, false))
  }
}

/**
 * Send nudge notification to another member in a room.
 *
 * @param roomId
 * @param displayName
 */
export function * sendNudgeRequest ({ roomId, displayName }) {
  try {
    const response = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/nudge',
      args: {
        room_id: roomId,
        display_name: displayName
      }
    })

    if (response == null) {
      yield put(Actions.chatSendNudgeSuccess({ room_id: roomId, status: false }))
    } else {
      yield put(Actions.chatSendNudgeSuccess(response))
    }
  } catch (e) {
    yield put(Actions.chatSendNudgeError(e))
  }
}

/**
 * Peek the total number of unread messages on a room.
 *
 * @param roomId
 * @param lastReadMessageId
 */
export function * peekNewMessageCountRequest ({ roomId, lastReadMessageId, useReturn = false }) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    const response = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/message/list/peek',
      args: { room_id: roomId, gt_message_id: lastReadMessageId }
    })
    if (useReturn) return { ...response, message_id: lastReadMessageId }
    yield put(Actions.chatPeekNewMessageCountSuccess(response))
  } catch (e) {}
}

/**
 * Peek the total number of unread messages for all the rooms.
 */
export function * peekAllRoomsNewMessageCountRequest (useReturn = false) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    const response = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/list/peek',
      args: { }
    })
    const successRes = Object.keys(response.counts).map(roomId => ({ room_id: roomId, total: response.counts[roomId] }))
    if (useReturn) return successRes

    yield all(successRes.map(r => put(Actions.chatPeekNewMessageCountSuccess(r))))
  } catch (e) {}
}
