import { takeLatest } from 'redux-saga/effects'

import { ContactTypes, ContactAPITypesToSagas } from 'commons/Redux/ContactRedux'

import * as contactSagas from './index'

export default [
  ...ContactAPITypesToSagas,

  takeLatest(ContactTypes.CONTACT_CREATE, contactSagas.create),
  takeLatest(ContactTypes.CONTACT_EDIT, contactSagas.edit),
  takeLatest(ContactTypes.CONTACT_REMOVE, contactSagas.remove)
]
