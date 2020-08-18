import Immutable from 'seamless-immutable'
import { uniq, without, omit, merge, path, findIndex, mapObjIndexed, isEmpty } from 'ramda'

export function mergeWithExistingData (existing, updated, keepNew = true, keepExisitng = true) {
  let _existing = existing || Immutable({})
  const _updated = updated || Immutable({})

  Object.keys(updated).forEach((key) => {
    if (_existing[key]) {
      _existing = _existing.setIn([key], _existing[key].merge(_updated[key]))
    } else if (keepNew) {
      _existing = _existing.setIn([key], _updated[key])
    }
  })

  if (keepExisitng) return _existing
  const keysToBeRemoved = Object.keys(_existing).filter(k => !_updated[k])
  return _existing.without(keysToBeRemoved)
}
/**
 * A re-usable reducers for API requests.
 *
 * Updates the progress, successfu and error flags.
 *
 *
 *
 * @param state
 * @param requestType
 * @return {*}
 */
export const dataRequestReducer = (state, { requestType }) => {
  requestType = requestType || {}

  return state.merge({
    dataRequestInProgress: true,
    dataRequestSuccessful: false,
    dataRequestError: null,
    isRefreshing: requestType.isRefreshing || false,
    isPaginating: requestType.isPaginating || false,
    isSearching: requestType.isSearching || false
  })
}

/**
 * A factory for data success reducer.
 *
 * Reason for factory: This reducer needs to update the store with the
 * response data from the API and this responseDataKey is used to lookup the
 * relevant value out from the response.
 *
 * @param responseDataKey // The top level api result key
 * @param responseDataInnerKey // The per record unique key
 * @param extraTopLevelMap // Object describing the response key => state key
 *   mapping for extra top level values that should be extracted from response
 */
export const createDataSuccessReducer = (responseDataKey, responseDataInnerKey = 'id', extraTopLevelMap = {}) => (state, { data, requestType = {}, requestTypeOverride = {} }) => {
  // data and dataOrder variables to be populated from successful API response
  const _data = {}
  const _dataOrder = []

  // Pick out the request type information
  const { isRefreshing, isPaginating, isSearching } = { ...requestType, ...requestTypeOverride }

  // Populate the data and dataOrder variables
  data[responseDataKey].map((item) => {
    const innerKey = item[responseDataInnerKey]

    if (!innerKey) {
      console.error(`INVALID responseDataInnerKey=${responseDataInnerKey}`)
      return null
    }
    _dataOrder.push(innerKey)
    _data[innerKey] = item
  })

  // Update the state (common keys)
  state = state.merge({
    dataRequestInProgress: false,
    dataRequestSuccessful: true,
    dataRequestError: null,
    isRefreshing: false,
    isPaginating: false,
    isSearching: false,
    lastRequestTimestamp: data.req_ts
  })

  const topLevelMerge = {}

  mapObjIndexed((reduxKey, responseKey) => {
    topLevelMerge[reduxKey] = data[responseKey]
  }, extraTopLevelMap)

  if (!isEmpty(topLevelMerge)) {
    state = state.merge(topLevelMerge)
  }

  // Normal data fresh/re-fresh fetch
  // Overwrite existing data & dataOrder
  if ((isRefreshing || !isPaginating) && !isSearching) {
    return state.merge({
      data: mergeWithExistingData(state.data, _data, true, false),
      dataOrder: Immutable(_dataOrder),
      dataTotalCount: data.total || 0
    })

  // Search data fresh/re-fresh fetch
  } else if ((isRefreshing || !isPaginating) && isSearching) {
    return state.merge({
      searchResultsData: mergeWithExistingData(state.searchResultsData, _data, true, false),
      searchResultsDataOrder: Immutable(_dataOrder),
      searchResultsDataTotalCount: data.total || 0
    })

  // Pagination - normal
  // Merge the data
  } else if (isPaginating && !isSearching) {
    return state.merge({
      data: mergeWithExistingData(state.data, _data, true, true),
      dataOrder: Immutable(uniq((state.dataOrder || []).concat(_dataOrder || []))),
      dataTotalCount: data.total || 0
    })

  // Pagination - searching
  } else if (isPaginating && isSearching) {
    return state.merge({
      searchResultsData: mergeWithExistingData(state.searchResultsData, _data, true, true),
      searchResultsDataOrder: Immutable(uniq((state.searchResultsDataOrder || []).concat(_dataOrder || [])))
    })
  }

  return state
}

/**
 * Reusable data failure reducers.
 *
 * Updates the flags in store and the error value.
 *
 * @param state
 * @param error
 */
export const dataFailureReducer = (state, { error }) => state.merge({
  dataRequestInProgress: false,
  dataRequestSuccessful: false,
  dataRequestError: error,
  isRefreshing: false,
  isPaginating: false,
  isSearching: false
})

/**
 * Reusable reducer for setting the search query.
 *
 * Usage – to be used with an action that is dispatched
 * on every change in the search field value.
 *
 * @param state
 * @param query
 */
export const setSearchQueryReducer = (state, { query }) => state.set('searchQuery', query)

/**
 * Reusable reducer for setting search filters.
 *
 * @param state
 * @param filters
 */
export const setSearchFiltersReducer = (state, { filters }) => state.set('searchFilters', filters)

/**
 * Reusable reducer for clearing the search data (searchResultsData and searchResultsDataOrder).
 *
 * @param state
 */
export const clearSearchDataReducer = state =>
  state.merge({ searchResultsData: null, searchResultsDataOrder: null, searchQuery: null, searchResultsDataTotalCount: 0 })

/**
 * Reusable reducer for item creation success.
 *
 * @param responseDataKey
 * @param responseDataInnerKey
 * @return {*}
 */
export const createItemSuccessReducer = (responseDataInnerKey = 'id') => (state, { data }) => {
  let key = 'data'
  let orderKey = 'dataOrder'
  let totalCountKey = 'dataTotalCount'

  if (state.searchResultsData && state.searchResultsDataOrder) {
    key = 'searchResultsData'
    orderKey = 'searchResultsDataOrder'
    totalCountKey = 'searchResultsDataTotalCount'
  }

  const id = data[responseDataInnerKey]

  let _state = state
    .setIn([key, id], data)
    .set(orderKey, Immutable([id]).concat(state[orderKey] || []))
    .set(totalCountKey, state[totalCountKey] + 1)

  if (_state.cache && _state.cache[id]) {
    _state = _state.setIn(['cache', id], data)
  }
  return _state
}

/**
 * Reusable reducer for item edit success.
 *
 * @param responseDataInnerKey
 * @return {*}
 */
export const editItemSuccessReducer = (responseDataInnerKey = 'id') => (state, { data }) => {
  const key = state.searchResultsData && state.searchResultsData[data[responseDataInnerKey]] ? 'searchResultsData' : 'data'
  return state.setIn([key, data[responseDataInnerKey]], data)
}

export const createUpdateItemSuccessReducer = key => (state, { data, requestPayload = {} }) => {
  const id = data[key] || requestPayload[key]
  const dataKey = state.searchResultsData && state.searchResultsData[id] ? 'searchResultsData' : 'data'
  const current = path([dataKey, id], state)
  const updated = merge(current, data)
  return state.setIn([dataKey, id], updated)
}

export const createItemSuccessAnyKey = (responseDataKey, stateKey) => (state, { data, requestType }) => {
  const resData = data[responseDataKey]
  return state.setIn([stateKey], resData)
}

export const updateItemSuccessReducer = (state, { data }) => {
  const dataKey = state.searchResultsData && state.searchResultsData[data.id] ? 'searchResultsData' : 'data'
  const current = path([dataKey, data.id], state)
  const updated = merge(current, data)
  return state.setIn([dataKey, data.id], updated)
}

// warning: broken
// todo: fix
// not in use anywhere
export const createUpdateItemAtKeySuccessReducer = (idKey = 'id', itemUpdateKey = null, responseKey = null) => (state, { data, requestPayload = {} }) => {
  const dataKey = state.searchResultsData && state.searchResultsData[data.id] ? 'searchResultsData' : 'data'

  const id = requestPayload[idKey] || data[idKey]
  if (!id) {
    console.error(`createUpdateItemAtKeySuccessReducer – id not found`)
    return state
  }

  if (!path([dataKey, id], state)) {
    console.error(`createUpdateItemAtKeySuccessReducer – unable to find data item for id ${id}`)
    return state
  }

  const response = responseKey ? data[responseKey] : data

  if (!response) {
    console.error(`createUpdateItemAtKeySuccessReducer – unable to find response value for key ${responseKey} for id ${data.id}`)
    return state
  }

  // If server returns an array, in case of GET request,
  // just set the array response on the key
  if (response instanceof Array) {
    return state.setIn([dataKey, id, itemUpdateKey], response)
  }

  const current = path([dataKey, id, itemUpdateKey], state)
  if (current instanceof Array) {
    const index = findIndex(m => m.id === response.id, current)
    if (index === -1) {
      return state.setIn([dataKey, id, itemUpdateKey], current.concat(Immutable([response])))
    }
    return state.setIn([dataKey, id, itemUpdateKey, index], response)
  }

  const updated = merge(current, response)
  return state.setIn([dataKey, id, itemUpdateKey], updated)
}

/**
 * Reusable reducer for item deletion reducer.
 *
 * @param state
 * @param id
 * @param payload
 * @return {*}
 */
export const deleteItemSuccessReducer = (state, { id, payload }) => {
  if (!id) {
    if (payload && payload.id) {
      id = payload.id
    } else {
      return state
    }
  }

  let _state = state

  if (state.searchResultsData && state.searchResultsDataOrder && state.searchResultsData[id]) {
    _state = _state
      .merge({
        searchResultsData: state.searchResultsData.without(id),
        searchResultsDataOrder: without([id], state.searchResultsDataOrder),
        searchResultsDataTotalCount: state.searchResultsDataTotalCount > 0 ? state.searchResultsDataTotalCount - 1 : 0
      })
  }

  if (state.data && state.dataOrder && state.data[id]) {
    _state = _state
      .merge({
        data: state.data.without(id),
        dataOrder: without([id], state.dataOrder),
        dataTotalCount: state.dataTotalCount > 0 ? state.dataTotalCount - 1 : 0
      })
  }

  if (state.cache && state.cache[id]) {
    _state = _state
      .merge({
        cache: state.cache.without(id)
      })
  }

  // Such reducers, like Domain, has validations and details key
  if (state.details && state.details[id]) {
    _state = _state.merge({
      details: omit([String(id)], state.details)
    })
  }

  if (state.validations && state.validations[id]) {
    _state = _state.merge({
      validations: omit([String(id)], state.validations)
    })
  }

  return _state
}

/**
 * Reusable reducer for item deletion reducer which deletes record id from `dataOrder` and `searchResultsDataOrder`.
 * Usecase - when user is in `unread` tab of mailbox and opens an email. In this case, we donot want to delete the data
 *
 * @param state
 * @param id
 * @param payload
 * @return {*}
 */
export const deleteItemSuccessReducerKeppingData = (state, { id, payload }) => {
  if (!id) {
    if (payload && payload.id) {
      id = payload.id
    } else {
      return state
    }
  }

  let _state = state

  if (state.searchResultsData && state.searchResultsDataOrder && state.searchResultsData[id]) {
    _state = _state
      .merge({
        searchResultsDataOrder: without([id], state.searchResultsDataOrder),
        searchResultsDataTotalCount: state.searchResultsDataTotalCount > 0 ? state.searchResultsDataTotalCount - 1 : 0
      })
  }

  if (state.data && state.dataOrder && state.data[id]) {
    _state = _state
      .merge({
        dataOrder: without([id], state.dataOrder),
        dataTotalCount: state.dataTotalCount > 0 ? state.dataTotalCount - 1 : 0
      })
  }

  return _state
}

/**
 * Reusable reducer for bulk deletion reducer.
 *
 * @param state
 * @param selectedIds
 * @return {*}
 */
export const bulkDeleteSuccessReducer = (state, { selectedIds = [] }) => {
  let _state = state

  if (!selectedIds) return _state

  selectedIds.forEach((id) => {
    _state = deleteItemSuccessReducer(state, { id })
  })

  return _state
}

/**
 * Set the sort order.
 *
 * @param state
 * @param sortBy
 * @param orderBy
 */
export const setSortOrder = (state, { sortBy, orderBy }) => state.set('sortBy', sortBy).set('orderBy', orderBy)

/**
 * Toggle a filter id.
 *
 * @param key
 */
export const createToggleFilterIdReducer = key => (state, { id }) => {
  if (typeof id === 'string' || typeof id === 'number') {
    const index = state[key].indexOf(id)
    if (index === -1) {
      return state.set(key, state[key].concat([id]))
    }
    return state.set(key, Immutable([
      ...state[key].slice(0, index),
      ...state[key].slice(index + 1, state[key].length)
    ]))
  } else if (Array.isArray(id)) {
    return state.set(key, id)
  }
  return state
}

export const setIterationIdsReducer = (state, { id }) => {
  const dataOrder = state.searchResultsDataOrder || state.dataOrder
  if (!dataOrder || !dataOrder.length) return state

  const previousIndex = dataOrder.indexOf(parseInt(state.currentId) || state.currentId || 0)
  const currentIndex = dataOrder.indexOf(parseInt(id) || id)
  if (currentIndex === -1) return state

  let currentDirection = state.currentDirection || 1
  if (Math.abs(currentIndex - previousIndex) > 1) {
    currentDirection = currentIndex > previousIndex ? 1 : -1
  }

  let prevId = null
  let nextId = null

  if (currentIndex !== 0) {
    prevId = dataOrder[currentIndex - (1 * currentDirection)]
  }

  if (currentIndex !== (dataOrder.length - 1)) {
    nextId = dataOrder[currentIndex + (1 * currentDirection)]
  }

  return state.merge({
    nextId,
    prevId,
    currentDirection,
    currentId: id
  })
}

export const clearIterationIdsReducer = state => state.merge({ nextId: null, prevId: null })

/**
 * Clear the toggle filter ids.
 *
 * @param key
 */
export const clearToggleFilterIdReducer = key => state => state.set(key, Immutable([]))

/**
 * set `syncInitiated` to the given boolean value
 *
 * @param payload boolean, deafult `false`
 */
export const syncInitiatedReducer = (state, { payload = false }) => state.set('syncInitiated', payload)

/**
 * Auto update request.
 *
 * @param state
 */
export const syncRequestReducer = state => state.merge({
  newSyncRequestInProgress: true,
  newSyncRequestSuccessful: false,
  newSyncRequestError: null
})

/**
 * Auto update failure.
 *
 * @param state
 * @param error
 */
export const syncFailureReducer = (state, { error }) => state.merge({
  newSyncRequestInProgress: false,
  newSyncRequestSuccessful: false,
  newSyncRequestError: error
})

/**
 * Auto update success.
 *
 * @param idKey
 * @param responseKey
 * @returns {*}
 */
export const createSyncSuccessReducer = (responseKey, idKey = 'id') => (state, { data, requestType = {} }) => {
  const { isSearching = false } = requestType
  const _data = {}
  const _dataOrder = []
  const dataKey = isSearching ? 'searchResultsData' : 'data'
  const dataOrderKey = isSearching ? 'searchResultsDataOrder' : 'dataOrder'
  const dataTotalCountKey = isSearching ? 'searchResultsDataTotalCount' : 'dataTotalCount'
  let _mergeData = {
    newSyncRequestInProgress: false,
    newSyncRequestSuccessful: true,
    newSyncRequestError: null,
    lastRequestTimestamp: data.req_ts,
    [dataTotalCountKey]: data.total || state[dataTotalCountKey]
  }

  if (data && data[responseKey] && data[responseKey].length > 0) {
    data[responseKey].map((c) => {
      _data[c[idKey]] = c
      _dataOrder.push(c[idKey])
    })
    const _newDataOrder = Immutable(uniq(_dataOrder.concat(state[dataOrderKey] || [])))
    _mergeData = {
      ..._mergeData,
      [dataTotalCountKey]: data.total || _newDataOrder.length,
      [dataKey]: mergeWithExistingData(state[dataKey], _data, true, true),
      [dataOrderKey]: _newDataOrder
    }
  }

  return state.merge(_mergeData)
}

/**
 * set `oldSyncInProgress` to the given boolean value
 *
 * @param payload boolean, deafult `false`
 */
export const oldSyncInProgressReducer = (state, { payload = false }) => state.set('oldSyncInProgress', payload)

/**
 * Old Sync failure.
 *
 * @param state
 * @param error
 */
export const oldSyncFailureReducer = (state, { error }) => state.merge({
  oldSyncRequestSuccessful: false,
  oldSyncRequestError: error
})

/**
 * old sync success.
 *
 * @param idKey
 * @param responseKey
 * @returns {*}
 */
export const createOldSyncSuccessReducer = (responseKey, idKey = 'id') => (state, { data }) => {
  const _data = {}
  const _dataOrder = []
  let _mergeData = {
    oldSyncRequestSuccessful: true,
    oldSyncRequestError: null,
    lastOldSyncRequestTimestamp: data.req_ts
  }

  if (data && data[responseKey] && data[responseKey].length > 0) {
    data[responseKey].map((c) => {
      _data[c[idKey]] = c
      _dataOrder.push(c[idKey])
    })
    const _newDataOrder = Immutable(uniq(state.dataOrder.concat(_dataOrder)))
    _mergeData = {
      ..._mergeData,
      dataTotalCount: data.total || _newDataOrder.length,
      data: mergeWithExistingData(state.data, _data, true, true),
      dataOrder: _newDataOrder
    }
  }

  return state.merge(_mergeData)
}

export const createItemUpdateRequestReducer = (actionTypeInProgress) => (state, { id, payload }) => {
  if (!id) {
    if (payload && (payload.id || payload.email)) {
      id = payload.id || payload.email
    } else {
      return state
    }
  }
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  let _state = state
  if (state[key] && state[key][id]) {
    _state = state.setIn([key, id, 'actionTypeInProgress'], actionTypeInProgress)
  }

  if (state.cache && state.cache[id]) {
    _state = state.setIn(['cache', id, 'actionTypeInProgress'], actionTypeInProgress)
  }

  return _state
}

export const createItemUpdateSuccessReducer = (successReducers = []) => (state, args) => {
  if (!args.id) {
    if (args.payload && (args.payload.id || args.payload.email)) {
      args.id = args.payload.id || args.payload.email
    } else {
      return state
    }
  }
  let _state = state
  const { id } = args
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  if (state[key] && state[key][id]) {
    _state = state.setIn([key, id, 'actionTypeInProgress'], null)
  }
  if (state.cache && state.cache[id]) {
    _state = state.setIn(['cache', id, 'actionTypeInProgress'], null)
  }
  successReducers.forEach((successReducer) => {
    _state = successReducer(_state, args)
  })
  return _state
}
