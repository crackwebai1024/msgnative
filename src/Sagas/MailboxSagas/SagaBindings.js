import { put, takeLatest, select } from 'redux-saga/effects'
import { reduce } from 'ramda'

import { StartupTypes } from 'commons/Redux/StartupRedux'
import Actions, { MailboxTypes, FILTER_PARAMS } from 'commons/Redux/MailboxRedux'
import { fetchMailbox } from 'commons/Sagas/MailboxSagas'
import createCacheSagaBindings from 'app/Sagas/LocalDBSagas/Lib'

import * as mailboxSagas from './index'
import * as mailboxCacheSagas from './cacheSagas'

function * _handleWhereClauseBasedOnSlice (detailPayload, whereClause = '', sqlParams = []) {
  if (detailPayload) return { whereClause, sqlParams }

  const slice = yield select(s => s.mailbox)

  const filters = FILTER_PARAMS[slice.filterName] || FILTER_PARAMS.all
  const filterString = reduce((s, k) => s ? `${s} AND ${k}=?` : `${k}=?`, '', Object.keys(filters))
  whereClause = whereClause ? `${whereClause} AND ${filterString}` : `WHERE ${filterString}`
  const params = Object.keys(filters).map(k => {
    const shouldCast = ['string', 'number'].indexOf(typeof filters[k]) === -1
    if (!shouldCast) return filters[k]
    return filters[k] ? 1 : 0
  })
  sqlParams = sqlParams.concat(params)

  const filterIdentityIds = slice.filterIdentityIds || []
  if (filterIdentityIds.length > 0) {
    const identitySlice = yield select(s => s.identity)
    const allIdentities = { ...(identitySlice.data || {}), ...(identitySlice.searchResultsData || {}) }
    let emails = []
    filterIdentityIds.forEach((id) => {
      const identity = allIdentities[id]
      if (!identity) return
      emails.push(identity.email)
    })
    const emailQuestionMarks = emails.map(() => '?').join(', ')
    const identityFilterString = `msg_from IN (${emailQuestionMarks}) OR msg_to IN (${emailQuestionMarks})`
    sqlParams = sqlParams.concat(emails, emails)
    whereClause = whereClause ? `${whereClause} AND (${identityFilterString})` : `WHERE (${identityFilterString})`
  }
  return { whereClause, sqlParams }
}

function * _handleGetDataTotal (currentTotal, isSearching, payload) {
  const slice = yield select(s => s.mailbox)
  if (!isSearching && slice.searchResultsData) {
    yield put(Actions.mailboxClearSearchData())
  }
  const totals = slice.drawerTotals

  if (isSearching || payload || !totals) return currentTotal
  return totals[`total_is_${slice.filterName || 'inbox'}`] || currentTotal
}

function * _shouldRequestWhenSearching () {
  const slice = yield select(s => s.mailbox)
  return !!slice.searchQuery || slice.filterIdentityIds.length > 0 || slice.filterDomainIds.length > 0
}

export default [
  takeLatest(StartupTypes.STARTUP, mailboxSagas.ensureFreshInbox),

  takeLatest(MailboxTypes.SEND_MAIL_ERROR, mailboxSagas.sendMailError),
  takeLatest(MailboxTypes.MAILBOX_WELCOME_EMAILS_REQUEST, mailboxSagas.ensureWelcomeEmailsAutoFetch),

  // multiselect success notifications
  takeLatest(
    MailboxTypes.MAILBOX_TRASH_SELECTED_SUCCESS,
    mailboxSagas.multiselectNotifications,
    'trash',
    'danger'
  ),
  takeLatest(
    MailboxTypes.MAILBOX_ARCHIVE_SELECTED_SUCCESS,
    mailboxSagas.multiselectNotifications,
    'archived',
    'info'
  ),
  takeLatest(
    MailboxTypes.MAILBOX_READ_SELECTED_SUCCESS,
    mailboxSagas.multiselectNotifications,
    'read',
    'info'
  ),
  takeLatest(
    MailboxTypes.MAILBOX_UNREAD_SELECTED_SUCCESS,
    mailboxSagas.multiselectNotifications,
    'unread',
    'info'
  ),
  takeLatest(
    MailboxTypes.MAILBOX_DELETE_SELECTED_SUCCESS,
    mailboxSagas.multiselectNotifications,
    'deleted',
    'danger'
  ),

  ...createCacheSagaBindings({
    resource: 'mailbox',
    tableName: 'mailbox_cache',
    reduxSliceKey: 'mailbox',
    actionTypePrefix: 'MAILBOX',
    actionPrefix: 'mailbox',
    fetchActionTypes: [
      MailboxTypes.SET_MAILBOX_FILTER,
      MailboxTypes.CLEAR_MAILBOX_FILTER,
      MailboxTypes.TOGGLE_MAILBOX_IDENTITY_FILTER,
      MailboxTypes.CLEAR_MAILBOX_IDENTITY_FILTER,
      // MailboxTypes.TOGGLE_MAILBOX_DOMAIN_FILTER,
      // MailboxTypes.CLEAR_MAILBOX_DOMAIN_FILTER,
      MailboxTypes.CLEAR_ALL_MAILBOX_RELATION_FILTERS,
      MailboxTypes.TOGGLE_UNREAD_FILTER,
      MailboxTypes.MAILBOX_SET_SORT_ORDER
    ],
    fetchSaga: fetchMailbox,
    apiPath: 'Mailbox',
    apiDataKey: 'emailevents',
    excludeKey: 'id',
    apiOrderColumn: 'modified_on',
    apiOldSyncSortOrder: 'desc',
    apiNewSyncSortOrder: 'desc',
    apiOldSyncOrderKey: 'lte_ts',
    apiNewSyncOrderKey: 'gte_ts',
    extraColumns: [
      'msg_from', 'msg_from_displayname', 'msg_to', 'msg_to_displayname', 'msg_subject', 'msg_length', 'treatment',
      'is_archive', 'is_trash', 'is_read', 'direction', 'is_msgsafe_store'
    ],
    primaryKey: 'id',
    detailActionPrefix: null,
    detailPayloadKey: null,
    errorKey: 'failed-to-fetch-mailbox',
    orderByClause: 'created_on DESC',
    allActionTypes: MailboxTypes,
    allActions: Actions,
    pushAllToRedux: false,
    permanentDelete: true,
    shouldUseCacheOnNewSync: true,
    checkIsSearching: slice => !!slice.filterName || !!slice.unreadOnlyFilter || (slice.filterIdentityIds || []).length > 0,
    handleWhereClauseBasedOnSlice: _handleWhereClauseBasedOnSlice,
    shouldRequestWhenSearching: _shouldRequestWhenSearching,
    handleGetDataTotal: _handleGetDataTotal
  }),

  takeLatest(MailboxTypes.MAILBOX_CLEAR_TRASH_SUCCESS, mailboxCacheSagas.clearTrash),
  takeLatest(MailboxTypes.MAILBOX_DELETE_SELECTED_SUCCESS, mailboxCacheSagas.deleteSelected)
]
