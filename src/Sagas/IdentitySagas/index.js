import { put } from 'redux-saga/effects'
import IdentityActions from 'commons/Redux/IdentityRedux'

export function * sendWelcomeLetters (r) {
  try {
    const identityId = r.data.id
    yield put(IdentityActions.identitySendWelcomeRequest({ id: identityId }))
  } catch (e) {}
}
