
import { cancel, fork, put, race, select, spawn, take, takeLatest } from 'redux-saga/effects'

import { UserTypes } from 'commons/Redux/UserRedux'
import { AppTypes } from 'commons/Redux/AppRedux'
import { db } from 'app/Sagas/LocalDBSagas'
import ChatActions, { ChatTypes } from 'commons/Redux/ChatRedux'
import { chatAPI } from 'commons/Sagas/ChatSagas/WebSocket'
import { isLoggedIn } from 'commons/Selectors/User'

import cacheConfig from 'app/Sagas/LocalDBSagas/Lib/SyncConfig'

import roomSyncSagaBindings, { syncRoomsPeriodically } from './RoomSyncSagas'
import messageSyncSagaBindings, { initChatMessagesSync } from './MessageSyncSagas'

const resource = 'chat'
const _config = cacheConfig[resource]
const cacheEnabled = _config.cacheEnabled

function * initSync () {
  let user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  if (cacheEnabled && !db) {
    yield take(AppTypes.CACHE_D_B_IS_READY)
  }
  if (!chatAPI.ready) {
    const dataOrder = yield select(s => s.chat.dataOrder)
    if (!dataOrder || !dataOrder.length) {
      yield put(ChatActions.chatFetch()) // fech room list from cache
    }
    console.log('initSync: waiting for websocket connection')
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }
  console.log('initSync: websocket connected')

  user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  yield put(ChatActions.chatFetch())

  const reduxSlice = yield select(s => s.chat)
  if (reduxSlice.syncInitiated) return

  // initiate the sync process
  yield put(ChatActions.chatSetSyncInitiated(true))

  const roomTask = yield fork(syncRoomsPeriodically)
  const messageTask = yield fork(initChatMessagesSync)

  const { disconnected } = yield race({
    logout: take(UserTypes.LOGOUT),
    disconnected: take(ChatTypes.CHAT_SOCKET_DISCONNECTED)
  })
  yield cancel(roomTask)
  yield cancel(messageTask)
  if (disconnected) {
    yield put(ChatActions.chatSetSyncInitiated(false))
    console.log('initSync: websocket disconnected. exiting...')
    yield spawn(initSync)
  }
}

export default[
  takeLatest(AppTypes.READY_FOR_SYNC, initSync),
  ...roomSyncSagaBindings,
  ...messageSyncSagaBindings
]
