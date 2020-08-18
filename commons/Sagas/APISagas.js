import { put, select, call } from 'redux-saga/effects'
import { merge, isNil, isEmpty, path } from 'ramda'

import m from 'commons/I18n/'
import { formatMessage } from 'commons/I18n/sagas'
import UserActions from 'commons/Redux/UserRedux'
import { msgsafeAPICall } from 'commons/Services/API/MsgSafeAPI'

export const cfg = {
  httpUrl: 'https://api7.msgsafe.io/api/v3.0.1',
  // httpUrl: 'https://api.msgsafe.io/api/v3.0.1',
  protocol: 'api'
}

if (process.env.NODE_ENV === 'production') {
  cfg.httpUrl = 'https://api.msgsafe.io/api/v3.0.1'

  // use api6 when on react-native
  if (typeof document === 'undefined') {
    cfg.httpUrl = 'https://api6.msgsafe.io/api/v3.0.1'
  }

  // adjust API url when webapp is accessed via tor network
  if (typeof window !== 'undefined' && path(['location', 'hostname'], window) === 'hm3ts5s2tgymp5i3.onion') {
    cfg.httpUrl = 'http://m6fczoad5kzd4akw.onion/api/v3.0.1'
  }
}

const BASE_PAYLOAD = {
  order: 'last_activity_on',
  sort: 'desc',
  limit: 15
}

const REQUEST_TYPE = {
  isRefreshing: false,
  isPaginating: false,
  isSearching: false
}

/**
 * A wrapper saga around the API calls that checks the HTTP status code
 * and throws an error if <200 or >=400.
 *
 * Useful to avoid repeating the same status code check in every API call.
 *
 * @param endpoint
 * @param payload
 * @return {*}
 */
export function * callAPI (endpoint, payload) {
  try {
    const isNativeAndNotOnline = yield select(s => s.device.isReactNative && !s.app.isNetworkOnline)
    if (isNativeAndNotOnline) {
      const message = yield formatMessage(m.app.APIErrors['connect-to-internet-and-retry'])
      const error = { message, offline: true }
      throw error
    }

    const response = yield call(msgsafeAPICall, endpoint, payload)
    if (!response || response.error) {
      if (response && response.http_code === 401) {
        console.info('401 – logging out')
        yield put(UserActions.logoutRequest())
      }
      const err = response && response.error ? response.error : null
      throw err
    }

    if (response.http_code >= 200 && response.http_code < 400) {
      return response
    }
  } catch (e) {
    if (e) {
      if (e.status === 401) {
        console.info('401 – logging out')
        yield put(UserActions.logoutRequest())
      }

      throw e
    } else {
      const error = yield formatMessage(m.app.Common.emptyResponseError)
      throw new Error(error)
    }
  }
}

/**
 * A generic pagination function for each saga/api code path
 *
 * @param requestType
 * @param searchConfig
 * @param stateKey
 * @param ClearSearchDataPtr
 * @param filterConfig
 * @param basePayloadOverride
 */
export function * buildApiReadPayload (
  requestType = {},
  searchConfig = {},
  stateKey = null,
  ClearSearchDataPtr = null,
  filterConfig = [],
  basePayloadOverride = {}
) {
  if (!stateKey) {
    throw new Error('invalid stateKey')
  }

  if (!ClearSearchDataPtr) {
    throw new Error('invalid ClearSearchDataPtr')
  }

  // Pull the base payload
  const payload = merge(BASE_PAYLOAD, basePayloadOverride)

  // Form a complete requestType object
  requestType = merge(REQUEST_TYPE, requestType)

  // Get the relevant data from state for building payload
  // const data = yield select(getDataForPayloadFromState, stateKey)
  const data = yield select(s => s[stateKey])
  const dataAvailableCount = data.dataOrder && data.dataOrder.length
  const searchResultsDataAvailableCount = data.searchResultsDataOrder && data.searchResultsDataOrder.length

  // Flag to track whether a request is necessary
  let isRequestUnnecessary = false

  // Apply filters
  if (filterConfig && filterConfig.length > 0) {
    payload.include_group = []
  }

  for (const f of filterConfig) {
    if (data[f.stateKey] && data[f.stateKey].length > 0) {
      if (!payload.include_group) {
        payload.include_group = []
      }

      payload.include_group.push({
        [f.payloadKey]: data[f.stateKey].asMutable()
      })
      requestType.isSearching = true
    }
  }

  // Apply order and sort
  if (data.orderBy !== payload.order) {
    payload.order = data.orderBy
    requestType.isSearching = true
  }

  if (data.sortBy !== payload.sort) {
    payload.sort = data.sortBy
    requestType.isSearching = true
  }

  // Generic search from searchConfig
  // TODO: add option for toggling strict, loose match etc.
  if (data.searchQuery) {
    const _query = `%${data.searchQuery}%`

    const apiSearchPayload = {}
    for (const colindex in searchConfig.columns) {
      const colkey = searchConfig.columns[colindex]
      apiSearchPayload[colkey] = _query
    }
    payload[searchConfig.type] = apiSearchPayload
    requestType.isSearching = true
  }

  if (data.searchFilters && !isEmpty(data.searchFilters)) {
    requestType.isSearching = true
    payload.filter = merge(payload.filter, data.searchFilters)
  }

  // Apply offset
  if (requestType.isPaginating) {
    // If search query is there and available search data is not complete
    if (requestType.isSearching && searchResultsDataAvailableCount < data.searchResultsDataTotalCount) {
      payload.offset = searchResultsDataAvailableCount

    // Else if available data is not complete
    } else if (dataAvailableCount < data.dataTotalCount) {
      payload.offset = dataAvailableCount
    }
  }

  // If not currently searching but some search results data is available
  // then clear the search data
  if (!requestType.isSearching && !isNil(searchResultsDataAvailableCount)) {
    yield put(ClearSearchDataPtr())

    // Mark the request as unncessary since the normal data can be rendered
    // with the existing data
    if (dataAvailableCount > 0) {
      isRequestUnnecessary = true
    }
  }

  return {
    payload,
    requestType,
    isRequestUnnecessary
  }
}
