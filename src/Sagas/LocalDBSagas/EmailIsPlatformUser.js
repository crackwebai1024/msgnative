import { call } from 'redux-saga/effects'
import { db, executeSql } from './index'

export function * getCachedEmailIsPlatformUserData () {
  console.log('getCachedEmailIsPlatformUserData: entered')
  const query = 'SELECT * FROM email_is_platform_user;'
  const rows = yield call(executeSql, db, query)
  const emailIsPlatformUserMap = {}
  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i)
    emailIsPlatformUserMap[row.email] = !!row.is_platform_user
  }
  return emailIsPlatformUserMap
}
