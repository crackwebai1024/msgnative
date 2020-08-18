import * as R from 'ramda'
import { all, put, call, select, take } from 'redux-saga/effects'
import Immutable from 'seamless-immutable'

import Actions, { ChatTypes } from 'commons/Redux/ChatRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { getContactMember } from 'commons/Selectors/Messaging'

import { chatAPI } from './WebSocket/index'
import { EVENT_TYPE, ROOM_UPDATE_TYPE } from './Constants'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'
import { convertArrayToMap } from 'commons/Lib/Utils'

/**
 * Send an event on the room, like ROOM_UPDATE, etc.
 *
 * @param event
 * @param roomId
 */
export function * sendRoomEvent (event, { roomId }) {
  if (!chatAPI.ready) return
  const room = yield select(s => s.chat.data[roomId])
  try {
    yield call([chatAPI, chatAPI.sendRequestWithoutResponse], {
      cmd: '/room/event',
      args: {
        room_id: roomId,
        event,
        member: room.member_email
      }
    })
  } catch (e) {}
}

/**
 * Chat refresh room.
 *
 * @param roomId
 */
export function * refreshRoom ({ roomId, bulk = false }) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }
  const roomIds = Array.isArray(roomId) ? roomId : [roomId]
  const isRN = yield select(s => s.device.isReactNative)

  try {
    const roomGetRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/get',
      args: { room_id: roomIds }
    })

    let publicKeyMap = yield select(s => s.chat.memberPublicKey || Immutable({}))
    publicKeyMap = publicKeyMap.asMutable()
    roomGetRes.rooms.forEach((r) => {
      const membersArMap = convertArrayToMap(r.members, 'email')
      r.history.forEach((hm) => {
        const m = membersArMap[hm.email]
        publicKeyMap[hm.email] = m ? m.public_key : null
      })
    })
    yield put(Actions.chatSetMemberPublicKey(publicKeyMap))
    if (isRN && bulk) {
      yield put(Actions.chatBulkRefreshRoomSuccess(roomGetRes))
    } else {
      const successActions = roomGetRes.rooms.map(room => put(Actions.chatRefreshRoomSuccess({ rooms: [room] })))
      yield all(successActions)
    }
  } catch (e) {
    yield put(Actions.chatRefreshRoomError(e))
  }
}

/**
 * Create room.
 *
 * Also joins the newly created room.
 *
 * @param identityEmail
 * @param identityName
 * @param contactEmail
 * @param isWebApp
 */
export function * createRoomRequest ({
  identityEmail, identityName, contactEmail, isWebApp = false
}) {
  try {
    if (!identityEmail || !contactEmail) {
      throw new Error('invalid_identityEmail_or_contactEmail')
    }

    if (isWebApp) {
      const chatData = yield select(s => R.path(['chat', 'data'], s))
      const chatDataMuted = chatData ? chatData.asMutable() : {}
      const roomList = R.map(e => e.members && e.members.length > 1 && `${e.members[0] && e.members[0].email}__${e.members[1] && e.members[1].email}`, R.values(chatDataMuted))
      if (R.values(chatDataMuted).length > 0 && roomList.length > 0 && (R.find(R.equals(`${identityEmail}__${contactEmail}`))(roomList) || R.find(R.equals(`${contactEmail}__${identityEmail}`))(roomList))) {
        const msg = yield formatMessage(m['chat-room-already-exist'], { contactEmail: contactEmail })
        yield put(Actions.chatCreateRoomError(new Error(msg)))
        return
      }
    }
    if (!chatAPI.ready) {
      yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
    }
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/add',
      args: {
        title: 'title',
        owner_identity_email: identityEmail,
        member_email: contactEmail
      }
    })

    const inviteRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/invite',
      args: {
        room_id: res.room_id,
        member_email: contactEmail
      }
    })

    if (inviteRes && !inviteRes.status) {
      if (inviteRes.msg === 'MEMBER_NOT_FOUND') {
        yield call([chatAPI, chatAPI.sendRequest], {
          cmd: '/room/remove',
          args: { room_id: res.room_id, identityEmail, contactEmail }
        })
        const msg = yield formatMessage(m['contact-not-available'])
        yield put(NotificationActions.displayNotification(msg, 'danger', 4000))
        yield put(Actions.chatCreateRoomError(new Error(msg)))
        return
      }
    }

    // autojoin the user into room
    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/join',
      args: {
        room_id: res.room_id,
        member: identityEmail,
        display_name: identityName || identityEmail
      }
    })

    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/map/set',
      args: { room_id: res.room_id, member_map: `${identityEmail}__${contactEmail}` }
    })

    // Get the room details
    const roomGetRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/get',
      args: { room_id: [res.room_id] }
    })

    yield put(Actions.chatCreateRoomSuccess({
      ...roomGetRes.rooms[0],
      joined: true,
      member_email: identityEmail,
      unreadCount: 0
    }))
  } catch (e) {
    yield put(Actions.chatCreateRoomError(e))
  }
}

/**
 * Join room.
 *
 * Also fetches the messages on the room.
 *
 * @param roomId
 * @param identityEmail
 */
export function * joinRoomRequest ({ roomId, identityEmail }) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    if (!identityEmail) {
      const room = yield select(s => s.chat.data[roomId])
      if (!room) {
        const error = {
          description: 'no room:' + roomId
        }
        throw error
      }
      if (!room.member_email) {
        const error = {
          description: 'no owner member in room',
          room
        }
        throw error
      }
      identityEmail = room.member_email
    }

    // Get the room details
    const roomGetRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/get',
      args: { room_id: [roomId] }
    })

    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/join',
      args: { room_id: roomId, member: identityEmail },
      push_type: EVENT_TYPE.MESSAGE_INLINE
    })

    const contact = getContactMember(roomGetRes.rooms[0])
    if (contact.email) {
      yield call([chatAPI, chatAPI.sendRequest], {
        cmd: '/room/map/set',
        args: { room_id: roomGetRes.rooms[0].room_id, member_map: `${roomGetRes.member_email}__${contact.email}` }
      })
    } else {
      const error = {
        description: 'no contact email',
        contact
      }
      throw error
    }

    yield put(Actions.chatJoinRoomSuccess(roomGetRes.rooms[0]))

    // Dispatch action for loading messages on the channel
    yield put(Actions.chatGetMessagesRequest(roomId))

    // Send room update event regarding subscription change
    yield call(sendRoomEvent, ROOM_UPDATE_TYPE.MEMBERSHIP_CHANGE, { roomId })
  } catch (e) {
    console.error(e)
    yield put(Actions.chatJoinRoomError(e))
  }
}

/**
 * Leave room.
 *
 * @param roomId
 */
export function * leaveRoomRequest ({ roomId, resolve, reject }) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    const room = yield select(s => s.chat.data[roomId])
    const roomLeaveRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/leave',
      args: { room_id: roomId, member: room.member_email }
    })
    if (typeof resolve === 'function') resolve()
    yield put(Actions.chatLeaveRoomSuccess(roomLeaveRes))

    // Send room update event regarding subscription change
    yield call(sendRoomEvent, ROOM_UPDATE_TYPE.MEMBERSHIP_CHANGE, { roomId })
  } catch (e) {
    if (typeof reject === 'function') reject()
    yield put(Actions.chatLeaveRoomError(e))
  }
}

/**
 * Update room settings
 * @param roomId
 * @param settings
 */
export function * updateRoomSettingsRequest ({ roomId, settings }) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }
  try {
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/member/settings',
      args: { room_id: roomId, ...settings }
    })
    yield put(Actions.chatUpdateRoomSettingsSuccess(res, settings))
  } catch (e) {
    yield put(Actions.chatUpdateRoomSettingsError(e))
  }
}

/**
 * Typing started
 * @param roomId
 * @param isE2EE
 */
export function * startedTyping ({ roomId, isE2EE }) {
  const event = isE2EE ? ROOM_UPDATE_TYPE.STARTED_TYPING_E2EE : ROOM_UPDATE_TYPE.STARTED_TYPING

  yield call(sendRoomEvent, event, { roomId })
}

/**
 * Typing stopped
 * @param roomId
 * @param isE2EE
 */
export function * stoppedTyping ({ roomId, isE2EE }) {
  const event = isE2EE ? ROOM_UPDATE_TYPE.STOPPED_TYPING_E2EE : ROOM_UPDATE_TYPE.STOPPED_TYPING

  yield call(sendRoomEvent, event, { roomId })
}
