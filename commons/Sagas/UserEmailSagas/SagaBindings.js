import { takeLatest } from 'redux-saga/effects'
import { UserEmailTypes, UserEmailAPITypesToSagas } from 'commons/Redux/UserEmailRedux'

import * as useremailSagas from './index'

export default [
  ...UserEmailAPITypesToSagas,

  takeLatest(UserEmailTypes.USEREMAIL_CREATE, useremailSagas.create),
  takeLatest(UserEmailTypes.USEREMAIL_EDIT, useremailSagas.edit),
  takeLatest(UserEmailTypes.USEREMAIL_REMOVE, useremailSagas.remove),
  takeLatest(UserEmailTypes.USEREMAIL_REQUEST_CONFIRMATION, useremailSagas.requestConfirmation),
  takeLatest(UserEmailTypes.USEREMAIL_SET_DEFAULT, useremailSagas.setDefault)
]
