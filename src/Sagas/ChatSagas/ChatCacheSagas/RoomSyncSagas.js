import { call, cancelled, fork, put, select, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import ChatActions, { ChatTypes } from 'commons/Redux/ChatRedux'
import { chatFetch } from 'commons/Sagas/ChatSagas'
import { periodicallyRefreshRoomState } from 'commons/Sagas/ChatSagas/Polling'

import cacheConfig from 'app/Sagas/LocalDBSagas/Lib/SyncConfig'

const resource = 'chat'
const _config = cacheConfig[resource]
const enableNewSync = _config.enableNewSync

/**
 * Saga used to force refresh the data
 */
function * forceRefreshRoomList () {
  yield call(chatFetch)
}

export function * syncRoomsPeriodically () {
  const slice = yield select(s => s.chat)

  if (!slice.dataOrder || !slice.dataOrder.length) {
    yield put(ChatActions.chatFetchFromCache())
    yield delay(1500)
  }
  if (enableNewSync) {
    console.log(`syncRoomsPeriodically: forking...`)
    yield fork(periodicallyRefreshRoomState, true, false)
  }
}

const sagas = [
  takeLatest(ChatTypes.CHAT_FORCE_REFRESH, forceRefreshRoomList)
]

export default sagas
