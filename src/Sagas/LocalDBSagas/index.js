
import * as Keychain from 'react-native-keychain'
import { spawn, call, put, take } from 'redux-saga/effects'
import { ContactTypes } from 'commons/Redux/ContactRedux'
import AppActions from 'commons/Redux/AppRedux'
import { initMigrations } from './migrations'
import { db, executeSql, openDatabase, deleteDatabase } from './dbUtils'

const DATABASE_NAME = 'msgsafe.db'

function randomString (length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

function * listenForIsEmailPlatformUserAndCache (db) {
  console.log('listenForIsEmailPlatformUserAndCache: entered')
  while (true) {
    const { data } = yield take(ContactTypes.CACHE_IS_EMAIL_PLATFORM_USER)

    yield spawn(updateIsPlatformUserAndCache, data)
  }
}

function * updateIsPlatformUserAndCache (data) {
  console.log('updateIsPlatformUserAndCache: entered')
  for (const c of data) {
    try {
      const query = `
        INSERT INTO email_is_platform_user
          (email, is_platform_user)
        VALUES (?, ?);
      `
      yield call(executeSql, db, query, [c.email.toLowerCase(), c.is_msgsafe_user ? 1 : 0])
    } catch (e) {
      try {
        const query = `
          UPDATE email_is_platform_user
          SET is_platform_user=?
          WHERE email=?;
        `
        yield call(executeSql, db, query, [c.is_msgsafe_user ? 1 : 0, c.email.toLowerCase()])
      } catch (e) {}
    }
  }
}

// SQLite.enablePromise(true)

export function * initDatabase () {
  console.log('initDatabase: entered')
  let dbPassword = null
  try {
    let credentials = yield call(Keychain.getGenericPassword, { service: 'db' })
    if (!credentials || !credentials.password) {
      dbPassword = randomString(32)
      yield call(Keychain.setGenericPassword, 'db', dbPassword, { service: 'db' })
    } else {
      dbPassword = credentials.password
    }
  } catch (e) {}

  try {
    yield call(openDatabase, DATABASE_NAME, dbPassword)
  } catch (e) {
    yield call(deleteDatabase, DATABASE_NAME)
    yield call(openDatabase, DATABASE_NAME, dbPassword)
  }
  yield call(initMigrations)

  yield put(AppActions.cacheDBIsReady())
  yield spawn(listenForIsEmailPlatformUserAndCache, db)
}

export { db, executeSql }
