import { all, take, call, put, select, spawn, fork, takeLatest } from 'redux-saga/effects'
import { reduce, range } from 'ramda'
import Immutable from 'seamless-immutable'

import { AppTypes } from 'commons/Redux/AppRedux'
import ChatActions, { ChatTypes } from 'commons/Redux/ChatRedux'
import { chatFetch } from 'commons/Sagas/ChatSagas'
import { uuidv1ToMilliseconds, convertArrayToMap } from 'commons/Lib/Utils'
import { mergeWithExistingData } from 'commons/Lib/Redux/reducers'

import { db, executeSql } from 'app/Sagas/LocalDBSagas'
import cacheConfig from 'app/Sagas/LocalDBSagas/Lib/SyncConfig'
import { getActiveChatRoomId } from 'app/Lib/Chat'

import * as utils from './utils'

const resource = 'chat'
const reduxSliceKey = 'chat'
const primaryKey = 'room_id'

const tableName = 'chat_room_cache'
const apiDataKey = 'rooms'
const orderByClause = 'last_activity_on DESC'
const _config = cacheConfig[resource]
const cacheEnabled = _config.cacheEnabled
const detailPayloadKey = null
const extraColumns = ['last_read_message_id', 'last_delivered_message_id', 'last_restricted_message_id', 'last_message_id', 'member_email']

function * processDataFromCache (data) {
  const roomsMap = {}
  const rooms = []
  const membersMap = {}
  const allIdentityEmails = data.map(r => r.member_email)
  let identities = yield call(utils.getIdentities, allIdentityEmails)
  identities = convertArrayToMap(identities, 'id')

  const allContactIds = data.map(r => r.contact_id)
  let contacts = yield call(utils.getContacts, allContactIds)
  contacts = convertArrayToMap(contacts, 'id')

  data.forEach(room => {
    const { is_joined, contact_id, ...rest } = room
    const contact = contacts[contact_id]
    let identity = identities[room.member_email]

    if (!identity) {
      identity = { email: room.member_email }
    }

    if (!membersMap[room.room_id]) {
      membersMap[room.room_id] = [{
        email: identity.email,
        display_name: identity.display_name,
        is_joined: true,
        public_key: null
      }]
      roomsMap[room.room_id] = {
        ...rest,
        member_email: room.member_email,
        member_display_name: identity.display_name
      }
    }
    if (!contact) return
    membersMap[room.room_id].push({
      is_joined: is_joined === 1,
      email: contact.email,
      display_name: contact.display_name,
      public_key: null
    })
  })

  Object.keys(roomsMap).forEach(r => {
    const room = roomsMap[r]
    const members = membersMap[r]
    rooms.push({
      ...room,
      members: members.filter(m => m.is_joined),
      history: members
    })
  })

  return rooms
}

function * updateChatRoomMembers (data = []) {
  for (let r = 0; r < data.length; r += 1) {
    const room = data[r]
    const exisitingMembers = yield call(utils.getRoomMembers, room.room_id)
    const members = room.history.filter(m => room.member_email !== m.email)
    for (let m = 0; m < members.length; m += 1) {
      const member = members[m]

      let contact = yield call(utils.getContact, member.email)

      if (!contact) {
        yield call(utils.createDummyContact, member.email, member.display_name)
        contact = yield call(utils.getContact, member.email)
      }
      const exisitingMember = exisitingMembers.find(m => m.contact_id === contact.id)
      const isJoined = member.is_joined
      if (!exisitingMember) {
        yield call(utils.addRoomMember, room.room_id, contact.id, isJoined)
      } else if (isJoined !== (exisitingMember.is_joined === 1)) {
        yield call(utils.updateRoomMember, room.room_id, contact.id, isJoined)
      }
    }
  }
}

/**
 * litens for `CHAT_SUCCESS_FOR_CACHE` action and updates sqlite cache
 */
function * listenForChatDataSuccessAndCache () {
  yield take(AppTypes.CACHE_D_B_IS_READY)
  console.log(`listenForDataSuccessAndCache: entered for resource ${resource}`)
  while (true) {
    const { data } = yield take(ChatTypes.CHAT_SUCCESS_FOR_CACHE)

    yield spawn(executeRoomCacheQuery, data)
  }
}

/**
 * updates the cache
 * @param {Object} data list
 * @param {Object} requestPayload consists search query -- only in case of details fetch
 */
function * executeRoomCacheQuery (data, requestPayload, updateRedux = true, forcefullyfetchMessages = false) {
  // execute sqlite db sync only if cache is enabled
  if (cacheEnabled) {
    console.log(`executeRoomCacheQuery: entered for resource ${resource} with data –`, data)
    const ids = data[apiDataKey].map(r => r.room_id)
    let existingRecordResults = yield call(executeSql, db, `SELECT ${primaryKey}, last_restricted_message_id FROM ${tableName};`, [])

    const existingRecords = {}

    const roomsWithLastRestctedMessageIdChanged = []

    range(0, existingRecordResults.length).forEach((i) => {
      const d = existingRecordResults.item(i)
      existingRecords[d[primaryKey]] = ids.indexOf(d[primaryKey]) >= 0 ? d : null
    })

    let nonExistingParams = []
    let nonExistingCount = 0
    const nonExistingRooms = []

    for (const c of data[apiDataKey]) {
      const existingRecord = existingRecords[c[primaryKey]]

      c.member_email = c.member_email

      const createdOn = uuidv1ToMilliseconds(c[primaryKey])
      const lastActivityOn = c.last_message_id ? uuidv1ToMilliseconds(c.last_message_id) : createdOn

      if (!existingRecord) {
        nonExistingCount += 1
        const params = [
          c[primaryKey],
          ...extraColumns.map(col => c[col] && typeof c[col] === 'string' ? c[col].toLowerCase() : c[col]),
          createdOn,
          lastActivityOn
        ]
        nonExistingParams = nonExistingParams.concat(params)
        nonExistingRooms.push(c)
      } else {
        // TODO: check for should update room
        const columnsToUpdate = extraColumns.map(f => `${f}=?, `).join('')
        const query = `
          UPDATE ${tableName}
          SET ${columnsToUpdate}
              created_on=?,
              last_activity_on=?
          WHERE ${primaryKey}=?;
        `
        const params = [
          ...extraColumns.map(col => c[col] && typeof c[col] === 'string' ? c[col].toLowerCase() : c[col]),
          createdOn,
          lastActivityOn,
          c[primaryKey]
        ]
        try {
          console.info(`executeRoomCacheQuery: updated cache for ${resource}: `, c[primaryKey])
          yield call(executeSql, db, query, params)
          if (existingRecord.last_restricted_message_id !== c.last_restricted_message_id) {
            roomsWithLastRestctedMessageIdChanged.push(put(ChatActions.chatRemoveMessagesOnLastRestrictedMessageIdChange(c[primaryKey], c.last_restricted_message_id)))
          }
        } catch (e) { console.log('executeRoomCacheQuery: error – ', e) }
      }
    }

    if (nonExistingCount > 0) {
      const dynamicColumns = [primaryKey, ...extraColumns]
      const extraValues = dynamicColumns.map(() => '?, ').join('')
      const singleRowColumnsStr = `(${dynamicColumns.join(', ')}, created_on, last_activity_on)`

      const singleRowValuesStr = `(${extraValues} ?, ?)`
      const allRows = reduce((s, d) => s ? `${s}, ${singleRowValuesStr}` : `${singleRowValuesStr}`, '', range(0, nonExistingCount))

      const query = `INSERT INTO ${tableName} ${singleRowColumnsStr} VALUES ${allRows};`
      try {
        console.info(`executeRoomCacheQuery: created ${nonExistingCount} cache records for ${resource}`)
        yield call(executeSql, db, query, nonExistingParams)
        yield call(utils.addRoomSyncStatistics, nonExistingRooms.map(c => c[primaryKey]))
      } catch (e) { console.log('executeRoomCacheQuery: error – ', e) }
    }

    // if active room id is one of the newly created rooms,
    // simply call the chatGetMessagesRequest to prevent infinite loading message.
    // It might be necessary for race condition - get messages action was dispatched before the room was inserted in the cache.
    const activeRoomId = yield select(getActiveChatRoomId)
    const isActiveRoomNewlyCreated = nonExistingRooms.find(c => c.room_id === activeRoomId)
    if (isActiveRoomNewlyCreated || (forcefullyfetchMessages && nonExistingRooms.length > 0)) {
      yield put(ChatActions.chatGetMessagesRequest(forcefullyfetchMessages ? nonExistingRooms[0].room_id : activeRoomId))
    }

    yield call(updateChatRoomMembers, data[apiDataKey])
    yield all(roomsWithLastRestctedMessageIdChanged)
    for (let i = 0; i < nonExistingRooms.length; i += 1) {
      // push to old sync queue only if room has atleast one message
      if (nonExistingRooms[i].last_message_id) {
        yield put(ChatActions.chatRoomReadyForSync(nonExistingRooms[i]))
      }
    }
    // remove rooms which are present in cache but not in api response
    if (!requestPayload) {
      const roomsToBeRemoved = Object.keys(existingRecords)
        .filter(r => !existingRecords[r])
        .map(roomId => spawn(deleteRoomFromCache, { data: { room_id: roomId } }))
      yield all(roomsToBeRemoved)
    }
  }

  if (updateRedux) {
    yield call(fetchRoomListFromCache, { dataFromAPI: data, requestPayload })
  }
}

/**
 * performs actions and/or updated redux state based on values of `requestType` and `payload
 * @param {Object} requestType
 * @param {Object} dataFromAPI api response
 * @param {Object} payload consists search query -- only in case of detail fetch
 */
function * fetchRoomListFromCache ({ requestType = {}, dataFromAPI, payload = null }) {
  console.log(`fetchRoomListFromCache: entered for resource ${resource}`)
  let slice = yield select(s => s[reduxSliceKey])
  let chatDataOrder = slice.dataOrder
  if (requestType.isRefreshing && !dataFromAPI && chatDataOrder) {
    yield put(ChatActions.chatForceRefresh())
    return
  }

  // if cache is not enabled and `dataFromAPI` is undefined, simply call the fetch api -- which handles user action; and return
  if (!cacheEnabled && !dataFromAPI) {
    yield spawn(chatFetch)
    return
  } else if (!cacheEnabled) {
    yield put(ChatActions.chatSuccess(dataFromAPI, requestType))
    return
  }

  if (!db) {
    yield take(AppTypes.CACHE_D_B_IS_READY)
  }

  requestType.isRefreshing = !dataFromAPI
  slice = yield select(s => s[reduxSliceKey])
  chatDataOrder = slice.dataOrder

  let whereClause = ''
  const searchWhereClause = `WHERE ${primaryKey}=?`
  let _sqlParams = []

  // if user mannually refreshed the page and dataFromAPI is not `null` then re-render the list
  if (requestType.isRefreshing && !!dataFromAPI) {
    requestType.isRefreshing = false // reset it to avoid updating it in redux state
  }

  // when fetching a single record
  if (payload && payload.search && payload.search[detailPayloadKey]) {
    const searchText = payload.search[detailPayloadKey]
    whereClause = searchWhereClause
    _sqlParams = [searchText]
  }

  const query = `
    SELECT * FROM chat_room_cache as crc 
    INNER JOIN chat_room_member_cache as crmc ON crc.room_id = crmc.room_id
    ${whereClause}
    ORDER BY ${orderByClause};
  `
  const rows = yield call(executeSql, db, query, _sqlParams)
  let data = []
  for (let i = 0; i < rows.length; i++) {
    data.push(rows.item(i))
  }

  data = yield call(processDataFromCache, data)

  // include non cached rooms only when there are more rooms in API response than the cache db
  if (dataFromAPI && data.length < dataFromAPI[apiDataKey].length) {
    let _dataMap = Immutable(convertArrayToMap(data, 'room_id'))
    const _resDataMap = Immutable(convertArrayToMap(dataFromAPI[apiDataKey], 'room_id'))
    _dataMap = mergeWithExistingData(_resDataMap, _dataMap, false, true)
    data = Object.keys(_dataMap).map(r => _dataMap[r])
  } else if (dataFromAPI && data.length > dataFromAPI[apiDataKey].length) {
    const _sliceDataMap = slice.data
    let _dataMap = Immutable(convertArrayToMap(data, 'room_id'))
    let _resDataMap = Immutable(convertArrayToMap(dataFromAPI[apiDataKey], 'room_id'))
    _resDataMap = mergeWithExistingData(_sliceDataMap, _resDataMap, true, true)
    _dataMap = mergeWithExistingData(_resDataMap, _dataMap, false, true)
    data = Object.keys(_dataMap).map(r => _dataMap[r])
  }

  const totalCount = data.length

  if (!payload && (totalCount > 0 || dataFromAPI)) {
    yield put(ChatActions.chatSuccess(
      { [apiDataKey]: data },
      requestType
    ))
  } else if (payload && !dataFromAPI) {
    // if fetching a single record, dispatch api success and request details
  }

  if (!dataFromAPI) {
    if ((!chatDataOrder || !chatDataOrder.length) && data.length > 0) {
      yield call(updateUnreadCountFromCache)
    }
    yield spawn(chatFetch, !totalCount)
  }
}

function * updateUnreadCountFromCache () {
  try {
    const query = `SELECT crc.room_id, crc.last_read_message_id FROM chat_room_cache as crc WHERE crc.last_message_id is NOT NULL;`
    const rows = yield call(executeSql, db, query)
    const rooms = []
    for (let i = 0; i < rows.length; i++) {
      rooms.push(rows.item(i))
    }

    const countReq = rooms.map(r => call(utils.getRoomUnreadCount, r.room_id, r.last_read_message_id))
    const countSuccess = yield all(countReq)
    const reduxCalls = countSuccess.filter(c => c.total > 0).map(c => put(ChatActions.chatPeekNewMessageCountSuccess(c)))
    yield all(reduxCalls)
  } catch (e) {}
}

/**
 * creates new room in cache
 * @param {Object} data newly created
 */
function * createInCache (forcefullyfetchMessages, { data }) {
  if (!cacheEnabled) return
  yield spawn(executeRoomCacheQuery, { [apiDataKey]: [data] }, {}, false, forcefullyfetchMessages)
}

/**
 * updates room in cache
 * @param {Object} updated data
 */
function * updateInCache ({ data }) {
  if (!cacheEnabled) return
  yield spawn(executeRoomCacheQuery, data, {}, false)
}

function * bulkUpdateInCache ({ data }) {
  if (!cacheEnabled) return
  yield spawn(executeRoomCacheQuery, data, {}, true)
}

function * deleteRoomFromCache ({ data: { room_id: roomId } }) {
  if (!cacheEnabled) return
  console.log(`deleteRoomFromCache: entered for room: ${roomId}`)
  console.log(`deleteRoomFromCache: deleting messages for room: ${roomId}`)
  yield call(utils.deleteRoomMesssges, roomId)
  console.log(`deleteRoomFromCache: deleted messages for room: ${roomId}`)
  console.log(`deleteRoomFromCache: deleting room: ${roomId}`)
  yield call(utils.deleteRoom, roomId)
  console.log(`deleteRoomFromCache: deleted room: ${roomId}`)
}

const sagas = [
  fork(listenForChatDataSuccessAndCache),
  takeLatest(
    [
      ChatTypes.CHAT_FETCH,
      ChatTypes.CHAT_FETCH_FROM_CACHE
    ],
    fetchRoomListFromCache
  ),
  takeLatest(ChatTypes.CHAT_REFRESH_ROOM_SUCCESS, updateInCache),
  takeLatest(ChatTypes.CHAT_BULK_REFRESH_ROOM_SUCCESS, bulkUpdateInCache),
  takeLatest(ChatTypes.CHAT_CREATE_ROOM_SUCCESS, createInCache, false),
  takeLatest(ChatTypes.CHAT_AUTO_JOINED_ROOM, createInCache, true),
  takeLatest(ChatTypes.CHAT_LEAVE_ROOM_SUCCESS, deleteRoomFromCache)
]

export default sagas
