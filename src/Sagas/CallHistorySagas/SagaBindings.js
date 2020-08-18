import { select } from 'redux-saga/effects'
import Actions, { CallHistoryTypes } from 'commons/Redux/CallHistoryRedux'
import { callHistoryFetch } from 'commons/Sagas/CallHistorySagas'
import createCacheSagaBindings from 'app/Sagas/LocalDBSagas/Lib'
import { uuidv1ToDate } from 'commons/Lib/Utils'

function * _shouldRequestWhenSearching () {
  return false // first fetch is_missed from cache and accoring to cache total count, check if API is necessary
}

function * _processDataBeforeCaching (data) {
  return data.map((d) => ({
    ...d,
    created_on: uuidv1ToDate(d.call_id).toISOString()
  }))
}

function * _handleWhereClauseBasedOnSlice (detailPayload, whereClause = '', sqlParams = []) {
  const slice = yield select(s => s.callHistory)
  whereClause = whereClause ? `${whereClause} AND data IS NOT NULL` : 'WHERE data IS NOT NULL'
  if (slice.searchFilters.is_missed) {
    whereClause = `${whereClause} AND is_missed=?`
    sqlParams.push(1)
  }
  return { whereClause, sqlParams }
}

export default [
  ...createCacheSagaBindings({
    resource: 'calls',
    tableName: 'call_history_cache',
    reduxSliceKey: 'callHistory',
    actionTypePrefix: 'CALL_HISTORY',
    actionPrefix: 'callHistory',
    fetchActionTypes: [
      CallHistoryTypes.CALL_HISTORY_SET_SEARCH_QUERY,
      CallHistoryTypes.CALL_HISTORY_CLEAR_SEARCH_DATA,
      CallHistoryTypes.CALL_HISTORY_SET_IS_MISSED_FILTER,
      CallHistoryTypes.CALL_HISTORY_CLEAR_IS_MISSED_FILTER
    ],
    fetchSaga: callHistoryFetch,
    useWebsocket: true,
    apiPath: '/webrtc/list',
    apiDataKey: 'calls',
    apiOldSyncOrderKey: 'lte_ts',
    apiNewSyncOrderKey: 'gte_ts',
    extraColumns: ['user_email', 'contact_user_email', 'contact_user_display_name', 'is_missed'],
    primaryKey: 'call_id',
    errorKey: 'failed-to-fetch-call-history',
    orderByClause: 'created_on DESC',
    allActionTypes: CallHistoryTypes,
    allActions: Actions,
    pushAllToRedux: true,
    permanentDelete: true,
    shouldUseCacheOnNewSync: true,
    checkIsSearching: slice => slice.searchFilters.is_missed,
    shouldRequestWhenSearching: _shouldRequestWhenSearching,
    processDataBeforeCaching: _processDataBeforeCaching,
    handleWhereClauseBasedOnSlice: _handleWhereClauseBasedOnSlice
  })
]
