import { select, put } from 'redux-saga/effects'

import { isLoggedIn } from 'commons/Selectors/User'
import StartupActions from 'commons/Redux/StartupRedux'

export function * startup () {
  try {
    const userData = yield select(s => s.user)

    if (isLoggedIn(userData)) {
      // ax.service.identify(userData.data.mp)
      // ax.service.people.set('Last Activity', new Date())
    }

    yield put(StartupActions.startupSuccess())
  } catch (e) {
    console.error(e.message)
  }
}
