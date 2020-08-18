import { call, cancel, fork, put, race, select, spawn, take, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { callAPI } from 'commons/Sagas/APISagas'
import { AppTypes } from 'commons/Redux/AppRedux'
import { UserTypes } from 'commons/Redux/UserRedux'
import ContactActions from 'commons/Redux/ContactRedux'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'
import MailboxActions from 'commons/Redux/MailboxRedux'
import { isLoggedIn } from 'commons/Selectors/User'
import { db, executeSql } from 'app/Sagas/LocalDBSagas'

import * as commonCacheSagas from './Lib/CommonCacheSagas'
import { deleteByEmail } from '../MailboxSagas/cacheSagas'

const resource = 'delete'
const DELETE_SYNC_INITIAL_DELAY = 2000
const DELETE_SYNC_DELAY = 50000

const config = {
  1: {
    tableName: 'contacts_cache',
    pk: 'email',
    valueKey: 'resource_id_str',
    action: ContactActions.contactRemoveSuccess,
    successSaga: deleteMailbox
  },
  2: {
    tableName: 'identities_cache',
    pk: 'id',
    valueKey: 'resource_id_int',
    action: IdentityActions.identityRemoveSuccess,
    successSaga: deleteMailbox
  },
  3: {
    tableName: 'user_emails_cache',
    pk: 'id',
    valueKey: 'resource_id_int',
    action: UserEmailActions.useremailRemoveSuccess
  },
  4: {
    tableName: 'mailbox_cache',
    pk: 'id',
    valueKey: 'resource_id_int',
    action: MailboxActions.mailboxDeleteSuccess
  }
}

function * deleteMailbox (payload) {
  let metaData = {}
  try {
    metaData = JSON.parse(payload.resource_metadata)
  } catch (e) {
    metaData = {}
  }

  if (!metaData || !metaData.delete_mail_history) return
  const recordConfig = config[payload.resource_type]
  const id = payload[recordConfig.valueKey]

  let records = yield call(executeSql, db, `SELECT email from ${recordConfig.tableName} WHERE ${recordConfig.pk}=?;`, [id])
  const item = records.item(0)
  if (!item) return
  yield call(deleteByEmail, item.email)
}

function * deleteRecord (tableName, pk, value) {
  const query = `
    UPDATE ${tableName}
    SET is_deleted=?
    WHERE ${pk}=?;
  `
  try {
    yield call(executeSql, db, query, [value, 1])
  } catch (e) { }
}

function * syncRequest () {
  const stats = yield call(commonCacheSagas.getStatisticsRecord, resource, false)

  const payload = {}
  if (stats.last_new_sync_ts) {
    payload.gt_ts = stats.last_new_sync_ts
  }

  try {
    const res = yield callAPI('UserDeletionHistory', payload)
    const data = res.data.resources
    for (let i = 0; i < data.length; i += 1) {
      const record = data[i]
      const recordConfig = config[record.resource_type]
      if (recordConfig.successSaga) {
        yield call(recordConfig.successSaga, record)
      }
      yield call(deleteRecord, recordConfig.tableName, recordConfig.pk, record[recordConfig.valueKey])
      yield put(recordConfig.action(record[recordConfig.valueKey]))
    }
    if (data.length > 0) {
      const query = `
        UPDATE sync_statistics
        SET last_new_sync_ts=?
        WHERE resource=?;
      `
      try {
        yield call(executeSql, db, query, [data[data.length - 1].deleted_on, resource])
      } catch (e) { }
    }
  } catch (e) {
    console.log('DeleteSync.syncRequest failed - ', e)
  }
}

function * periodicallySyncDeletedResources () {
  yield call(commonCacheSagas.checkAndCreateSyncStatisticRecord, resource)

  yield delay(DELETE_SYNC_INITIAL_DELAY)

  while (true) {
    yield call(syncRequest)
    yield delay(DELETE_SYNC_DELAY)
  }
}

function * initDeleteSync () {
  let user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  if (!db) {
    yield take(AppTypes.CACHE_D_B_IS_READY)
  }

  // If device is offline, wait for network to come back up
  if (!(yield select(s => s.app.isNetworkOnline))) {
    while (true) {
      const { networkState } = yield take(AppTypes.SET_NETWORK_STATE)
      if (networkState) break
    }
  }

  user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  // Fork task
  const task = yield fork(periodicallySyncDeletedResources)

  // Wait until network goes offline or user logs out
  const { networkStateChanged } = yield race({
    logout: take(UserTypes.LOGOUT),
    networkStateChanged: take(AppTypes.SET_NETWORK_STATE)
  })

  // Cancel the task
  yield cancel(task)

  if (!networkStateChanged) return

  yield spawn(initDeleteSync)
}

function * resetCache () {
  if (!db) {
    yield take(AppTypes.CACHE_D_B_IS_READY)
  }

  yield call(executeSql, db, `DELETE FROM sync_statistics WHERE resource=?`, [resource])
}

export default [
  takeLatest(AppTypes.READY_FOR_SYNC, initDeleteSync),
  takeLatest(
    [
      UserTypes.LOGOUT,
      AppTypes.ENSURE_DATA_CLEAN_UP_ON_LOGOUT
    ],
    resetCache
  )
]
