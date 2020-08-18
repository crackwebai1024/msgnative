import { call, select, spawn } from 'redux-saga/effects'
import path from 'ramda/es/path'
import range from 'ramda/es/range'
import reduce from 'ramda/es/reduce'
import uniq from 'ramda/es/uniq'
import base64 from 'base-64'
import moment from 'moment'
import { db, executeSql } from 'app/Sagas/LocalDBSagas'
import * as commonCacheSagas from 'app/Sagas/LocalDBSagas/Lib/CommonCacheSagas'
import { encode as utf8encode } from 'app/Lib/UTF8'
import { uuidv1ToMilliseconds } from 'commons/Lib/Utils'

function * getExtremeMessage (roomId, latest = true) {
  const orderByClause = `ORDER BY created_on ${latest ? 'DESC' : 'ASC'}`
  const query = `SELECT * FROM chat_message_cache WHERE room_id=? ${orderByClause} LIMIT 1;`
  const rows = yield call(executeSql, db, query, [roomId])
  return rows.item(0)
}

export function * getRoomUnreadCount (roomId, lastReadMessageId) {
  const messageCreatedOn = lastReadMessageId ? uuidv1ToMilliseconds(lastReadMessageId) : 0
  const query = `SELECT count(*) FROM chat_message_cache WHERE room_id=? AND created_on > ?;`
  const rows = yield call(executeSql, db, query, [roomId, messageCreatedOn])
  return {
    room_id: roomId,
    total: rows.item(0)['count(*)']
  }
}

export function * getRoom (roomId = null) {
  let whereClause = ''
  let _sqlParams = []
  if (roomId) {
    whereClause = 'WHERE room_id=? LIMIT 1'
    _sqlParams = [roomId]
  }
  const query = `SELECT * FROM chat_room_cache ${whereClause};`
  const rows = yield call(executeSql, db, query, _sqlParams)
  const data = []
  for (let i = 0; i < rows.length; i += 1) {
    data.push(rows.item(i))
  }
  return roomId ? data[0] : data
}

export function * deleteRoom (roomId) {
  yield spawn(removeRoomSyncStatistics, roomId)
  yield spawn(removeRoomMembers, roomId)
  const query = `DELETE FROM chat_room_cache WHERE room_id=?;`
  yield call(executeSql, db, query, [roomId])
}

export function * getRoomSyncStatistics (idsArr = []) {
  const idsStr = reduce((ids, d) => ids ? `${ids}, '${d}'` : `'${d}'`, '', uniq(idsArr))
  const query = `SELECT * FROM chat_sync_statistics WHERE room_id IN (${idsStr});`
  const rows = yield call(executeSql, db, query, [])
  const data = []
  for (let i = 0; i < rows.length; i += 1) {
    data.push(rows.item(i))
  }
  return data
}

export function * updateRoomSyncStats (roomId) {
  let roomStats = yield call(getRoomSyncStatistics, [roomId])
  roomStats = roomStats[0]
  if (!roomStats) return
  const latest = yield call(getExtremeMessage, roomId, true)
  const oldest = yield call(getExtremeMessage, roomId, false)
  const query = `
    UPDATE chat_sync_statistics
    SET oldest_message_id=?,
    latest_message_id=?
    WHERE room_id=?;
  `
  yield call(executeSql, db, query, [oldest.message_id, latest.message_id, roomId])
  if (!roomStats.latest_message_id) {
    yield call(updateSanityCheckedMessageId, roomId, latest.message_id)
  }
}

export function * updateSanityCheckedMessageId (roomId, messageId) {
  let roomStats = yield call(getRoomSyncStatistics, [roomId])
  roomStats = roomStats[0]
  if (!roomStats) return
  const query = `
    UPDATE chat_sync_statistics
    SET sanity_checked_message_id=?
    WHERE room_id=?;
  `
  yield call(executeSql, db, query, [messageId, roomId])
}

export function * addRoomSyncStatistics (roomIds = []) {
  const valuesString = reduce((ids, d) => ids ? `${ids}, (?)` : '(?)', '', uniq(roomIds))
  const query = `INSERT INTO chat_sync_statistics (room_id) VALUES ${valuesString};`
  yield call(executeSql, db, query, roomIds)
}

export function * removeRoomSyncStatistics (roomId) {
  const query = `DELETE from chat_sync_statistics WHERE room_id=?;`
  yield call(executeSql, db, query, [roomId])
}

export function * getRoomMembers (roomId) {
  const query = `SELECT * FROM chat_room_member_cache WHERE room_id=?;`
  const rows = yield call(executeSql, db, query, [roomId])
  const members = []

  range(0, rows.length).map((i) => members.push(rows.item(i)))
  return members
}

export function * addRoomMember (roomId, contactId, isJoined) {
  try {
    const query = `INSERT INTO chat_room_member_cache (room_id, contact_id, is_joined) VALUES (?, ?, ?);`
    yield call(executeSql, db, query, [roomId, contactId, isJoined])
  } catch (e) {
    console.log(`addRoomMember error - `, e)
  }
}

export function * updateRoomMember (roomId, contactId, isJoined) {
  const query = `
    UPDATE chat_room_member_cache
    SET is_joined=?
    WHERE room_id=? AND contact_id=?;
  `
  yield call(executeSql, db, query, [isJoined, roomId, contactId])
}

export function * removeRoomMembers (roomId) {
  const query = `DELETE FROM chat_room_member_cache WHERE room_id=?;`
  yield call(executeSql, db, query, [roomId])
}

export function * deleteRoomMesssges (roomId) {
  const query = `DELETE FROM chat_message_cache WHERE room_id=?;`
  yield call(executeSql, db, query, [roomId])
}

export function * createDummyContact (email, name) {
  const encodedData = base64.encode(utf8encode(JSON.stringify({ email, display_name: name, is_msgsafe_user: false })))
  const query = `INSERT INTO contacts_cache (email, display_name, data, is_msgsafe_user, is_deleted) VALUES (?, ?, ?, ?, ?);`
  yield call(executeSql, db, query, [email, name, encodedData, 0, 1])
}

export function * getContact (email) {
  const contact = yield call(commonCacheSagas.get, 'contacts_cache', 'email', email)
  return contact
}

export function * getRoomIdentity (email) {
  const rows = yield call(getIdentities, [email])
  return rows ? rows[0] : null
}

export function * getIdentities (emailsArr) {
  const emailsStr = reduce((ids, d) => ids ? `${ids}, '${d}'` : `'${d}'`, '', uniq(emailsArr))
  let query = `SELECT * FROM identities_cache WHERE email IN (${emailsStr});`
  let rows = yield call(executeSql, db, query, [])
  const data = []
  for (let i = 0; i < rows.length; i += 1) {
    data.push(rows.item(i))
  }

  query = `SELECT * FROM user_emails_cache WHERE email IN (${emailsStr});`
  rows = yield call(executeSql, db, query, [])
  for (let i = 0; i < rows.length; i += 1) {
    data.push(rows.item(i))
  }
  return data
}

export function * getContacts (idsArr) {
  const idsStr = reduce((ids, d) => ids ? `${ids}, '${d}'` : `'${d}'`, '', uniq(idsArr))
  const query = `SELECT * FROM contacts_cache WHERE id in (${idsStr});`
  const rows = yield call(executeSql, db, query, [])
  const data = []
  for (let i = 0; i < rows.length; i += 1) {
    data.push(rows.item(i))
  }
  return data
}

export function isOldSyncRequiredForRoom (stats) {
  if (!stats.oldest_message_id) return true
  const oldestDate = moment.unix(uuidv1ToMilliseconds(stats.oldest_message_id)).utc()
  const now = moment.utc()
  const diff = Math.abs(now.diff(oldestDate, 'days'))
  return diff < 7
}
