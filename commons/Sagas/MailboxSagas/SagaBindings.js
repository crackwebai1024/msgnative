import { takeLatest } from 'redux-saga/effects'

import MailboxActions, { MailboxTypes, MailboxAPITypesToSagas } from 'commons/Redux/MailboxRedux'

import * as mailboxSagas from './index'

export default [
  ...MailboxAPITypesToSagas,
  ...mailboxSagas.mailboxActionSagas,

  // takeLatest(MailboxTypes.MAILBOX_DETAIL_REQUEST, mailboxSagas.fetchMailboxDetail),
  takeLatest(MailboxTypes.MAILBOX_DETAIL_REQUEST, mailboxSagas.fetchMailboxMIME),
  takeLatest(MailboxTypes.MAILBOX_ANALYTICS_REQUEST, mailboxSagas.fetchMailboxAnalytics),
  takeLatest(MailboxTypes.SEND_MAIL_REQUEST, mailboxSagas.sendMail),
  takeLatest(
    MailboxTypes.MAILBOX_READ_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'mark_as_read' },
    MailboxActions.mailboxReadSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_UNREAD_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'mark_as_unread' },
    MailboxActions.mailboxUnreadSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_TRASH_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'trash' },
    MailboxActions.mailboxTrashSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_UNTRASH_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'untrash' },
    MailboxActions.mailboxUntrashSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_DELETE_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'delete' },
    MailboxActions.mailboxDeleteSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_ARCHIVE_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'archive' },
    MailboxActions.mailboxArchiveSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_UNARCHIVE_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'unarchive' },
    MailboxActions.mailboxUnarchiveSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_MOVE_TO_INBOX_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'move_to_inbox' },
    MailboxActions.mailboxMoveToInboxSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_SEND_QUEUED_REQUEST,
    mailboxSagas.updateMailbox,
    { action: '2factor_confirm' },
    MailboxActions.mailboxSendQueuedSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_CLEAR_TRASH_REQUEST,
    mailboxSagas.updateMailbox,
    { action: 'clear_trash' },
    MailboxActions.mailboxClearTrashSuccess
  ),

  /* ------------ Mailbox Multiselect Sagas ------- */
  takeLatest(
    MailboxTypes.MAILBOX_TRASH_SELECTED_REQUEST,
    mailboxSagas.updateSelectedEmails,
    { action: 'trash' },
    MailboxActions.mailboxTrashSelectedSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_ARCHIVE_SELECTED_REQUEST,
    mailboxSagas.updateSelectedEmails,
    { action: 'archive' },
    MailboxActions.mailboxArchiveSelectedSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_READ_SELECTED_REQUEST,
    mailboxSagas.updateSelectedEmails,
    { action: 'mark_as_read' },
    MailboxActions.mailboxReadSelectedSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_UNREAD_SELECTED_REQUEST,
    mailboxSagas.updateSelectedEmails,
    { action: 'mark_as_unread' },
    MailboxActions.mailboxUnreadSelectedSuccess
  ),
  takeLatest(
    MailboxTypes.MAILBOX_DELETE_SELECTED_REQUEST,
    mailboxSagas.updateSelectedEmails,
    { action: 'delete' },
    MailboxActions.mailboxDeleteSelectedSuccess
  )
]
