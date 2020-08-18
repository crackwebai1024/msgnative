import { call, fork, put, select, spawn, take, takeLatest, takeEvery } from 'redux-saga/effects'
import { reduce, range, path, uniq, clone } from 'ramda'

import { AppTypes } from 'commons/Redux/AppRedux'
import ChatActions, { ChatTypes, MESSAGE_STATUS } from 'commons/Redux/ChatRedux'
import { uuidv1ToMilliseconds, convertArrayToMap } from 'commons/Lib/Utils'
import { getMessagesRequest } from 'commons/Sagas/ChatSagas/Message'
import { chatAPI } from 'commons/Sagas/ChatSagas'

import { db, executeSql } from 'app/Sagas/LocalDBSagas'
import * as commonCacheSagas from 'app/Sagas/LocalDBSagas/Lib/CommonCacheSagas'
import cacheConfig from 'app/Sagas/LocalDBSagas/Lib/SyncConfig'
import { getActiveChatRoomId } from 'app/Lib/Chat'
import * as utils from './utils'

const LIMIT = 30
const resource = 'chat'
const primaryKey = 'message_id'

const tableName = 'chat_message_cache'
const apiDataKey = 'messages'
const orderByClause = 'created_on DESC'
const _config = cacheConfig[resource]
const cacheEnabled = _config.cacheEnabled
const extraColumns = ['room_id', 'user_from', 'body']

/**
 * litens for `CHAT_GET_MESSAGES_SUCCESS_FOR_CACHE` action and updates sqlite cache
 */
function * listenForMessageDataSuccessAndCache () {
  yield take(AppTypes.CACHE_D_B_IS_READY)
  console.log(`listenForMessageDataSuccessAndCache: entered for resource ${resource}`)
  while (true) {
    const { data, paginateNew } = yield take(ChatTypes.CHAT_GET_MESSAGES_SUCCESS_FOR_CACHE)

    yield spawn(executeMessageCacheQuery, data, paginateNew)
  }
}

/**
 * updates the cache
 * @param {Object} data list
 * @param {Object} requestPayload consists search query -- only in case of details fetch
 */
function * executeMessageCacheQuery (data, paginateNew, fromMessageReceived = false) {
  let room = null
  if (cacheEnabled) {
    room = yield call(utils.getRoom, data.room_id)
  }

  if (cacheEnabled && room) {
    console.log(`executeMessageCacheQuery: entered for resource message with data –`, data, room)
    const members = yield call(utils.getRoomMembers, data.room_id)
    if (!members || !members.length) return

    const allContactIds = members.map(rm => rm.contact_id)
    let contacts = yield call(utils.getContacts, allContactIds)
    contacts = convertArrayToMap(contacts, 'email')

    const ids = reduce((ids, d) => ids ? `${ids}, '${d[primaryKey]}'` : `'${d[primaryKey]}'`, '', data[apiDataKey])
    let existingRecordResults = yield call(executeSql, db, `SELECT ${primaryKey} FROM ${tableName} WHERE ${primaryKey} IN (${ids});`, [])

    const existingRecords = {}

    range(0, existingRecordResults.length).forEach((i) => {
      const d = existingRecordResults.item(i)
      existingRecords[d[primaryKey]] = true
    })

    let nonExistingParams = []
    let nonExistingCount = 0

    for (const c of data[apiDataKey]) {
      if (existingRecords[c[primaryKey]]) continue
      if (room.member_email === c.user_from) {
        c.user_from = null
      } else {
        if (!contacts[c.user_from]) {
          yield call(utils.createDummyContact, c.user_from, null)
          contacts[c.user_from] = yield call(utils.getContact, c.user_from)
        }
        if (!contacts[c.user_from]) continue
        c.user_from = contacts[c.user_from].id
      }

      const createdOn = uuidv1ToMilliseconds(c[primaryKey])
      c.room_id = data.room_id
      nonExistingCount += 1
      const params = [
        c[primaryKey],
        ...extraColumns.map(col => c[col]),
        createdOn
      ]
      nonExistingParams = nonExistingParams.concat(params)
    }

    if (nonExistingCount > 0) {
      const dynamicColumns = [primaryKey, ...extraColumns]
      const extraValues = dynamicColumns.map(() => '?, ').join('')
      const singleRowColumnsStr = `(${dynamicColumns.join(', ')}, created_on)`

      const singleRowValuesStr = `(${extraValues} ?)`
      const allRows = reduce((s, d) => s ? `${s}, ${singleRowValuesStr}` : `${singleRowValuesStr}`, '', range(0, nonExistingCount))

      const query = `INSERT INTO ${tableName} ${singleRowColumnsStr} VALUES ${allRows};`
      try {
        console.info(`executeMessageCacheQuery: created ${nonExistingCount} cache records for message`)
        yield call(executeSql, db, query, nonExistingParams)
      } catch (e) { console.log('executeMessageCacheQuery: error – ', e) }
    }
    if (fromMessageReceived) {
      const cacheTotalCount = yield call(commonCacheSagas.getTotalCacheCount, tableName, 'WHERE room_id = ?', [data.room_id])
      if (cacheTotalCount === 1) {
        yield spawn(getMessagesRequest, { roomId: data.room_id })
        return
      }
    }
    // update latest_massage_id & oldest_mesasge_id for the room
    if (data[apiDataKey].length > 0) {
      yield call(utils.updateRoomSyncStats, data.room_id)
    }
    // push to old sync queue only if `paginateNew` is false and number of messages in data is equal to LIMIT
    if (!paginateNew && data[apiDataKey].length === LIMIT) {
      yield put(ChatActions.chatRoomReadyForSync(data.room_id))
    }
  }
  const activeRoomId = yield select(getActiveChatRoomId)
  if (data.room_id !== activeRoomId && cacheEnabled) return
  yield call(getMessagesFromCache, { dataFromAPI: data, roomId: data.room_id, paginateNew, paginate: !paginateNew })
}

function * getMessagesFromCache ({ roomId, paginate, paginateNew, dataFromAPI }) {
  // if cache is not enabled and `dataFromAPI` is undefined,
  // simply call the fetch api -- which handles user action; and return
  if (!cacheEnabled && !dataFromAPI) {
    yield spawn(getMessagesRequest, { roomId, paginate, paginateNew })
    return
  } else if (dataFromAPI && !cacheEnabled) {
    // if `dataFromAPI` is not null and cache is disabled, dispatch data success action and return
    yield put(ChatActions.chatGetMessagesSuccess(dataFromAPI, paginateNew, true))
    return
  }

  if (!db) {
    yield take(AppTypes.CACHE_D_B_IS_READY)
  }

  const isOnline = yield select(s => s.app.isNetworkOnline)

  let slice = yield select(s => s.chat)
  let roomSlice = path(['data', roomId], slice)
  const shouldAddToRedux = roomSlice.isLoadingMessages || paginateNew
  if (!shouldAddToRedux) return

  const roomIdClause = 'WHERE room_id = ?'
  const cacheTotalCount = yield call(commonCacheSagas.getTotalCacheCount, tableName, roomIdClause, [roomId])

  if (paginateNew) {
    yield put(ChatActions.chatGetMessagesSuccess(dataFromAPI, paginateNew))
    if (!cacheTotalCount && (!dataFromAPI[apiDataKey] || !dataFromAPI[apiDataKey].length)) {
      yield put(ChatActions.chatSetNoMoreMessagesAvailable(roomId))
    }
    return
  }

  slice = yield select(s => s.chat)
  roomSlice = path(['data', roomId], slice)
  const room = yield call(utils.getRoom, roomId)
  if (!room) {
    if (dataFromAPI) {
      yield put(ChatActions.chatGetMessagesSuccess(dataFromAPI, paginateNew, true))
    } else {
      yield spawn(getMessagesRequest, { roomId, paginate, paginateNew })
    }
    return
  }

  let whereClause = roomIdClause
  let _sqlParams = [roomId]
  let _limit = LIMIT
  const isPaginating = paginate && roomSlice.isLoadingMessages
  const existingMessageIds = path(['regular', 'messageIds'], roomSlice) || []
  if (isPaginating && existingMessageIds.length > 0) {
    // get oldest_message_id
    const oldestMessageId = existingMessageIds[0]
    whereClause = `${whereClause} AND rmc.created_on <= ?`
    _sqlParams.push(uuidv1ToMilliseconds(oldestMessageId))
  }

  const query = `
    SELECT rmc.*, cc.email as user_from FROM ${tableName} as rmc
    LEFT JOIN contacts_cache as cc ON cc.id = rmc.user_from AND rmc.user_from IS NOT NULL
    ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT ${_limit};
  `
  const rows = yield call(executeSql, db, query, _sqlParams)
  const data = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i)
    data.push({ ...row, user_from: row.user_from || room.member_email })
  }

  const combinedMessageIds = uniq(data.map(r => r.message_id).concat(existingMessageIds))
  const totalMessagesInRedux = combinedMessageIds.length

  let isAPIRequestNecessary = false
  const isConnected = isOnline && chatAPI.ready

  let noMoreMessagesAvailable = roomSlice.noMoreMessagesAvailable ||
    (dataFromAPI && dataFromAPI.messages && dataFromAPI.messages.length < LIMIT)

  if (!dataFromAPI && !noMoreMessagesAvailable) {
    if (isPaginating) {
      isAPIRequestNecessary = (LIMIT >= cacheTotalCount) || ((cacheTotalCount - totalMessagesInRedux) < LIMIT)
    } else if (!paginate && !paginateNew && cacheTotalCount < LIMIT) {
      isAPIRequestNecessary = true
    }
  }

  if (data.length > 0 || dataFromAPI) {
    yield put(ChatActions.chatGetMessagesSuccess({ [apiDataKey]: data, room_id: roomId }, paginateNew, !isAPIRequestNecessary || !isConnected))
  } else if (!isConnected) {
    yield put(ChatActions.chatGetMessagesSuccess({ [apiDataKey]: [], room_id: roomId }, paginateNew, true))
  }

  if (noMoreMessagesAvailable) {
    yield put(ChatActions.chatSetNoMoreMessagesAvailable(roomId))
  }

  if (isAPIRequestNecessary && !dataFromAPI && isConnected) {
    const lastMessageId = combinedMessageIds[totalMessagesInRedux - 1]
    yield spawn(getMessagesRequest, { roomId, paginate: true, limit: LIMIT, messageId: lastMessageId })
  }
}

function * addMessageToCache ({ data, isE2EE }) {
  if (!cacheEnabled || isE2EE || (data.status && data.status !== MESSAGE_STATUS.SENT)) return
  yield spawn(executeMessageCacheQuery, { [apiDataKey]: [clone(data)], room_id: data.room_id }, null, true)
}

function * removeMessagesOnLastRestrictedMessageIdChange ({ roomId, lastRestrictedMessageId }) {
  if (!lastRestrictedMessageId) return
  const createdOn = uuidv1ToMilliseconds(lastRestrictedMessageId)
  try {
    const query = `DELETE FROM chat_message_cache WHERE room_id=? AND created_on <= ?;`
    yield call(executeSql, db, query, [roomId, createdOn])
  } catch (e) {}
}

function * forcePaginateNew ({ roomId }) {
  yield spawn(getMessagesRequest, { roomId, paginateNew: true, limit: LIMIT })
}

const sagas = [
  fork(listenForMessageDataSuccessAndCache),
  takeEvery(ChatTypes.CHAT_GET_MESSAGES_REQUEST, getMessagesFromCache),
  takeEvery(ChatTypes.CHAT_FORCE_FETCH_NEW_MESSAGES, forcePaginateNew),
  takeLatest(ChatTypes.CHAT_MESSAGE_RECEIVED, addMessageToCache),
  takeLatest(ChatTypes.CHAT_MESSAGE_MODIFIED, addMessageToCache),
  takeLatest(ChatTypes.CHAT_REMOVE_MESSAGES_ON_LAST_RESTRICTED_MESSAGE_ID_CHANGE, removeMessagesOnLastRestrictedMessageIdChange)
]

export default sagas
