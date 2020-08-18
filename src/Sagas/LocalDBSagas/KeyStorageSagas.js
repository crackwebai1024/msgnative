
import { take, takeLatest, call } from 'redux-saga/effects'
import base64 from 'base-64'
import moment from 'moment'
import { UserTypes } from 'commons/Redux/UserRedux'
import { AppTypes } from 'commons/Redux/AppRedux'
import { MailboxTypes } from 'commons/Redux/MailboxRedux'
import { decode as utf8decode, encode as utf8encode } from 'app/Lib/UTF8'

import { db, executeSql } from './index'

export const USER_KEY = 'user'
export const DRAWER_TOTALS_KEY = 'drawerTotals'

export function * getKeyFromCache (key) {
  if (!db) {
    yield take(AppTypes.CACHE_D_B_IS_READY)
  }
  try {
    const rows = yield call(executeSql, db, 'SELECT * FROM key_storage WHERE key=?;', [key])
    const data = rows.item(0)
    if (!data) return null
    const decodedData = utf8decode(base64.decode(data.value))
    return JSON.parse(decodedData)
  } catch (e) {
    console.error(e)
    yield call(deleteKeyFromCache, key)
    return null
  }
}

function * updateKeyCache (key, { data }) {
  const existing = yield call(getKeyFromCache, key)
  const encodedData = base64.encode(utf8encode(JSON.stringify(data)))
  let query = ''
  let params = []
  const updatedOn = moment.utc().unix()
  if (!existing) {
    query = 'INSERT INTO key_storage (key, value, updated_on) VALUES (?, ?, ?);'
    params = [key, encodedData, updatedOn]
  } else {
    query = `
      UPDATE key_storage
      SET value=?,
        updated_on=?
      WHERE key=?;
    `
    params = [encodedData, updatedOn, key]
  }

  try {
    yield call(executeSql, db, query, params)
  } catch (e) {}
}

function * deleteKeyFromCache (key) {
  try {
    yield call(executeSql, db, 'DELETE FROM key_storage WHERE key=?;', [key])
  } catch (e) { console.error(e) }
}

function * clearKeyStorageCache () {
  try {
    yield call(executeSql, db, 'DELETE FROM key_storage;')
  } catch (e) { console.error(e) }
}

export default [
  takeLatest(UserTypes.UPDATE_USER, updateKeyCache, USER_KEY),
  takeLatest(MailboxTypes.drawerTotalsSuccess, updateKeyCache, DRAWER_TOTALS_KEY),
  takeLatest(
    [
      UserTypes.LOGOUT,
      AppTypes.ENSURE_DATA_CLEAN_UP_ON_LOGOUT
    ],
    clearKeyStorageCache
  )
]
