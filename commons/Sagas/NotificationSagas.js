import { put } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import NotificationActions from 'commons/Redux/NotificationRedux'

export function * handleNotificationTimeout ({ timeout }) {
  if (typeof timeout !== 'number') {
    return
  }

  yield delay(timeout)
  yield put(NotificationActions.hideNotification())
}
