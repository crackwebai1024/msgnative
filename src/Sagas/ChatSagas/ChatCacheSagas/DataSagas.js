import { take, call, takeLatest } from 'redux-saga/effects'

import { UserTypes } from 'commons/Redux/UserRedux'
import { AppTypes } from 'commons/Redux/AppRedux'
import { db, executeSql } from 'app/Sagas/LocalDBSagas'

import roomCacheDataSagas from './RoomCacheDataSagas'
import messageCacheDataSagas from './MessageCacheDataSagas'
const SYNC_STATISTICS_TABLE_NAME = 'sync_statistics'

const resource = 'chat'

/**
 * reset data cache and sync state
 */
function * resetCache () {
  console.log(`resetCache: entered for resource ${resource}`)

  if (!db) {
    yield take(AppTypes.CACHE_D_B_IS_READY)
  }

  yield call(executeSql, db, `DELETE FROM chat_room_member_cache;`)
  yield call(executeSql, db, `DELETE FROM chat_sync_statistics;`)
  yield call(executeSql, db, `DELETE FROM chat_message_cache;`)
  yield call(executeSql, db, `DELETE FROM chat_room_cache;`)
  yield call(executeSql, db, `DELETE FROM ${SYNC_STATISTICS_TABLE_NAME} WHERE resource=?`, [resource])
}

const sagas = [
  ...roomCacheDataSagas,
  ...messageCacheDataSagas,
  takeLatest(
    [
      UserTypes.LOGOUT,
      AppTypes.ENSURE_DATA_CLEAN_UP_ON_LOGOUT
    ],
    resetCache
  )
]

export default sagas
