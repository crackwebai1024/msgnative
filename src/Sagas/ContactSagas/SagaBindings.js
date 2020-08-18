import { isNil } from 'ramda'
import { select, takeLatest } from 'redux-saga/effects'

import Actions, { ContactTypes } from 'commons/Redux/ContactRedux'
import { fetch } from 'commons/Sagas/ContactSagas'
import createCacheSagaBindings from 'app/Sagas/LocalDBSagas/Lib'

import * as contactSagas from './index'

const _primaryKey = 'email'
const _extraColumns = ['display_name', 'state', 'is_msgsafe_user']

function * _getSelectColumns (payload) {
  if (!payload) {
    return [_primaryKey, ..._extraColumns, 'is_deleted']
  }
  return ['*']
}

function * _handleWhereClauseBasedOnSlice (detailPayload, whereClause = '', sqlParams = []) {
  const slice = yield select(s => s.contact)
  whereClause = whereClause ? `${whereClause} AND data IS NOT NULL` : 'WHERE data IS NOT NULL'
  if (slice.searchFilters.is_msgsafe_user && !detailPayload) {
    whereClause = `${whereClause} AND is_msgsafe_user=?`
    sqlParams.push(1)
  } else if (slice.searchFilters.state && !detailPayload) {
    whereClause = `${whereClause} AND state=?`
    sqlParams.push(slice.searchFilters.state)
  }
  return { whereClause, sqlParams }
}

export default [
  ...createCacheSagaBindings({
    resource: 'contacts',
    tableName: 'contacts_cache',
    reduxSliceKey: 'contact',
    actionTypePrefix: 'CONTACT',
    actionPrefix: 'contact',
    fetchActionTypes: [
      ContactTypes.CONTACT_SET_SEARCH_FILTERS,
      ContactTypes.TOGGLE_CONTACT_IDENTITY_FILTER,
      ContactTypes.CLEAR_CONTACT_IDENTITY_FILTER,
      ContactTypes.TOGGLE_CONTACT_MSGSAFE_USERS_FILTER,
      ContactTypes.CLEAR_CONTACT_MSGSAFE_USERS_FILTER,
      ContactTypes.CONTACT_SET_SORT_ORDER
    ],
    fetchSaga: fetch,
    apiPath: 'ContactsUniqueNative',
    apiDataKey: 'contacts',
    excludeKey: 'contact_email',
    apiOrderColumn: 'last_activity_or_modified_on',
    apiOldSyncSortOrder: 'desc',
    apiNewSyncSortOrder: 'desc',
    apiOldSyncOrderKey: 'lte_ts',
    apiNewSyncOrderKey: 'gte_ts',
    extraColumns: _extraColumns,
    primaryKey: _primaryKey,
    detailActionPrefix: 'getContactUnique',
    detailPayloadKey: 'contact_email',
    errorKey: 'failed-to-fetch-contact',
    orderByClause: 'display_name COLLATE NOCASE ASC',
    allActionTypes: ContactTypes,
    allActions: Actions,
    pushAllToRedux: false,
    checkIsSearching: slice => slice.searchFilters.is_msgsafe_user || !isNil(slice.searchFilters.state),
    getSelectColumns: _getSelectColumns,
    handleWhereClauseBasedOnSlice: _handleWhereClauseBasedOnSlice
  }),

  takeLatest(ContactTypes.CONTACT_GET_FULL_OBJECT, contactSagas.getFullContactObject)
]
