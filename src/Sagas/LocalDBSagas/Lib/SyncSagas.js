import { call, cancel, put, fork, race, select, spawn, take, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import * as R from 'ramda'
import moment from 'moment'

import { callAPI } from 'commons/Sagas/APISagas'
import { chatAPI } from 'commons/Sagas/ChatSagas'
import { isLoggedIn } from 'commons/Selectors/User'
import { ChatTypes } from 'commons/Redux/ChatRedux'
import { UserTypes } from 'commons/Redux/UserRedux'
import { AppTypes } from 'commons/Redux/AppRedux'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

import { db } from 'app/Sagas/LocalDBSagas'
import * as commonCacheSagas from './CommonCacheSagas'
import cacheConfig from './SyncConfig'

/**
 * returns latest record's max_ts
 * @param {Array|Object} data list of records
 */
function _getLatestRecordTimestamp (data, isOrderTimestampBased = true, apiOrderColumn = null) {
  if (!data || R.isEmpty(data)) return null
  let dataArr = data
  if (typeof data === 'object') {
    dataArr = Object.keys(data).map(k => data[k])
  }

  if (isOrderTimestampBased) {
    // find the maximum of created_on, last_activity_on and modified_on. Save it in `max_ts`
    dataArr = dataArr.map((row) => {
      const createdOn = moment.utc(row.created_on).unix()
      const lastActivityOn = row.last_activity_on ? moment.utc(row.last_activity_on).unix() : createdOn
      const modifiedOn = row.modified_on ? moment.utc(row.modified_on).unix() : createdOn
      const max = Math.max(createdOn, lastActivityOn, modifiedOn)
      return {
        ...row,
        max_ts: moment.unix(max).utc().format('YYYY-MM-DDTHH:mm:ss.SSS')
      }
    })
  }

  const key = isOrderTimestampBased ? 'max_ts' : apiOrderColumn

  dataArr = R.sortBy(R.prop(key))(dataArr)

  return dataArr[dataArr.length - 1].max_ts
}

/**
 * returns sync saga types for caching a particular resource
 * @param {Object} configuration
 * *
 */
function createSyncSagas ({
  resource, tableName, reduxSliceKey, allActions, allActionTypes, actionPrefix, useWebsocket = false,
  actionTypePrefix, fetchSaga, apiPath, apiDataKey, apiOldSyncSortOrder, apiNewSyncSortOrder, excludeKey,
  apiOrderColumn, apiOldSyncOrderKey, apiNewSyncOrderKey, isOrderTimestampBased = true, primaryKey, errorKey,
  processDataBeforeCaching
}) {
  const DELAY_ON_API_FAILURE = 5000
  const _config = cacheConfig[resource]
  const cacheEnabled = _config.cacheEnabled
  const enableNewSync = _config.enableNewSync
  const OLD_SYNC_DELAY = _config.oldSyncDelay
  const NEW_SYNC_DELAY = _config.newSyncDelay
  const SYNC_LIMIT = 50

  function * syncDataRequest ({ old = false, isRefreshing = false, firstFetch = false }) {
    if (!cacheEnabled) {
      yield spawn(fetchSaga, { requestType: { isRefreshing } })
      return
    }
    const payload = { limit: SYNC_LIMIT }
    if (!useWebsocket) {
      payload.order = apiOrderColumn
      payload.sort = old ? apiOldSyncSortOrder : apiNewSyncSortOrder
    }
    if (!firstFetch && !isRefreshing) {
      // fetch modified_on date to be applied from sqlite
      const orderKey = old ? apiOldSyncOrderKey : apiNewSyncOrderKey
      let orderValue = null

      orderValue = yield call(
        commonCacheSagas.getSyncStatisticsTimestamp,
        tableName,
        resource,
        old,
        isOrderTimestampBased,
        apiOrderColumn
      )
      orderValue = orderValue === 'null' ? null : orderValue

      // if (!orderValue && old) return
      if (orderValue) {
        payload[orderKey] = orderValue
        if (isOrderTimestampBased && !useWebsocket) {
          const excludeRows = yield call(commonCacheSagas.getRecodsWithTS, tableName, orderValue)
          if (excludeRows.length >= SYNC_LIMIT) {
            const excludeIds = excludeRows.map(r => r[primaryKey])
            payload.exclude = JSON.stringify({ [excludeKey]: excludeIds })
          }
        }
      } else if (!useWebsocket) {
        // no orderValue means there is no data available. to fetch the latest data use the `apiNewSyncSortOrder` value.
        payload.sort = apiNewSyncSortOrder
      }

      if (!old) {
        yield put(allActions[`${actionPrefix}SyncRequest`]())
      }
    } else {
      yield put(allActions[`${actionPrefix}Request`]({}))
    }

    try {
      const request = useWebsocket
        ? [[chatAPI, chatAPI.sendRequest], {
          cmd: apiPath,
          args: payload
        }] : [callAPI, apiPath, payload]
      const response = yield call(...request)
      const data = useWebsocket ? response : response.data

      if (processDataBeforeCaching && typeof processDataBeforeCaching === 'function') {
        data[apiDataKey] = yield call(processDataBeforeCaching, data[apiDataKey])
      }

      if (!old && isOrderTimestampBased) {
        data.req_ts = _getLatestRecordTimestamp(data[apiDataKey])
      }

      const successActionCreator = allActions[`${actionPrefix}SuccessForCache`]

      yield put(successActionCreator(data, { paginateNew: !old && !firstFetch, paginateOld: !!old, isRefreshing }))
      return data
    } catch (e) {
      let errorActionCreator = old ? allActions[`${actionPrefix}OldSyncFailure`] : allActions[`${actionPrefix}SyncFailure`]
      if (firstFetch) {
        errorActionCreator = allActions[`${actionPrefix}Failure`]
      }
      const err = getError(e, yield formatMessage(m[errorKey]))
      yield put(errorActionCreator(err))
    }
  }

  /**
   * Saga used to force refresh the data
   */
  function * forceRefresh () {
    yield put(allActions[`${actionPrefix}Request`]({ isRefreshing: true }))
    yield call(syncDataRequest, { isRefreshing: true })
  }

  function * syncNewDataPeriodically () {
    while (true) {
      yield delay(NEW_SYNC_DELAY)
      const data = yield call(syncDataRequest, {})
      if (data && cacheEnabled) {
        yield call(commonCacheSagas.updateStatisticsRecord, tableName, resource, false, primaryKey, data[apiDataKey], isOrderTimestampBased, apiOrderColumn)
      } else if (!data && cacheEnabled) {
        yield delay(DELAY_ON_API_FAILURE)
      }
    }
  }

  function * syncOldDataPeriodically () {
    try {
      yield put(allActions[`${actionPrefix}SetOldSyncInProgress`](true))

      while (true) {
        yield delay(OLD_SYNC_DELAY)

        const data = yield call(syncDataRequest, { old: true })
        // check for valid response. data will null/undefined when api fails
        if (data && data[apiDataKey]) {
          // check if more sync is needed using the data
          if (!data[apiDataKey].length) break

          if (data) {
            yield take(allActionTypes[`${actionTypePrefix}_FETCH_FROM_CACHE`])
            yield call(commonCacheSagas.updateStatisticsRecord, tableName, resource, true, primaryKey, data[apiDataKey], isOrderTimestampBased, apiOrderColumn)
          }

          if (data[apiDataKey].length < SYNC_LIMIT) break
        } else {
          yield delay(DELAY_ON_API_FAILURE)
        }
      }
    } finally {
      yield put(allActions[`${actionPrefix}SetOldSyncInProgress`](false))
    }
  }

  function * prepareDbForDataSync () {
    const stats = yield call(commonCacheSagas.getStatisticsRecord, resource)
    if (isOrderTimestampBased) {
      const newTs = stats.last_new_sync_ts ? moment.utc(stats.last_new_sync_ts) : null
      const oldTs = stats.last_old_sync_ts ? moment.utc(stats.last_old_sync_ts) : null
      const isInvalid = (newTs && !newTs.isValid()) || (oldTs && !oldTs.isValid())
      if (isInvalid) {
        yield call(commonCacheSagas.updateStatsWithMinMaxTimestampValues, resource, tableName)
      }
    }
  }

  function * syncPeriodically () {
    const slice = yield select(s => s[reduxSliceKey])

    if (!slice.dataOrder || !slice.dataOrder.length) {
      const cacheTotalCount = cacheEnabled ? yield call(commonCacheSagas.getTotalCacheCount, tableName) : 0
      if (cacheTotalCount > 0) {
        // If react-native, dispatch xFetchFromCache
        // so that redux store can be populated with data
        // from SQLite cache.
        yield put(allActions[`${actionPrefix}FetchFromCache`]({}))
      } else {
        // if no Data available in SQLite cache, fetch initial data
        const data = yield call(syncDataRequest, { firstFetch: true })
        if (data && cacheEnabled) {
          yield call(commonCacheSagas.updateStatisticsRecord, tableName, resource, false, primaryKey, data[apiDataKey], isOrderTimestampBased, apiOrderColumn)
          yield call(commonCacheSagas.updateStatisticsRecord, tableName, resource, true, primaryKey, data[apiDataKey], isOrderTimestampBased, apiOrderColumn)
        } else if (!data && cacheEnabled) {
          yield delay(DELAY_ON_API_FAILURE)
        }
      }
      yield delay(OLD_SYNC_DELAY)
    }
    if (cacheEnabled) {
      yield fork(syncOldDataPeriodically)
    }
    if (enableNewSync) {
      yield fork(syncNewDataPeriodically)
    }
  }

  function * initSync () {
    let user = yield select(s => s.user)
    if (!isLoggedIn(user)) return

    // initiate the sync process
    const reduxSlice = yield select(s => s[reduxSliceKey])
    if (reduxSlice.syncInitiated) return

    yield put(allActions[`${actionPrefix}SetSyncInitiated`](true))

    if (cacheEnabled) {
      if (!db) {
        yield take(AppTypes.CACHE_D_B_IS_READY)
      }
      yield call(prepareDbForDataSync)
    }

    if (useWebsocket && !chatAPI.ready) {
      yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
    }

    const isOnline = yield select(s => s.app.isNetworkOnline)

    if (!isOnline) {
      while (true) {
        const { networkState } = yield take(AppTypes.SET_NETWORK_STATE)
        if (networkState) break
      }
    }

    user = yield select(s => s.user)
    if (!isLoggedIn(user)) return

    const syncTask = yield fork(syncPeriodically)
    const { networkStateChanged, disconnected } = yield race({
      logout: take(UserTypes.LOGOUT),
      networkStateChanged: take(AppTypes.SET_NETWORK_STATE),
      disconnected: take(ChatTypes.CHAT_SOCKET_DISCONNECTED)
    })

    yield cancel(syncTask)
    yield put(allActions[`${actionPrefix}SetSyncInitiated`](false))

    if (networkStateChanged && (!useWebsocket || !disconnected)) {
      if (!networkStateChanged.networkState) {
        while (true) {
          const { networkState } = yield take(AppTypes.SET_NETWORK_STATE)
          if (networkState) break
        }
      }
    }

    if (disconnected || networkStateChanged) {
      yield spawn(initSync)
    }
  }

  const sagas = [
    takeLatest(AppTypes.READY_FOR_SYNC, initSync),
    takeLatest(allActionTypes[`${actionTypePrefix}_FORCE_REFRESH`], forceRefresh)
  ]

  return sagas
}

export default createSyncSagas
