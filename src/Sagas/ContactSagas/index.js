import { put, select, take } from 'redux-saga/effects'

import ContactActions, { ContactTypes } from 'commons/Redux/ContactRedux'
import { getDataItemForIdWithCacheFirst } from 'commons/Redux/_Utils'

export function * getFullContactObject ({ email, resolve, reject }) {
  const slice = yield select(s => s.contact)
  let contact = getDataItemForIdWithCacheFirst(slice, email)
  if (!contact || !contact.contacts) {
    yield put(ContactActions.contactGetFromCacheOrRequest({ search: { contact_email: email }, limit: 1 }))
    const res = yield take([
      ContactTypes.CONTACT_INSERT_SINGLE,
      ContactTypes.getContactUniqueSuccess,
      ContactTypes.getContactUniqueError
    ])
    const { data } = res
    if (data && data.contacts && data.contacts.length > 0) {
      contact = data.contacts[0]
      contact.is_msgsafe_user = !!contact.is_msgsafe_user
    } else {
      const requestPayload = { search: { contact_email: email }, limit: 1 }
      contact = {
        email,
        display_name: email,
        is_deleted: true,
        is_msgsafe_user: false
      }
      yield put(ContactActions.contactInsertSingle({ contacts: [contact] }, requestPayload))
    }
  }
  typeof resolve === 'function' && resolve(contact)
}
