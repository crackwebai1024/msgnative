import { put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { isLoggedIn } from 'commons/Selectors/User'
import MailboxActions from 'commons/Redux/MailboxRedux'

import { refreshUser } from './UserSagas'

export function * mailboxTotalsUpdate () {
  const user = yield select(s => s.user)
  if (!isLoggedIn(user)) return
  yield delay(2000)
  yield put(MailboxActions.drawerTotalsRequest())
}

export function * userTotalsUpdate () {
  const user = yield select(s => s.user)
  if (!isLoggedIn(user)) return
  yield delay(2000)
  yield call(refreshUser)
}
