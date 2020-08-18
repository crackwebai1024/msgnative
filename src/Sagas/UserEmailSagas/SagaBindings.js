import { select } from 'redux-saga/effects'
import Actions, { UserEmailTypes } from 'commons/Redux/UserEmailRedux'
import { fetch } from 'commons/Sagas/UserEmailSagas'
import createCacheSagaBindings from 'app/Sagas/LocalDBSagas/Lib'

function * _handleWhereClauseBasedOnSlice (detailPayload, whereClause = '', sqlParams = []) {
  const slice = yield select(s => s.useremail)
  if (slice.searchFilters.is_confirmed && !detailPayload) {
    whereClause = whereClause ? `${whereClause} AND is_confirmed=?` : 'WHERE is_confirmed=?'
    sqlParams.push(1)
  }
  return { whereClause, sqlParams }
}

export default [
  ...createCacheSagaBindings({
    resource: 'user_emails',
    tableName: 'user_emails_cache',
    reduxSliceKey: 'useremail',
    actionTypePrefix: 'USEREMAIL',
    actionPrefix: 'useremail',
    fetchActionTypes: [
      UserEmailTypes.USEREMAIL_SET_SORT_ORDER,
      UserEmailTypes.USEREMAIL_SET_IS_CONFIRMED_FILTER
    ],
    fetchSaga: fetch,
    apiPath: 'UserEmail',
    apiDataKey: 'useremails',
    excludeKey: 'useremail_id',
    apiOrderColumn: 'last_activity_or_modified_on',
    apiOldSyncSortOrder: 'desc',
    apiNewSyncSortOrder: 'desc',
    apiOldSyncOrderKey: 'lte_ts',
    apiNewSyncOrderKey: 'gte_ts',
    extraColumns: ['email', 'display_name', 'is_confirmed'],
    primaryKey: 'id',
    detailActionPrefix: 'getUserEmail',
    detailPayloadKey: 'email',
    errorKey: 'failed-to-fetch-user-emails',
    orderByClause: 'max_ts DESC',
    allActionTypes: UserEmailTypes,
    allActions: Actions,
    pushAllToRedux: true,
    checkIsSearching: slice => slice.searchFilters.is_confirmed,
    handleWhereClauseBasedOnSlice: _handleWhereClauseBasedOnSlice
  })
]
