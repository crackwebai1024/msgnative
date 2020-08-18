import { put, call, select, take, spawn, all } from 'redux-saga/effects'

import { convertArrayToMap } from 'commons/Lib/Utils'
import Actions, { ChatTypes } from 'commons/Redux/ChatRedux'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

import { EVENT_TYPE, ROOM_UPDATE_TYPE } from './Constants'
import { setupExistingRoomRequest } from './NewRoom'
import { sendFileRequest } from './E2EE'
import { periodicallyRefreshRoomState } from './Polling'
import {
  sendRoomEvent,
  createRoomRequest,
  joinRoomRequest,
  leaveRoomRequest,
  refreshRoom,
  startedTyping,
  stoppedTyping,
  updateRoomSettingsRequest
} from './Room'
import {
  getMessagesRequest,
  ackMessage,
  sendMessageRequest,
  sendNudgeRequest,
  peekNewMessageCountRequest
} from './Message'

import { bootstrapChatSocket } from './WebSocket/Setup'
import { chatAPI } from './WebSocket'
export { chatAPI } from './WebSocket'

export { chatMessageStatusWatch } from './Status'

export const chatSendFileRequest = sendFileRequest

export const chatCreateRoomRequest = createRoomRequest
export const chatJoinRoomRequest = joinRoomRequest
export const chatLeaveRoomRequest = leaveRoomRequest
export const chatStartedTyping = startedTyping
export const chatStoppedTyping = stoppedTyping
export const chatUpdateRoomSettingsRequest = updateRoomSettingsRequest
export const chatRefreshRoom = refreshRoom
export const chatSendRoomEvent = sendRoomEvent
export const chatGetMessagesRequest = getMessagesRequest

export const chatSetupExistingRoomRequest = setupExistingRoomRequest
export const chatAckMessage = ackMessage
export const chatSendMessageRequest = sendMessageRequest
export const chatSendNudgeRequest = sendNudgeRequest
export const chatPeekNewMessageCountRequest = peekNewMessageCountRequest

export function * chatInit () {
  const isRN = yield select(s => s.device.isReactNative)
  yield spawn(bootstrapChatSocket)

  if (!isRN) {
    yield spawn(periodicallyRefreshRoomState, true, true)
  }
}

// This is used to get room members by string
const getRoomMembers = (room) => {
  return room.members.map(m => m.email).sort().toString()
}

/**
 * Fetch chat rooms.
 */
export function * chatFetch (shouldShowLoader = true) {
  const isRN = yield select(s => s.device.isReactNative)

  if (!chatAPI.ready) {
    const message = yield formatMessage(m['connect-to-internet-and-retry'])
    yield put(Actions.chatFailure(message))
    return
  }

  const chatSuccessAction = isRN ? Actions.chatSuccessForCache : Actions.chatSuccess
  let isRefreshing = false
  if (shouldShowLoader) {
    const chatDataOrder = yield select(s => s.chat.dataOrder)
    if (chatDataOrder) {
      isRefreshing = true
    }
    yield put(Actions.chatRequest({ isRefreshing }))
  }

  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    const roomsMapRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/map/list',
      args: {}
    })
    const roomsMap = {}
    roomsMapRes.maps.forEach((m) => { roomsMap[m.member_map] = m.room_id })
    delete roomsMap['undefined__'] // TODO:

    yield put(Actions.setRoomsMap(roomsMap))

    const roomListRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/list',
      args: {}
    })

    // Make map of 'room_id' to room properties from '/room/list
    const roomListResMap = convertArrayToMap(roomListRes.rooms || [], 'room_id')
    // Make list of available room IDs so that only these are used for /room/get
    const allRoomIds = (roomListRes.rooms || []).map(r => r.room_id)

    // Join all the rooms first
    const joins = []

    // Get current known room data from redux
    const currentRoomsData = yield select(s => s.chat)
    if (currentRoomsData.data && isRefreshing) {
      // Check current known rooms and remove the ones
      // not present in /room/list response
      for (const y of currentRoomsData.dataOrder) {
        if (!roomListResMap[y]) {
          console.info('chatFetch: found invalid room in redux. Removing... ', y)
          yield put(Actions.chatLeaveRoomSuccess({ room_id: y }))
        }
      }

      for (const y of Object.keys(roomListResMap)) {
        if (currentRoomsData.dataOrder.indexOf(y) === 1) {
          const r = roomListResMap[y]
          joins.push(call([chatAPI, chatAPI.sendRequest], {
            cmd: '/room/join',
            args: { room_id: r.room_id, member: r.member_email, display_name: r.member_display_name },
            push_type: EVENT_TYPE.MESSAGE_INLINE
          }))
        }
      }
    }

    // Remove duplicated room ids
    const availableRoomIds = allRoomIds.filter((elem, pos) => allRoomIds.indexOf(elem) === pos)

    if (!availableRoomIds || !availableRoomIds.length) {
      yield put(chatSuccessAction({ rooms: [] }))
      return
    }

    // Do all room joins
    const joinResponse = yield all(joins)
    const newlyJoinedRooms = []

    // Note - it is possible that /room/list returns non-existing room ids
    // and if the client joins such a room, it should check and leave it
    for (const r of joinResponse) {
      // Check join status
      if (r.status) {
        newlyJoinedRooms.push(r.room_id)
        continue
      }
      const index = availableRoomIds.indexOf(r.room_id)
      availableRoomIds.splice(index)
    }

    // Get the room details
    const roomGetRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/get',
      args: { room_id: availableRoomIds }
    })
    // yield call([chatAPI, chatAPI.resendMessagesInSeq])

    // TODO: this should be handled in `chatd`

    // const { rooms } = roomGetRes
    // if (Array.isArray(rooms) && rooms.length > 0) { // Valid rooms only
    //   const dicRooms = {}
    //   const validRooms = []

    //   for (let room of rooms) {
    //     const roomMemberKey = getRoomMembers(room)
    //     if (!dicRooms[roomMemberKey]) {
    //       dicRooms[roomMemberKey] = true
    //       validRooms.push(room)
    //     }
    //   }
    //   roomGetRes.rooms = validRooms
    // }

    // Inject last_read_message_id into room object
    for (let i = 0; i < roomGetRes.rooms.length; i++) {
      const roomId = roomGetRes.rooms[i].room_id
      roomGetRes.rooms[i] = {
        ...roomListResMap[roomId],
        ...roomGetRes.rooms[i],
        joined: true
      }
    }
    // Dispatch CHAT_SUCCESS
    yield put(chatSuccessAction(roomGetRes))

    const publicKeyMap = {}
    roomGetRes.rooms.forEach((r) => {
      const membersArMap = convertArrayToMap(r.members, 'email')
      r.history.forEach((hm) => {
        const m = membersArMap[hm.email]
        publicKeyMap[hm.email] = m ? m.public_key : null
      })
    })
    yield put(Actions.chatSetMemberPublicKey(publicKeyMap))

    const membershipChanges = newlyJoinedRooms.map(roomId =>
      spawn(sendRoomEvent, ROOM_UPDATE_TYPE.MEMBERSHIP_CHANGE, { roomId }))
    if (isRN) {
      yield take(ChatTypes.CHAT_SUCCESS)
    }

    // Send all membership change events on rooms
    yield all(membershipChanges)
    for (let i = 0; i < availableRoomIds.length; i += 1) {
      const roomId = availableRoomIds[i]
      yield put(Actions.chatPeekNewMessageCountRequest(roomId, roomListResMap[roomId].last_read_message_id))
    }
  } catch (e) {
    yield put(Actions.chatFailure(e))
  }
}
