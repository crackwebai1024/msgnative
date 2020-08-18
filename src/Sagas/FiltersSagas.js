import { put, select } from 'redux-saga/effects'
import ContactActions from 'commons/Redux/ContactRedux'
import MailboxActions from 'commons/Redux/MailboxRedux'

export function * clearFiltersSaga ({ routeName }) {
  const nav = yield select(s => s.nav)
  if (nav.hasOwnProperty('previousRouteName') && nav['previousRouteName']) {
    switch (nav['previousRouteName']) {
      case 'MailboxList':
        yield put(MailboxActions.mailboxClearSearchData())
        break
      case 'ContactList':
        yield put(ContactActions.contactClearSearchData())
        break
    }
  }
}
