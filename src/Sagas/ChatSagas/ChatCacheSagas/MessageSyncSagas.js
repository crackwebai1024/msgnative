import { actionChannel, all, call, fork, put, take } from 'redux-saga/effects'
import { buffers, delay } from 'redux-saga'
import { range } from 'ramda'

import ChatActions, { ChatTypes } from 'commons/Redux/ChatRedux'
import { convertArrayToMap } from 'commons/Lib/Utils'
import { getMessagesRequest, peekNewMessageCountRequest } from 'commons/Sagas/ChatSagas/Message'
import cacheConfig from 'app/Sagas/LocalDBSagas/Lib/SyncConfig'
import { db, executeSql } from 'app/Sagas/LocalDBSagas'
import * as utils from './utils'

const MESSAGE_SYNC_INTERVAL = 30000
const LIMIT = 30
const resource = 'chat'
const _config = cacheConfig[resource]
const cacheEnabled = _config.cacheEnabled
const enableNewSync = _config.enableNewSync

function * performSanityCheckPeriodically () {
  console.log('performSanityCheckPeriodically: entered')
  yield take(ChatTypes.CHAT_SUCCESS)
  while (true) {
    let query = `
      SELECT css.* from chat_sync_statistics as css
      JOIN chat_room_cache as crc ON crc.room_id = css.room_id
      WHERE css.latest_message_id != css.sanity_checked_message_id AND css.sanity_checked_message_id is NOT NULL
    `
    let rows = yield call(executeSql, db, query)
    if (!rows.length) {
      yield delay(MESSAGE_SYNC_INTERVAL)
      continue
    }
    const rooms = range(0, rows.length).map(i => rows.item(i))
    const peekRequests = rooms.map(r => call(peekNewMessageCountRequest, { roomId: r.room_id, lastReadMessageId: r.sanity_checked_message_id, useReturn: true }))
    let peekRes = yield all(peekRequests)
    peekRes = peekRes.filter(p => p.total > 0)
    const peekResMap = convertArrayToMap(peekRes, 'room_id')

    const messageRequests = peekRes.map(r => call(getMessagesRequest, { roomId: r.room_id, limit: r.total, messageId: r.message_id, paginateNew: true }))
    const messageRes = yield all(messageRequests)

    const sanityCheckedMessageIdUpdateReq = []
    const sanityCheckedMessagesUpdateToRedux = []
    messageRes.forEach((res) => {
      const latestMessageId = res.messages[0].message_id
      sanityCheckedMessagesUpdateToRedux.push(put(ChatActions.chatMessageSanityCheckSuccess(res, peekResMap[res.room_id].message_id)))
      sanityCheckedMessageIdUpdateReq.push(call(utils.updateSanityCheckedMessageId, res.room_id, latestMessageId))
    })
    yield all(sanityCheckedMessagesUpdateToRedux)
    yield all(sanityCheckedMessageIdUpdateReq)
    yield delay(MESSAGE_SYNC_INTERVAL)
  }
}

export function * oldSyncQueueTask (roomId) {
  const room = yield call(utils.getRoom, roomId)
  if (!room || !room.last_message_id) return
  let roomStats = yield call(utils.getRoomSyncStatistics, [roomId])
  if (!roomStats.length) {
    yield call(utils.addRoomSyncStatistics, [roomId])
    return
  }
  roomStats = roomStats[0]
  const shouldSync = utils.isOldSyncRequiredForRoom(roomStats)
  const messageId = roomStats.oldest_message_id
  if (!messageId || !shouldSync) return
  yield call(getMessagesRequest, { roomId, messageId, paginate: true, limit: LIMIT })
}

function * oldSyncQueueListener (channel) {
  while (true) {
    const { roomId } = yield take(channel)

    yield call(oldSyncQueueTask, roomId)
  }
}

function * syncNewMessagesPeriodicallyUsingCache () {
  console.log('syncNewMessagesPeriodicallyUsingCache: entered')
  yield take(ChatTypes.CHAT_SUCCESS)
  while (true) {
    const rooms = yield call(utils.getRoom)
    let allStats = yield call(utils.getRoomSyncStatistics, rooms.map(r => r.room_id))
    allStats = convertArrayToMap(allStats, 'room_id')

    const roomSyncRequests = []
    rooms.forEach((room) => {
      const roomId = room.room_id
      const roomStats = allStats[roomId]
      if (!roomStats || roomStats.latest_message_id === room.last_message_id) return
      const messageId = roomStats.latest_message_id
      roomSyncRequests.push(call(getMessagesRequest, {
        roomId,
        messageId,
        paginateNew: !!messageId,
        limit: LIMIT
      }))
    })

    yield all(roomSyncRequests)
    yield delay(MESSAGE_SYNC_INTERVAL)
  }
}

function * initOldChatMessagesSync () {
  console.log(`initOldChatMessagesSync: entered`)
  const channel = yield actionChannel(ChatTypes.CHAT_ROOM_READY_FOR_SYNC, buffers.sliding())
  yield fork(oldSyncQueueListener, channel)
  yield fork(oldSyncQueueListener, channel)
  yield fork(oldSyncQueueListener, channel)
  const rooms = yield call(utils.getRoom)
  for (let i = 0; i < rooms.length; i += 1) {
    yield put(ChatActions.chatRoomReadyForSync(rooms[i].room_id))
  }
}

export function * initChatMessagesSync () {
  console.log(`initChatMessagesSync: entered`)
  if (cacheEnabled) {
    yield fork(initOldChatMessagesSync)
    yield fork(performSanityCheckPeriodically)
    if (enableNewSync) {
      yield fork(syncNewMessagesPeriodicallyUsingCache)
    }
  } else {
    // TODO: add sanity check process to use redux instead of cache db
  }
}

const sagas = []

export default sagas
