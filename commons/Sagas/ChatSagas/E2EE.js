import { any } from 'ramda'
import request from 'superagent'
import { put, call, select, take } from 'redux-saga/effects'

import Actions, { ChatTypes, MESSAGE_STATUS } from 'commons/Redux/ChatRedux'

import { chatAPI } from './WebSocket/index'

/**
 * Send a file over a room.
 *
 * Note: currently works only with E2EE rooms.
 *
 * @param roomId
 * @param data
 */
export function * sendFileRequest ({ roomId, data, onProgress }) {
  const room = yield select(s => s.chat.data[roomId])
  const memberPublicKey = yield select(s => s.chat.memberPublicKey)

  let otherMembers = room.members.filter(m => m.email !== room.member_email)
  otherMembers = otherMembers.map(m => ({ ...m, public_key: memberPublicKey[m.email] }))

  if (!otherMembers || !otherMembers.length || !any(m => m.public_key && m.public_key.length, otherMembers)) return

  try {
    // For each member
    for (const member of otherMembers) {
      if (!member.public_key || !member.public_key.length) continue

      for (const key of member.public_key) {
        const encryptedMessage = yield call([chatAPI, chatAPI.encryptMessageAsBinary], data.data, key)

        // For each of member's public keys
        const res = yield call([chatAPI, chatAPI.sendRequest], {
          cmd: '/file/add/e2ee/presigned',
          args: {
            room_id: roomId,
            user_from: room.member_email,
            member: member.email,
            file_name: data.name,
            file_size: data.size,
            mime_type: data.type
          }
        })

        yield request
          .put(res.data_url)
          .send(encryptedMessage)
          .set('Content-Type', 'application/octet-stream')
          .on('progress', onProgress)

        yield call([chatAPI, chatAPI.sendRequest], {
          cmd: '/file/upload/complete',
          args: {
            room_id: roomId,
            file_id: res.file_id
          }
        })
      }
    }
  } catch (e) {
    console.info('sendFileRequest error - ', e)
  }
}

/**
 * Send message on an E2EE channel.
 *
 * Note - not directly wired with a redux action.
 *   chatSendMessageRequest saga calls this if room is E2EE.
 *
 * @param roomId
 * @param message
 * @param seqId
 */
export function * sendE2EEMessage ({ roomId, message, data }) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  const room = yield select(s => s.chat.data[roomId])
  const memberPublicKey = yield select(s => s.chat.memberPublicKey)

  let otherMembers = room.members.filter(m => m.email !== room.member_email)
  otherMembers = otherMembers.map(m => ({ ...m, public_key: memberPublicKey[m.email] }))

  if (!otherMembers || !otherMembers.length || !any(m => m.public_key && m.public_key.length, otherMembers)) return

  try {
    // For each member
    for (const member of otherMembers) {
      if (!member.public_key || !member.public_key.length) continue

      // For each of member's public keys
      for (const key of member.public_key) {
        try {
          const encryptedMessage = yield call([chatAPI, chatAPI.encryptMessageAsBase64], message, key)

          yield call([chatAPI, chatAPI.sendRequest], {
            cmd: '/message/add/e2ee',
            args: {
              room_id: roomId,
              member: member.email,
              user_from: room.member_email,
              enc_msg: encryptedMessage
            }
          })

          // yield put(Actions.chatMessageChangeId(roomId, seqId, null, true))

          // the message is considered sent if we get here, because
          // we got the response for `/message/add/e2ee` event
          yield put(Actions.chatMessageModified({
            ...data,
            status: MESSAGE_STATUS.SENT
          }, true))

          // yield put(Actions.chatSendMessageSuccess(res, message))
        } catch (e) {
          yield put(Actions.chatSendMessageError(e))
        }
      }
    }
  } catch (e) {
    // NOTE: we need to handle this!
  }
}
