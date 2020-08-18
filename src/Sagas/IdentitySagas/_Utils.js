import { put, select, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'
// import faker from 'faker' // install faker to run the code --> yarn add faker

import Actions from 'commons/Redux/IdentityRedux'

/**
 * create new identities automatically
 * TO BE USED ONLY FOR TEST PURPOSE
 */
export function * createRandomIdentities () {
  let i = 0
  const identites = yield select(s => s.identity.dataOrder)
  if (!identites || !identites.length) {
    yield delay(10000)
    yield fork(createRandomIdentities)
    return
  }
  // Note: There's a cap limit of `five` identities for FREE accounts.
  while (i <= 1000) {
    const displayName = faker.name.findName()
    const email = `${faker.name.firstName()}@stage.msgsafe.io`
    const payload = { display_name: displayName, email: email, region: 'cw' }
    yield put(Actions.identityCreate(payload))
    yield delay(2000)
    i += 1
  }
}
