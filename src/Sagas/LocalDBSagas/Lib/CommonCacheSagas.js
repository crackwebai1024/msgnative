import { call } from 'redux-saga/effects'
import base64 from 'base-64'
import { reduce } from 'ramda'
import moment from 'moment'

import { decode as utf8decode } from 'app/Lib/UTF8'

import { db, executeSql } from '../index'

const SYNC_STATISTICS_TABLE_NAME = 'sync_statistics'

/* UTIL SAGAS */

/**
 * returns latest-maximum / oldest-minimum of modified_on and last_activity_on timestamp based on the whereClause
 * @param {String} tableName table name
 * @param {boolean} oldest whether to return oldest timestamp
 * @param {String} whereClause where condition -- to query only relevant data
 * @param {Array} params values in where clause
 */
function * _getLatestOrOldestTimestampFromCache (tableName, oldest = false, whereClause = '', params = [], isOrderTimestampBased = true, orderColumn = null) {
  const order = oldest ? 'ASC' : 'DESC'
  if (!isOrderTimestampBased) {
    const query = `
      SELECT * FROM ${tableName}
      ${whereClause}
      ORDER BY ${orderColumn} ${order}
      LIMIT 1;
    `
    const rows = yield call(executeSql, db, query, params)
    const row = rows.item(0)
    return row ? row[orderColumn] : null
  }

  const query = `
    SELECT * FROM ${tableName}
    ${whereClause}
    ORDER BY max_ts ${order}
    LIMIT 1;
  `
  const rows = yield call(executeSql, db, query, params)
  const row = rows.item(0)

  try {
    const decodedDataString = utf8decode(base64.decode(row.data))
    const decodedData = JSON.parse(decodedDataString)

    // check which column has the highest value
    // 1 - modified_on
    // 2 - last_activity_on
    const maxColumn = ((row.modified_on || row.created_on) > (row.last_activity_on || row.created_on)) ? 'modified_on' : 'last_activity_on'

    return decodedData[maxColumn] || decodedData.created_on
  } catch (e) {
    return null
  }
}

/* COMMON SAGAS */

/**
 * returns the total count of records matching the query in the given table name
 * @param {Object} db database instance
 * @param {String} tableName table name
 * @param {String} whereClause where condition
 * @param {Array} params values in where clause
 */
export function * getTotalCacheCount (tableName, whereClause = '', params = []) {
  console.log('getTotalCacheCount: entered')
  const query = `SELECT count(*) FROM ${tableName} ${whereClause};`
  const rows = yield call(executeSql, db, query, params)
  return rows.item(0)['count(*)']
}

export function * get (tableName, column, value) {
  const query = `SELECT * FROM ${tableName} WHERE ${column}=?;`
  const rows = yield call(executeSql, db, query, [value])
  return rows.item(0)
}

export function getTotalCacheCountPromise (tableName, resolve, whereClause = '', params = []) {
  console.log('getTotalCacheCountPromise: entered')
  const query = `SELECT count(*) FROM ${tableName} ${whereClause};`
  executeSql(db, query, params)
    .then((rows) => {
      resolve(rows.item(0)['count(*)'])
    })
}

/**
 * returns sync_statistics record of the asked `resource`
 * @param {String} resource resource whose sync_statistics record is to be fetched
 * @param {Boolean} shouldCheck whether to invoke `checkAndCreateSyncStatisticRecord` saga or not. Used to prevent infinite-loop
 */
export function * getStatisticsRecord (resource, shouldCheck = true) {
  if (shouldCheck) {
    yield call(checkAndCreateSyncStatisticRecord, resource)
  }
  const statsTableQuery = `
    SELECT * FROM ${SYNC_STATISTICS_TABLE_NAME}
    WHERE resource=?
    LIMIT 1;
  `
  const statsRows = yield call(executeSql, db, statsTableQuery, [resource])
  return statsRows.item(0)
}

/**
 * sets the value for `last_old_sync_ts` or `last_new_sync_ts`, the timestamp value is fetched from the given `dataArr` only
 * @param {String} tableName table name
 * @param {String} resource resource resource whose sync_statistics record is to be updated
 * @param {boolean} oldest whether to set value for `last_old_sync_ts`
 * @param {String} primaryColumnName name of the primary column in the `tableName`
 * @param {Array} dataArr list of data in api response -- to find min / max timestamp from
 */
export function * updateStatisticsRecord (tableName, resource, oldest, primaryColumnName, dataArr = [], isOrderTimestampBased = true, orderColumn = null) {
  if (!dataArr || !dataArr.length) return

  const ids = dataArr.map(c => c[primaryColumnName])
  const questionMarks = reduce((s) => s ? `${s}, ?` : '?', '', dataArr)

  const whereClause = `WHERE ${primaryColumnName} in (${questionMarks})`

  const timestamp = yield call(_getLatestOrOldestTimestampFromCache, tableName, oldest, whereClause, ids, isOrderTimestampBased, orderColumn)

  yield call(checkAndCreateSyncStatisticRecord, resource)
  const keyToUpdate = oldest ? 'last_old_sync_ts' : 'last_new_sync_ts'
  const statRow = yield call(getStatisticsRecord, resource)

  if (statRow[keyToUpdate] !== timestamp) {
    const query = `
      UPDATE ${SYNC_STATISTICS_TABLE_NAME}
      SET ${keyToUpdate}=?
      WHERE resource=?;
    `
    try {
      yield call(executeSql, db, query, [timestamp, resource])
      // console.info(`updateStatisticsRecord: updated sync_statistics for Key – ${resource}: ${keyToUpdate}`)
    } catch (e) { console.error('updateStatisticsRecord: error – ', e) }
  }
}

export function * updateStatsWithMinMaxTimestampValues (resource, tableName) {
  const newest = yield call(_getLatestOrOldestTimestampFromCache, tableName, false, '', [], true)
  const oldest = yield call(_getLatestOrOldestTimestampFromCache, tableName, true, '', [], true)
  const query = `
    UPDATE ${SYNC_STATISTICS_TABLE_NAME}
    SET last_new_sync_ts=?,
      last_old_sync_ts=?
    WHERE resource=?;
  `
  try {
    yield call(executeSql, db, query, [newest, oldest, resource])
    // console.info(`updateStatsWithMinMaxTimestampValues: updated sync_statistics for Key – ${resource}: last_new_sync_ts and last_old_sync_ts`)
  } catch (e) { console.error('updateStatsWithMinMaxTimestampValues: error – ', e) }
}

/**
 * checks if the `sync_statistics` record for the `resource` exists or not. Create if record doesnot exist.
 * @param {String} resource resource resource whose sync_statistics record is to be checked
 */
export function * checkAndCreateSyncStatisticRecord (resource) {
  const statRow = yield call(getStatisticsRecord, resource, false)

  if (!statRow) {
    const query = `
      INSERT INTO ${SYNC_STATISTICS_TABLE_NAME}
        (resource)
      VALUES (?);
    `
    try {
      yield call(executeSql, db, query, [resource])
      // console.info(`checkAndCreateSyncStatisticRecord : created sync_statistics for ${resource}: `)
    } catch (e) { console.error('checkAndCreateSyncStatisticRecord: error – ', e) }
  }
}

/**
 * returns old / new sync timestamp for the `resource` based on the `oldest` value
 * @param {String} tableName table name
 * @param {String} resource resource whose sync_statistics record is to be fetched
 * @param {boolean} oldest whether to return `last_old_sync_ts` value
 * @param {String} whereClause where clause to be used in the query
 * @param {Array} params dynamic values used in the where clause
 */
export function * getSyncStatisticsTimestamp (tableName, resource, oldest, isOrderTimestampBased = true,
  orderColumn = null, whereClause = '', params = []) {
  const statRow = yield call(getStatisticsRecord, resource)

  if (statRow) {
    if (oldest && statRow.last_old_sync_ts) {
      return statRow.last_old_sync_ts
    } else if (!oldest && statRow.last_new_sync_ts) {
      return statRow.last_new_sync_ts
    }
  }

  return yield call(_getLatestOrOldestTimestampFromCache, tableName, oldest, whereClause, params, isOrderTimestampBased, orderColumn)
}

export function * getRecodsWithTS (tableName, tsValue) {
  const query = `
    SELECT * FROM ${tableName}
    WHERE max_ts = ?;
  `
  const value = typeof tsValue === 'string' ? moment(tsValue).unix() : tsValue
  const rows = yield call(executeSql, db, query, [value])
  const data = []
  for (let i = 0; i < rows.length; i += 1) {
    data.push(rows.item(i))
  }
  return data
}
