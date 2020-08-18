import SQLite from 'react-native-sqlite-storage'
import { call } from 'redux-saga/effects'

export function executeSql (db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => tx.executeSql(query, params, (tx, results) => resolve(results.rows), reject))
  })
}

export function * executeTransaction (db, queries = []) {
  const results = []
  for (let i = 0; i < queries.length; i += 1) {
    const st = queries[i]
    let query = st.constructor === Array ? st[0] : st
    query = query ? query.trim() : null
    const params = st.constructor === Array && st.length > 1 ? st[1] : []
    if (!query || !query.length) continue

    let res = null
    try {
      res = yield call(executeSql, db, query, params)
    } catch (e) {
      console.log(e)
    }
    results.push(res)
  }
  return results
}

export let db

export function openDatabase (dbName, dbPassword) {
  return new Promise((resolve, reject) => {
    db = SQLite.openDatabase(
      { name: dbName, key: dbPassword },
      args => {
        console.log('openDatabase: database open successful - ', args)
        resolve()
      },
      args => {
        console.log('openDatabase: database open failed - ', args)
        reject(args)
      }
    )
  })
}

export function deleteDatabase (dbName) {
  return new Promise((resolve, reject) => {
    db = SQLite.deleteDatabase(
      dbName,
      args => {
        console.log('deleteDatabase: database delete successful - ', args)
        resolve()
      },
      args => {
        console.log('deleteDatabase: database delete failed - ', args)
        reject(args)
      }
    )
  })
}

export function * dropTable (tableName, resource = null) {
  yield call(executeSql, db, `DROP TABLE ${tableName};`)

  if (resource) {
    yield call(executeSql, db, `DELETE FROM sync_statistics WHERE resource=?`, [resource])
  }
}
