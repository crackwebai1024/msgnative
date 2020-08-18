import { call, cancel, fork, put, race, select, spawn, take } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import ChatActions, { ChatTypes } from 'commons/Redux/ChatRedux'
import { UserTypes } from 'commons/Redux/UserRedux'
import { isLoggedIn } from 'commons/Selectors/User'

import { chatAPI } from './WebSocket/index'
import { refreshRoom } from './Room'
import { setupExistingRoomRequest } from './NewRoom'
import { getMessagesRequest, peekAllRoomsNewMessageCountRequest } from './Message'
import { DATA_POLL_INTERVAL_MS } from './Constants'

export function * periodicallyRefreshRoomList () {
  // Get the latest available room list
  let roomListRes = null
  try {
    roomListRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/list',
      args: {}
    })
  } catch (e) {}

  if (!roomListRes) { return }

  const latestRooms = roomListRes.rooms || []
  const latestRoomIdsMap = {}
  latestRooms.map((r) => { latestRoomIdsMap[r.room_id] = true })

  // Get current known room data from redux
  const currentRoomsData = yield select(s => s.chat)

  // if the chat state is not initiated yet then do nothing
  if (!currentRoomsData.data) {
    return
  }

  // Check latest rooms and find the ones that client isn't aware of
  for (const x of latestRooms) {
    if (!currentRoomsData.data[x.room_id]) {
      console.info('periodicallyRefreshRoomList: found new room... ', x.room_id)
      yield call(setupExistingRoomRequest, { roomId: x.room_id, identityEmail: x.member_email, createIfNotExisting: false })
    }
  }

  // Check current known rooms and remove the ones
  // not present in /room/list response
  for (const y of currentRoomsData.dataOrder) {
    if (!latestRoomIdsMap[y]) {
      console.info('periodicallyRefreshRoomList: room lost... ', y)
      yield put(ChatActions.chatLeaveRoomSuccess({ room_id: y }))
    }
  }
}

/**
 * For periodically updating –
 *
 * - room list - new or lost rooms that client isn't aware of
 * - e2ee rooms - update room object (containing members)
 * - non-e2ee rooms - poll latest messages
 */
export function * refreshRoomState (delayInitially, refreshMessages) {
  const socketConnected = yield select(s => s.chat.socketConnected)

  if (delayInitially || !socketConnected) {
    yield delay(DATA_POLL_INTERVAL_MS)
    if (!socketConnected) {
      return
    }
  }

  // If room data isn't there yet, wait for CHAT_SUCCESS
  let chatData = yield select(s => s.chat)
  if (!chatData.dataOrder) {
    yield take(ChatTypes.CHAT_SUCCESS)
  }

  yield call(periodicallyRefreshRoomList)

  chatData = yield select(s => s.chat)
  if (!chatData.dataOrder || !chatData.dataOrder.length) return

  // Refresh all the room
  yield call(refreshRoom, { roomId: chatData.dataOrder, bulk: true })
  chatData = yield select(s => s.chat)

  yield call(peekAllRoomsNewMessageCountRequest)

  if (refreshMessages) {
    for (const roomId of chatData.dataOrder) {
      // Get latest messages on it
      yield spawn(getMessagesRequest, { roomId, paginateNew: true })
    }
  }
}

function * chatSyncTask (refreshMessages) {
  while (true) {
    yield call(refreshRoomState, true, refreshMessages)
  }
}

export function * periodicallyRefreshRoomState (delayInitially, refreshMessages, onlyOnce) {
  if (!chatAPI.ready) {
    console.log('periodicallyRefreshRoomState: waiting for websocket connection')
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  if (onlyOnce) {
    yield call(refreshRoomState, delayInitially, refreshMessages)
    return
  }

  const isRN = yield select(s => s.device.isReactNative)
  const user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  console.log('periodicallyRefreshRoomState: websocket connected')
  if (!isRN) {
    const reduxSlice = yield select(s => s.chat)
    if (reduxSlice.syncInitiated) return
    yield put(ChatActions.chatSetSyncInitiated(true))
  }

  const pollingTask = yield fork(chatSyncTask)

  const { disconnected } = yield race({
    logout: take(UserTypes.LOGOUT),
    disconnected: take(ChatTypes.CHAT_SOCKET_DISCONNECTED)
  })
  yield cancel(pollingTask)
  if (disconnected && !isRN) {
    yield put(ChatActions.chatSetSyncInitiated(false))
    console.log('periodicallyRefreshRoomState: websocket disconnected. exiting...')
    yield spawn(periodicallyRefreshRoomState, delayInitially, refreshMessages, onlyOnce)
  }
}
