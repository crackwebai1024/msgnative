import { put, take, select, race, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import m from 'commons/I18n/'
import { formatMessage } from 'commons/I18n/sagas'
import NotificationActions from 'commons/Redux/NotificationRedux'
import MailboxActions, { MailboxTypes } from 'commons/Redux/MailboxRedux'
import { fetchMailbox } from 'commons/Sagas/MailboxSagas'
import { UserTypes } from 'commons/Redux/UserRedux'

export function * sendMailError ({ error }) {
  console.log('sendMailError - ', error)
  const message = yield formatMessage(m.native.Mailbox.failedToSendEmail)
  yield put(NotificationActions.displayNotification(message, 'danger', 3000))
}

export function * multiselectNotifications (successStr, notificationType, { selectedIds, showNotification = true }) {
  if (!showNotification) return
  let messageId = ''
  const multi = selectedIds.length > 1

  switch (successStr) {
    case 'trash':
      messageId = multi ? m.native.Mailbox.mailPluralToTrash : m.native.Mailbox.oneMailToTrash
      break
    case 'archived':
      messageId = multi ? m.native.Mailbox.mailPluralArchived : m.native.Mailbox.oneMailArchived
      break
    case 'read':
      messageId = multi ? m.native.Mailbox.mailPluralRead : m.native.Mailbox.oneMailRead
      break
    case 'unread':
      messageId = multi ? m.native.Mailbox.mailPluralUnread : m.native.Mailbox.oneMailUnread
      break
    case 'deleted':
      messageId = multi ? m.native.Mailbox.mailPluralDeleted : m.native.Mailbox.oneMailDeleted
      break
  }
  const emailsMessage = yield formatMessage(messageId, { emailCount: selectedIds.length })
  yield put(NotificationActions.displayNotification(
    emailsMessage,
    notificationType,
    3000
  ))
}

export function * ensureFreshInbox () {
  while (true) {
    yield take(MailboxTypes.SET_MAILBOX_FILTER)
    yield take([
      MailboxTypes.MAILBOX_MOVE_TO_INBOX_SUCCESS,
      MailboxTypes.MAILBOX_UNARCHIVE_SUCCESS
    ])
    yield take(MailboxTypes.CLEAR_MAILBOX_FILTER)
    yield put(MailboxActions.mailboxForceRefresh())
  }
}

/**
 * This saga is executed after user completes education flow on signup.
 * It is possible that by the time user completes the education flow, the mailbox state is empty.
 * This saga starts the mailbox sync process -- syncs new emails periodically
 */
export function * ensureWelcomeEmailsAutoFetch () {
  const { logout } = yield race({
    d: delay(500),
    logout: take(UserTypes.LOGOUT)
  })
  if (logout) {
    console.log('ensureWelcomeEmailsAutoFetch: user logged out. Exiting...')
    return
  }

  const emailIds = yield select(s => s.mailbox.dataOrder)
  if (emailIds && emailIds.length) {
    console.log('ensureWelcomeEmailsAutoFetch: emails already exist. Exiting...')
    return
  }
  console.log('ensureWelcomeEmailsAutoFetch: fetching new emails')
  yield fork(fetchMailbox, { requestType: { isRefreshing: true } })
}
