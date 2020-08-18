import { takeLatest } from 'redux-saga/effects'

import { IdentityTypes, IdentityAPITypesToSagas } from 'commons/Redux/IdentityRedux'
import * as identitySagas from './index'

export default [
  ...IdentityAPITypesToSagas,

  takeLatest(IdentityTypes.IDENTITY_CREATE, identitySagas.create),
  takeLatest(IdentityTypes.IDENTITY_EDIT, identitySagas.edit),
  takeLatest(IdentityTypes.IDENTITY_REMOVE, identitySagas.remove)
]
