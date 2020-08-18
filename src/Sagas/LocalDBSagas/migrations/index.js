import { call } from 'redux-saga/effects'
import * as Schema from '../Schema'
import VERSIONS from './versions'
import { executeSql, executeTransaction, db, dropTable } from '../dbUtils'

const LATEST_VERSION = '20190105'
const INITIAL_VERSION = '20181225'

const TABLE_CONFIG = [
  { name: 'contacts_cache', resource: 'contacts' },
  { name: 'email_is_platform_user' },
  { name: 'identities_cache', resource: 'identities' },
  { name: 'user_emails_cache', resource: 'user_emails' },
  { name: 'mailbox_cache', resource: 'mailbox' },
  { name: 'chat_room_cache', resource: 'chat' },
  { name: 'chat_room_member_cache', resource: 'chat' },
  { name: 'chat_message_cache', resource: 'chat' },
  { name: 'chat_sync_statistics', resource: 'chat' },
  { name: 'call_history_cache', resource: 'calls' },
  { name: 'sync_statistics' },
  { name: 'key_storage' }
]

function * getVersion () {
  const version = yield call(executeSql, db, `SELECT version FROM version LIMIT 1;`)
  return version.item(0)
}

function * updateVersion (versionName) {
  const version = yield call(getVersion)
  let query = `UPDATE version SET version = ?;`
  if (!version) {
    query = `INSERT INTO version (version) VALUES (?);`
  }
  yield call(executeSql, db, query, [versionName])
}

/**
 * Creates table is it doesn't already exists or (re-creates if) it has changed.
 *
 * @param tableName
 * @param schema
 * @param indexSchema
 */
function * createTableIfNecessary (config, recreate) {
  const tableName = config.name
  console.log('createTableIfNecessary: entered')
  const rows = yield call(executeSql, db, `SELECT sql FROM sqlite_master WHERE name=?;`, [tableName])
  const schemaInDB = rows.item(0)

  const capsName = tableName.toUpperCase()
  const schema = Schema[`${capsName}_SCHEMA`]
  const indexSchema = Schema[`${capsName}_INDEXES`]

  if (!schemaInDB || !schemaInDB.sql || recreate) {
    if (recreate) {
      yield call(dropTable, tableName, config.resource)
    }
    console.log(`createTableIfNecessary: creating table ${tableName}`)
    yield call(executeSql, db, schema)
    if (indexSchema) {
      console.log(`createTableIfNecessary: creating indexes for table ${tableName}`)
      const queries = indexSchema.split(';')
      yield call(executeTransaction, db, queries)
    }
    return false
  }
  return true
}

export function * initMigrations () {
  yield call(createTableIfNecessary, { name: 'version' })

  let version = yield call(getVersion)
  version = version ? version.version : null

  const tablesToMigrate = {}
  for (let i = 0; i < TABLE_CONFIG.length; i += 1) {
    const config = TABLE_CONFIG[i]
    tablesToMigrate[config.name] = yield call(createTableIfNecessary, config)
  }

  if (version !== LATEST_VERSION) {
    version = version || INITIAL_VERSION
    let versionObj = VERSIONS[version]
    while (true) {
      try {
        const nextVersion = versionObj.NEXT_VERSION
        if (!nextVersion) break
        console.log(`initMigrations: upgrading from ${version} to ${nextVersion}`)
        version = nextVersion
        versionObj = VERSIONS[version]
        yield call(versionObj.upgrade, createTableIfNecessary)
      } catch (e) {
        console.log(`initMigrations: error occured - `, e)
        console.log(`initMigrations: error occured while migrating... recreating tables`)
        for (let i = TABLE_CONFIG.length - 1; i >= 0; i -= 1) {
          const config = TABLE_CONFIG[i]
          yield call(createTableIfNecessary, config, true)
        }
        version = LATEST_VERSION
        break
      }
    }
    yield call(updateVersion, version)
  }
}
