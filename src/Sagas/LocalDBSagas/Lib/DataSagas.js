import { take, call, put, select, spawn, fork, takeLatest } from 'redux-saga/effects'
import moment from 'moment'
import { path, isNil, isEmpty, reduce, range } from 'ramda'
import { decode as utf8decode, encode as utf8encode } from 'app/Lib/UTF8'
import base64 from 'base-64'

import { UserTypes } from 'commons/Redux/UserRedux'
import { AppTypes } from 'commons/Redux/AppRedux'
import { db, executeSql } from 'app/Sagas/LocalDBSagas'
import * as commonCacheSagas from './CommonCacheSagas'
import cacheConfig from './SyncConfig'

const LIMIT = 30
const SYNC_STATISTICS_TABLE_NAME = 'sync_statistics'

/**
 * returns sync saga types for caching a particular resource
 * @param {Object} configuration
 * *
 * *
 */
function createDataCacheSagas ({
  resource, tableName, reduxSliceKey, allActions, allActionTypes, actionTypePrefix, actionPrefix, fetchActionTypes, fetchSaga, apiDataKey,
  extraColumns, primaryKey, orderByClause, detailActionPrefix, detailPayloadKey, pushAllToRedux, handleWhereClauseBasedOnSlice, checkIsSearching,
  handleGetDataTotal, shouldRequestWhenSearching, getSelectColumns, shouldUseCacheOnNewSync = false, permanentDelete = false
}) {
  const _config = cacheConfig[resource]
  const cacheEnabled = _config.cacheEnabled

  /**
   * litens for `X_SUCCESS_FOR_CACHE` action and updates sqlite cache
   */
  function * listenForDataSuccessAndCache () {
    yield take(AppTypes.CACHE_D_B_IS_READY)
    console.log(`listenForDataSuccessAndCache: entered for resource ${resource}`)
    while (true) {
      const { data, requestType } = yield take(allActionTypes[`${actionTypePrefix}_SUCCESS_FOR_CACHE`])

      yield spawn(executeCacheQuery, data, requestType)
    }
  }

  /**
   * updates the cache
   * @param {Object} data list
   * @param {Object} requestType
   * @param {Object} payload consists search query -- only in case of details fetch
   */
  function * executeCacheQuery (data, requestType, payload) {
    // execute sqlite db sync only if cache is enabled
    if (cacheEnabled) {
      console.log(`executeCacheQuery: entered for resource ${resource} with data –`, data)
      const ids = data[apiDataKey].map(c => c[primaryKey])
      const questionMarks = reduce((s) => s ? `${s}, ?` : '?', '', data[apiDataKey])
      const getQuery = `SELECT ${primaryKey}, data FROM ${tableName} WHERE ${primaryKey} IN (${questionMarks});`
      let existingRecordResults = yield call(executeSql, db, getQuery, ids)

      const existingRecords = {}

      range(0, existingRecordResults.length).forEach((i) => {
        const d = existingRecordResults.item(i)
        existingRecords[d[primaryKey]] = d
      })

      let nonExistingParams = []
      let nonExistingCount = 0

      for (const c of data[apiDataKey]) {
        const encodedData = base64.encode(utf8encode(JSON.stringify(c)))
        const existingRecord = existingRecords[c[primaryKey]]

        if (existingRecord && existingRecord.data === encodedData && existingRecord.is_deleted === 0) {
          console.info(`executeCacheQuery: already existing cache for ${resource}: `, c[primaryKey], ' doing nothing')
          continue
        }

        const createdOn = moment(c.created_on).unix()
        const lastActivityOn = c.last_activity_on ? moment(c.last_activity_on).unix() : null
        const modifiedOn = c.modified_on ? moment(c.modified_on).unix() : null
        const maxTs = Math.max(createdOn, lastActivityOn, modifiedOn)
        if (!existingRecord) {
          nonExistingCount += 1
          const params = [
            c[primaryKey],
            ...extraColumns.map(col => c[col]),
            encodedData,
            createdOn,
            lastActivityOn,
            modifiedOn,
            maxTs
          ]
          nonExistingParams = nonExistingParams.concat(params)
        } else {
          const columnsToUpdate = extraColumns.map(f => `${f}=?, `).join('')
          const query = `
            UPDATE ${tableName}
            SET ${columnsToUpdate}
                created_on=?,
                last_activity_on=?,
                modified_on=?,
                max_ts=?,
                data=?,
                is_deleted=?
            WHERE ${primaryKey}=?;
          `
          const params = [
            ...extraColumns.map(col => c[col]),
            createdOn,
            lastActivityOn,
            modifiedOn,
            maxTs,
            encodedData,
            0,
            c[primaryKey]
          ]
          try {
            console.info(`executeCacheQuery: updated cache for ${resource}: `, c[primaryKey])
            yield call(executeSql, db, query, params)
          } catch (e) { console.log('executeCacheQuery: error – ', e) }
        }
      }

      if (nonExistingCount > 0) {
        const dynamicColumns = [primaryKey, ...extraColumns]
        const extraValues = dynamicColumns.map(() => '?, ').join('')
        const singleRowColumnsStr = `(${dynamicColumns.join(', ')}, data, created_on, last_activity_on, modified_on, max_ts)`

        const singleRowValuesStr = `(${extraValues} ?, ?, ?, ?, ?)`
        const allRows = reduce((s, d) => s ? `${s}, ${singleRowValuesStr}` : `${singleRowValuesStr}`, '', range(0, nonExistingCount))

        const query = `INSERT INTO ${tableName} ${singleRowColumnsStr} VALUES ${allRows};`
        try {
          console.info(`executeCacheQuery: created ${nonExistingCount} cache records for ${resource}`)
          yield call(executeSql, db, query, nonExistingParams)
        } catch (e) { console.log('executeCacheQuery: error – ', e) }
      }
    }

    yield put(allActions[`${actionPrefix}FetchFromCache`](requestType, data, payload))
  }

  /**
   * - if state[reduxSliceKey].data.length < LIMIT, select `LIMIT - LENGTH` more records sorted by `orderByClause`
   * - if state[reduxSliceKey].data.length > LIMIT, returns list of records which are present in both `dataArr` param and in `state[reduxSliceKey].data`
   * @param {Array} dataArr list of data
   */
  function * getRecordsToBeUpdatedOnSyncSuccess (dataArr = []) {
    if (pushAllToRedux) return dataArr
    const slice = yield select(s => s[reduxSliceKey])
    const dataToUpdate = slice.data ? dataArr.filter(c => !!slice.data[c[primaryKey]]) : []
    const length = slice.dataOrder ? slice.dataOrder.length : 0

    if (dataArr.length !== dataToUpdate.length && length < LIMIT) {
      const recordsLeft = slice.data ? dataArr.filter(c => !slice.data[c[primaryKey]]) : dataArr
      const ids = recordsLeft.map(c => c[primaryKey])
      const questionMarks = reduce((s) => s ? `${s}, ?` : '?', '', recordsLeft)
      const _limit = LIMIT - length
      const query = `
        SELECT * from ${tableName} WHERE ${primaryKey} in (${questionMarks})
        ORDER BY ${orderByClause}
        LIMIT ${_limit};
      `
      const results = yield call(executeSql, db, query, ids)
      range(0, results.length).forEach(i => dataToUpdate.push(results.item(i)))
    }
    return dataToUpdate
  }

  /**
   * performs actions and/or updated redux state based on values of `requestType` and `payload
   * @param {Object} requestType
   * @param {Object} dataFromAPI api response
   * @param {Object} payload consists search query -- only in case of detail fetch
   */
  function * fetchFromcache ({ requestType = {}, dataFromAPI, payload = null }) {
    console.log(`fetchFromcache: entered for resource ${resource}`)

    // when user force refreshes the list and dataFromAPI is `undefined`, immediately fetch new updates
    // -- which would already be happening in the background, but is invoked periodically with some delay
    if (requestType.isRefreshing && !dataFromAPI && !requestType.isSearching) {
      yield put(allActions[`${actionPrefix}ForceRefresh`]())
      return
    }

    // if cache is not enabled and `dataFromAPI` is undefined, simply call the fetch api -- which handles user action; and return
    if (!cacheEnabled && !dataFromAPI) {
      if (payload) {
        yield put(allActions[`${detailActionPrefix}Request`](payload))
      } else {
        yield spawn(fetchSaga, { requestType })
      }
      return
    } else if (dataFromAPI && !cacheEnabled) {
      // if `dataFromAPI` is not null and cache is disabled, dispatch data success action and return
      yield put(allActions[`${actionPrefix}Success`](dataFromAPI, requestType, {}))
      return
    }

    if (!db) {
      return
    }

    if (requestType.paginateNew && !requestType.isRefreshing && !shouldUseCacheOnNewSync) {
      const recordsToUpdate = yield call(getRecordsToBeUpdatedOnSyncSuccess, dataFromAPI[apiDataKey])
      yield put(allActions[`${actionPrefix}SyncSuccess`]({ ...dataFromAPI, [apiDataKey]: recordsToUpdate }))
      return
    } else if (requestType.paginateOld) {
      // TODO: execute current state query from cache and update the redux store -- decide according to current redux state
      return
    }
    const slice = yield select(s => s[reduxSliceKey])

    // payload param will be available only in case of fetching a single record
    if (payload && detailActionPrefix && slice.api[detailActionPrefix].inProgress) {
      return
    }

    let offset = 0
    let whereClause = ''
    let _sqlParams = []
    const searchFields = [primaryKey, ...extraColumns]
    const searchWhereClause = `WHERE (${searchFields.map(c => `${c} LIKE ?`).join(' OR ')})`
    let _limit = LIMIT

    const isSearching = !!(slice.searchQuery || checkIsSearching(slice, payload)) && !payload
    const dataOrderKey = isSearching ? 'searchResultsDataOrder' : 'dataOrder'
    const dataOrder = path([dataOrderKey], slice)

    if (requestType.isPaginating) {
      offset = path(['length'], dataOrder) || 0
    }

    // if cache is used for all sync, execute the query with full limit
    if (shouldUseCacheOnNewSync) {
      offset = 0
      _limit = path([dataOrderKey, 'length'], slice) || _limit

      if (requestType.isPaginating) {
        if (_limit % LIMIT > 0) {
          _limit += (LIMIT - (_limit % LIMIT))
        } else {
          _limit += LIMIT
        }
      }
      // set limit to max of redux count and `LIMIT` to handle mailbox cases when user switches amongst filters.
      // suppose `mailbox.unread` tab has 4 records and `mailbox.trash` tab has 50 records,
      // so when the user swtiches from `unread` to `trash` tabs,
      // only 4 records would have been fetched if the below line wasnt there.
      _limit = Math.max(_limit, LIMIT)
    }

    if (slice.searchQuery) {
      const q = slice.searchQuery.toLowerCase()
      whereClause = searchWhereClause
      _sqlParams = searchFields.map(() => `%${q}%`)
    }

    if (isSearching && !!dataFromAPI && !shouldUseCacheOnNewSync) {
      offset = 0
      _limit = path([dataOrderKey, 'length'], slice) || _limit
      if (_limit % LIMIT > 0) {
        _limit = _limit + (LIMIT - (_limit % LIMIT))
      }
    }

    // if user mannually refreshed the page and dataFromAPI is not `null` then re-render the list
    if (requestType.isRefreshing && requestType.paginateNew && !!dataFromAPI) {
      offset = 0
      _limit = path([dataOrderKey, 'length'], slice) || _limit
      requestType.isRefreshing = false // reset it to avoid updating it in redux state
    }

    // when fetching a single record
    if (payload && payload.search && payload.search[detailPayloadKey]) {
      _limit = 1
      const searchText = payload.search[detailPayloadKey]
      whereClause = searchWhereClause
      _sqlParams = searchFields.map(() => `%${searchText}%`)
    }

    if (typeof handleWhereClauseBasedOnSlice === 'function') {
      const _res = yield call(handleWhereClauseBasedOnSlice, payload, whereClause, _sqlParams)
      whereClause = _res.whereClause
      _sqlParams = _res.sqlParams
    }
    if (!payload) {
      whereClause = whereClause ? `${whereClause} AND is_deleted=?` : 'WHERE is_deleted=?'
      _sqlParams.push(0)
    }

    let selectColumns = ['*']

    if (getSelectColumns && typeof getSelectColumns === 'function') {
      selectColumns = yield call(getSelectColumns, payload)
    }
    const query = `
      SELECT ${selectColumns.join(', ')} FROM ${tableName}
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT ${_limit}
      OFFSET ${offset};
    `
    const rows = yield call(executeSql, db, query, _sqlParams)
    const data = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i)
      // console.log('row - ', row)
      try {
        const decodedData = row.data ? utf8decode(base64.decode(row.data)) : '{}'
        delete row.data
        data.push({ ...row, ...JSON.parse(decodedData), is_deleted: row.is_deleted === 1 })
      } catch (e) {
        // TODO: re-visit the logic
        // yield call(executeSql, db, `DELETE FROM ${tableName};`)
        // yield call(fetchFromcache, { requestType, dataFromAPI })
        continue
      }
    }

    const cacheTotalCount = yield call(commonCacheSagas.getTotalCacheCount, tableName, whereClause, _sqlParams)
    let totalCount = dataFromAPI ? dataFromAPI.total : cacheTotalCount

    if (!isSearching) {
      if (requestType.paginateNew && dataFromAPI) {
        const countOfNewRecords = dataFromAPI[apiDataKey].filter(c => dataOrder && dataOrder.indexOf(c[primaryKey]) === -1).length
        totalCount = slice.dataTotalCount + countOfNewRecords
      }
      totalCount = Math.max(totalCount, slice.dataTotalCount)
    }

    if (handleGetDataTotal && typeof handleGetDataTotal === 'function') {
      totalCount = yield handleGetDataTotal(totalCount, isSearching, payload)
    }

    let isAPIRequestNecessary = isSearching

    if (shouldRequestWhenSearching && typeof shouldRequestWhenSearching === 'function') {
      isAPIRequestNecessary = yield call(shouldRequestWhenSearching)
    }

    // if `isAPIRequestNecessary` is `false` and is paginating, check if
    // - the `offset` required is greater than the `cacheTotalCount`, or
    // - the difference between the `cacheTotalCount` and the `offset` is less than `LIMIT`
    // if the value of `cacheTotalCount` - `offset` slightly more than `LIMIT`,
    // then the api call would happen on the next scroll.
    // For example, if the differnece is 20 and the limit is 15 -- then the api call would happen on the  next scroll action
    if (requestType.isPaginating && !isAPIRequestNecessary && !payload && !slice.dataRequestInProgress) {
      isAPIRequestNecessary = (
        ((offset >= cacheTotalCount) || (cacheTotalCount - offset < LIMIT)) &&
        (cacheTotalCount < slice[isSearching ? 'searchResultsDataTotalCount' : 'dataTotalCount'])
      )
    } else if (isEmpty(requestType) && !totalCount && !dataFromAPI) {
      isAPIRequestNecessary = true
      yield put(allActions[`${actionPrefix}Request`]({}))
    }

    // If there isn't any data from API, then override the request type
    // flags with the ones from request;  i.e., if the request is in
    // progress, we don't want success action to reset the flags
    const requestTypeOverride = dataFromAPI || (offset < cacheTotalCount) ? {} : {
      dataRequestInProgress: true,
      dataRequestSuccessful: false,
      dataRequestError: null,
      ...requestType,
      isPaginating: data.length > 0 || requestType.isPaginating
    }

    if (isSearching) {
      requestTypeOverride.isSearching = true
    }

    if (!payload) {
      yield put(allActions[`${actionPrefix}Success`](
        { [apiDataKey]: data, total: totalCount, req_ts: dataFromAPI && dataFromAPI.req_ts },
        requestType,
        // If there isn't any data from API, then override the request type
        // flags with the ones from request;  i.e., if the request is in
        // progress, we don't want success action to reset the flags
        requestTypeOverride
      ))
    } else if (payload && !dataFromAPI) {
      // if fetching a single record, dispatch api success and request details
      if (totalCount > 0) {
        yield put(allActions[`${actionPrefix}InsertSingle`]({ [apiDataKey]: data, total: totalCount }, payload))
      }
      const isOnline = yield select(s => s.app.isNetworkOnline)
      if (isOnline) {
        yield put(allActions[`${detailActionPrefix}Request`](payload))
      }
      return
    }

    const shouldCallAPI = !isNil(requestType) && (!isEmpty(requestType) || !isEmpty(requestTypeOverride)) && !dataFromAPI && isAPIRequestNecessary
    if (shouldCallAPI) {
      yield spawn(fetchSaga, { requestType })
    }
  }

  /**
   * updates cache on detail fetch success
   * @param {Object} data conists of single record
   * @param {Object} requestPayload consists search query
   */
  function * updateCacheFromDetail ({ data, requestPayload }) {
    if (!cacheEnabled) return
    yield executeCacheQuery(data, {}, requestPayload)
  }

  /**
   * deletes from sqlite db
   * @param {*} id primaryKey value
   */
  function * removeFromCache ({ id, ids }) {
    if (!cacheEnabled) return
    console.log(`removeFromCache: entered for resource ${resource}`)
    if (!db) {
      yield take(AppTypes.CACHE_D_B_IS_READY)
    }
    const allIds = ids || [id]
    const questionMarks = reduce((s) => s ? `${s}, ?` : '?', '', allIds)
    if (permanentDelete) {
      yield call(executeSql, db, `DELETE FROM ${tableName} WHERE ${primaryKey} IN (${questionMarks});`, allIds)
    } else {
      yield call(executeSql, db, `UPDATE ${tableName} SET is_deleted=? WHERE ${primaryKey} IN (${questionMarks});`, [1, ...allIds])
    }
  }

  /**
   * updates the new change in cache and forcefully performs `refresh` action
   * @param {Object} data newly created / updated data
   */
  function * updateOrCreateInCache ({ data }) {
    if (!cacheEnabled) return
    yield spawn(executeCacheQuery, { [apiDataKey]: [data], total: 1 }, { isRefreshing: true })
  }

  /**
   * reset data cache and sync state
   */
  function * resetCache () {
    console.log(`resetCache: entered for resource ${resource}`)

    if (!db) {
      yield take(AppTypes.CACHE_D_B_IS_READY)
    }

    yield call(executeSql, db, `DELETE FROM ${tableName};`)
    yield call(executeSql, db, `DELETE FROM ${SYNC_STATISTICS_TABLE_NAME} WHERE resource=?`, [resource])
  }

  const createActionType = allActionTypes[`${actionTypePrefix}_CREATE_SUCCESS`]
  const updateActionType = allActionTypes[`${actionTypePrefix}_EDIT_SUCCESS`]
  const deleteActionType = allActionTypes[`${actionTypePrefix}_REMOVE_SUCCESS`] || allActionTypes[`${actionTypePrefix}_DELETE_SUCCESS`]

  const sagas = [
    fork(listenForDataSuccessAndCache),
    takeLatest(
      [
        allActionTypes[`${actionTypePrefix}_FETCH`],
        allActionTypes[`${actionTypePrefix}_SET_SEARCH_QUERY`],
        allActionTypes[`${actionTypePrefix}_FETCH_FROM_CACHE`],
        ...fetchActionTypes
      ],
      fetchFromcache
    ),

    takeLatest(
      [
        UserTypes.LOGOUT,
        AppTypes.ENSURE_DATA_CLEAN_UP_ON_LOGOUT
      ],
      resetCache
    )
  ]

  if (detailActionPrefix) {
    sagas.push(takeLatest(allActionTypes[`${detailActionPrefix}Success`], updateCacheFromDetail))
  }

  if (allActionTypes[`${actionTypePrefix}_GET_FROM_CACHE_OR_REQUEST`]) {
    sagas.push(takeLatest(allActionTypes[`${actionTypePrefix}_GET_FROM_CACHE_OR_REQUEST`], fetchFromcache))
  }

  if (createActionType) {
    sagas.push(takeLatest(createActionType, updateOrCreateInCache))
  }

  if (updateActionType) {
    sagas.push(takeLatest(updateActionType, updateOrCreateInCache))
  }

  if (deleteActionType) {
    sagas.push(takeLatest(deleteActionType, removeFromCache))
  }

  return sagas
}

export default createDataCacheSagas
