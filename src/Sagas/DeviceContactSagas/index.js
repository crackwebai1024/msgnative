import { put, call, select, take, spawn } from 'redux-saga/effects'
import RNContacts from 'react-native-contacts'
import { splitEvery, isNil, isEmpty } from 'ramda'

import { callAPI } from 'commons/Sagas/APISagas'
import { chatAPI } from 'commons/Sagas/ChatSagas'
import { ChatTypes } from 'commons/Redux/ChatRedux'
import ContactActions from 'commons/Redux/ContactRedux'
import { createContact } from 'commons/Sagas/ChatSagas/Contact'

import DeviceContactActions from 'app/Redux/DeviceContactRedux'

import { getCachedEmailIsPlatformUserData } from '../LocalDBSagas/EmailIsPlatformUser'
import { contactsPermissionRequest } from './Permission'

const PERMISSION_AUTHORIZED = 'authorized'

// Async get of contact database
const getContactDatabase = searchQuery =>
  new Promise((resolve, reject) =>
    (searchQuery
      ? RNContacts.getContactsMatchingString(searchQuery, (err, data) => ((!err && data) ? resolve(data) : reject(err)))
      : RNContacts.getAll((err, data) => ((!err && data) ? resolve(data) : reject(err)))))

/**
 * Wired with DeviceContact actions.
 *
 * @param _requestType
 */
export function * fetch ({ requestType: _requestType }) {
  // make sure permissions are up to date in redux store
  if (typeof _requestType !== 'string' || _requestType !== 'startup') {
    yield call(contactsPermissionRequest)
  }

  // do not proceed if permission is not authorised
  const permission = yield select(s => s.deviceContact.permission)
  console.log(`fetchDeviceContacts: saved permission – `, permission)
  if (permission !== PERMISSION_AUTHORIZED) {
    yield put(DeviceContactActions.deviceContactSuccess({ contacts: [], total: 0 }, _requestType))
    return
  }

  yield put(DeviceContactActions.deviceContactRequest(_requestType))

  const slice = yield select(s => s.deviceContact)
  // console.log(`fetchDeviceContacts: device contact slice – `, slice)

  const deviceContacts = yield call(getContactDatabase, slice.searchQuery)
  console.log(`fetchDeviceContacts: fetched device contacts – `, deviceContacts.length)
  const emailIsPlatformUserMap = yield call(getCachedEmailIsPlatformUserData)
  const data = yield call(processContacts, deviceContacts, emailIsPlatformUserMap, !!slice.searchQuery)

  yield put(DeviceContactActions.deviceContactSuccess({ contacts: data, total: data.length }, _requestType))
}

/**
 * Iterates over the contact object received from native lib
 * and prepares object for storage in redux store.
 *
 * Takes emailIsPlatformUserMap and uses it to set appropriate
 * value on is_msgsafe_user.
 *
 * @param contacts
 * @param emailIsPlatformUserMap
 * @param isSearchData
 * @returns {Array}
 */
function * processContacts (contacts, emailIsPlatformUserMap, isSearchData) {
  const allContacts = []
  const toBeCheckedContacts = {}
  const allDeviceContact = yield select(s => s.deviceContact.data)

  contacts.map((contact) => {
    // Return if contact has no email addresses
    if (!contact.emailAddresses.length) return
    // Find the display name for the contact
    let name = [
      contact.givenName,
      contact.middleName,
      contact.familyName
    ].filter(a => a).join(' ') || contact.company

    // If no display name could be found, use first email address
    if (!name && contact.emailAddresses.length) {
      name = contact.emailAddresses[0].email
    }

    // Check if any email address on the contact is platform user
    let isPlatformUser = false
    // Also check and set is_msgsafe_user for individual email addresses
    contact.emailAddresses.map((e, i) => {
      const email = e.email.toLowerCase()

      if (emailIsPlatformUserMap[email]) {
        contact.emailAddresses[i].is_msgsafe_user = true
        isPlatformUser = true
      }

      if (isNil(emailIsPlatformUserMap[email])) {
        toBeCheckedContacts[email] = {
          display_name: (name || '').trim(),
          id: contact.recordID,
          contact
        }
      }
    })

    const record = {
      ...contact,
      id: contact.recordID,
      is_msgsafe_user: isPlatformUser,
      display_name: (name || '').trim()
    }

    if (isSearchData && allDeviceContact[contact.recordID] && allDeviceContact[contact.recordID].thumbnailPath) {
      record.thumbnailPath = allDeviceContact[contact.recordID].thumbnailPath
    }

    allContacts.push(record)
  })

  if (!isEmpty(toBeCheckedContacts)) {
    yield spawn(checkContacts, toBeCheckedContacts)
  }

  return allContacts
}

export function * checkContacts (contacts) {
  // Create email lists in batches of 20
  try {
    for (const emails of splitEvery(20, Object.keys(contacts))) {
      // Batch check which of the email addresses are msgsafe user
      const userCheckRes = yield call(callAPI, 'ChatMemberBatch', { emails })

      // Update redux store for email addresses that are msgsafe users
      for (const e of userCheckRes.data.emails) {
        yield put(DeviceContactActions.deviceContactEmailIsMsgsafeUser(contacts[e].id, e, true))
      }

      const dataToBeCached = emails.map(e => ({
        is_msgsafe_user: userCheckRes.data.emails.indexOf(e) !== -1,
        email: e
      }))

      yield put(yield put(ContactActions.cacheIsEmailPlatformUser(dataToBeCached)))

      if (!chatAPI.ready) {
        yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
      }

      // Update record on cassandra for all emails
      // for (const f of emails) {
      //   const c = contacts[f]
      //   yield spawn(createContact, {
      //     display_name: c.display_name,
      //     email: f,
      //     is_msgsafe_user: userCheckRes.data.emails.indexOf(f) !== -1,
      //     device_data: c.contact
      //   })
      // }
    }
  } catch (e) {}
}
