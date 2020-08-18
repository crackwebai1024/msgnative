import { call, take } from 'redux-saga/effects'

import { ChatTypes } from 'commons/Redux/ChatRedux'

import { chatAPI } from './index'

/**
 * Create contact.
 *
 * @param data
 */
export function * createContact (data) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/contact/add',
      args: data
    })
  } catch (e) {}
}

/**
 * Update contact.
 *
 * @param data
 */
export function * updateContact (data) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/contact/update',
      args: data
    })
  } catch (e) {}
}

/**
 * Delete contact.
 *
 * @param id
 */
export function * deleteContact (id) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/contact/delete',
      args: { contact_id: id }
    })
  } catch (e) {}
}

/**
 * Get all contacts.
 */
export function * getContacts (args) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  try {
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/contact/list',
      args
    })
    return res
  } catch (e) {}
}
