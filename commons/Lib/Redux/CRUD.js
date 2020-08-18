import {
  dataRequestReducer,
  createDataSuccessReducer,
  dataFailureReducer,
  clearSearchDataReducer,
  setSearchQueryReducer,
  setSearchFiltersReducer,
  setSortOrder,
  setIterationIdsReducer,
  clearIterationIdsReducer,
  createItemSuccessReducer,
  editItemSuccessReducer,
  deleteItemSuccessReducer,
  syncInitiatedReducer,
  syncRequestReducer,
  syncFailureReducer,
  oldSyncInProgressReducer,
  oldSyncFailureReducer,
  createOldSyncSuccessReducer,
  createSyncSuccessReducer,
  createItemUpdateSuccessReducer,
  createItemUpdateRequestReducer
} from './reducers'

// Generic fetch
const DATA_COLUMN = 'data'
const REQUEST_COLUMN = 'requestType'
const REQUEST_COLUMN_OVERRIDE = 'requestTypeOverride'
const ERROR_COLUMN = 'error'
const SEARCH_QUERY_COLUMN = 'query'
const SEARCH_FILTERS_COLUMN = 'filters'
const SORT_COLUMN = 'sortBy'
const ORDER_COLUMN = 'orderBy'
const ITERATION_IDENTIFIER_COLUMN = 'id'

// Generic create
const PAYLOAD_COLUMN = 'payload'
const REQUEST_RESOLVE = 'resolve'
const REQUEST_REJECT = 'reject'

export const ITEM_UPDATE_TYPES = {
  REMOVE: 'REMOVE'
}

export const BASE_STATE_API_RESPONSE = {
  dataRequestInProgress: false,
  dataRequestSuccessful: false,
  dataRequestError: null,

  syncInitiated: false,
  newSyncRequestInProgress: false,
  newSyncRequestSuccessful: true,
  newSyncRequestError: null,

  oldSyncInProgress: false,
  oldSyncRequestSuccessful: false,
  oldSyncRequestError: null,

  data: null,
  dataOrder: null,
  dataTotalCount: 0,
  syncDataPendingCount: 0,

  searchResultsData: null,
  searchResultsDataOrder: null,
  searchResultsDataTotalCount: 0,

  cache: {},

  isRefreshing: false,
  isPaginating: false,
  isSearching: false,

  searchQuery: null,
  searchFilters: {},

  orderBy: 'last_activity_on',
  sortBy: 'desc',

  nextId: null,
  prevId: null,

  lastRequestTimestamp: null
}

/**
 * baseActionsReadApi
 *
 * param @p: string (typePrefix)
 */
export const baseActionsReadApi = (p = null) => {
  p = p || 'UNKNOWN'

  return {
    [`${p}Fetch`]: [REQUEST_COLUMN],
    [`${p}Request`]: [REQUEST_COLUMN],
    [`${p}Success`]: [DATA_COLUMN, REQUEST_COLUMN, REQUEST_COLUMN_OVERRIDE],
    [`${p}Failure`]: [ERROR_COLUMN],

    // Auto update new records
    [`${p}SetSyncInitiated`]: [PAYLOAD_COLUMN],
    [`${p}SyncRequest`]: null,
    [`${p}SyncSuccess`]: [DATA_COLUMN, REQUEST_COLUMN],
    [`${p}SyncFailure`]: [ERROR_COLUMN],

    // Auto update old records
    [`${p}SetOldSyncInProgress`]: [PAYLOAD_COLUMN],
    [`${p}OldSyncSuccess`]: [DATA_COLUMN],
    [`${p}OldSyncFailure`]: [ERROR_COLUMN],

    // Clear search data
    [`${p}ClearSearchData`]: null,

    // Set search query
    [`${p}SetSearchQuery`]: [SEARCH_QUERY_COLUMN],

    // Set search filters
    [`${p}SetSearchFilters`]: [SEARCH_FILTERS_COLUMN],

    // Set sort order
    [`${p}SetSortOrder`]: [SORT_COLUMN, ORDER_COLUMN],

    // Manage iteration ids
    [`${p}SetIterationIds`]: [ITERATION_IDENTIFIER_COLUMN],
    [`${p}ClearIterationIds`]: null
  }
}

/**
 * baseActionsWriteApi
 *
 * param @p: string (typePrefix)
 */
export const baseActionsWriteApi = (p = null) => {
  p = p || 'UNKNOWN'

  return {
    [`${p}Create`]: [PAYLOAD_COLUMN, REQUEST_RESOLVE, REQUEST_REJECT],
    [`${p}CreateSuccess`]: [DATA_COLUMN],
    [`${p}Edit`]: [PAYLOAD_COLUMN, REQUEST_RESOLVE, REQUEST_REJECT],
    [`${p}EditSuccess`]: [DATA_COLUMN],
    [`${p}Remove`]: [PAYLOAD_COLUMN, REQUEST_RESOLVE, REQUEST_REJECT],
    [`${p}RemoveSuccess`]: ['id', PAYLOAD_COLUMN], // `PAYLOAD_COLUMN` column is for extra info
    [`${p}RemoveFailure`]: ['id', PAYLOAD_COLUMN]
  }
}

/**
 * base Init for common read code path from API
 *
 * @param Prefix
 * @param Types
 * @param DataKey
 * @param DataInnerKey
 * @param extraTopLevelMap
 */
export const baseApiReadReducerInit = (Prefix = null, Types, DataKey, DataInnerKey = 'id', extraTopLevelMap = null) => {
  const r = {}
  const p = Prefix + [Types[Prefix]]

  r[`${p}REQUEST`] = dataRequestReducer
  r[`${p}SUCCESS`] = createDataSuccessReducer(DataKey, DataInnerKey, extraTopLevelMap)
  r[`${p}FAILURE`] = dataFailureReducer
  r[`${p}SET_SYNC_INITIATED`] = syncInitiatedReducer
  r[`${p}SYNC_REQUEST`] = syncRequestReducer
  r[`${p}SYNC_FAILURE`] = syncFailureReducer
  r[`${p}SYNC_SUCCESS`] = createSyncSuccessReducer(DataKey, DataInnerKey)
  r[`${p}SET_OLD_SYNC_IN_PROGRESS`] = oldSyncInProgressReducer
  r[`${p}OLD_SYNC_FAILURE`] = oldSyncFailureReducer
  r[`${p}OLD_SYNC_SUCCESS`] = createOldSyncSuccessReducer(DataKey, DataInnerKey)
  r[`${p}CLEAR_SEARCH_DATA`] = clearSearchDataReducer
  r[`${p}SET_SEARCH_QUERY`] = setSearchQueryReducer
  r[`${p}SET_SEARCH_FILTERS`] = setSearchFiltersReducer
  r[`${p}SET_SORT_ORDER`] = setSortOrder
  r[`${p}SET_ITERATION_IDS`] = setIterationIdsReducer
  r[`${p}CLEAR_ITERATION_IDS`] = clearIterationIdsReducer

  return r
}

/**
 * base Init for common write code path from API
 *
 */
export const baseApiWriteReducerInit = (Prefix = null, Types, DataInnerKey = 'id') => {
  const r = {}
  const p = Prefix + [Types[Prefix]]
  // Note: intentionally leaving out CREATE
  r[`${p}CREATE_SUCCESS`] = createItemSuccessReducer(DataInnerKey)
  r[`${p}EDIT_SUCCESS`] = editItemSuccessReducer(DataInnerKey)
  r[`${p}REMOVE`] = createItemUpdateRequestReducer(ITEM_UPDATE_TYPES.REMOVE)
  r[`${p}REMOVE_SUCCESS`] = createItemUpdateSuccessReducer([deleteItemSuccessReducer])
  r[`${p}REMOVE_FAILURE`] = createItemUpdateSuccessReducer([])

  return r
}
