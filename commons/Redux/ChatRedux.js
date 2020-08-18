import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { merge, path, uniq, findIndex, sortBy, reverse } from 'ramda'

import {
  BASE_STATE_API_RESPONSE,
  baseActionsReadApi, baseActionsWriteApi,
  baseApiReadReducerInit, baseApiWriteReducerInit
} from '../Lib/Redux/CRUD'
import createAPIPackage from '../Lib/Redux/createAPIPackage'
import {
  createItemSuccessReducer,
  createUpdateItemSuccessReducer,
  createDataSuccessReducer
} from '../Lib/Redux/reducers'
import { getContactMember, getUnreadMessagesCount } from 'commons/Selectors/Messaging'
import { uuidv1ToDate } from 'commons/Lib/Utils'
// import { getActiveChatRoomId } from 'app/Lib/Chat'
import { UserTypes } from './UserRedux'
export const MESSAGE_STATUS = {
  SENT: 'chat_message_sent',
  PENDING: 'chat_message_pending',
  ERROR: 'chat_message_error'
}

export const REDUX_CONFIG = {
  statePrefix: 'chat',
  reducerPrefix: 'CHAT_',
  apiDataKey: 'rooms',
  apiDataIndex: 'room_id'
}

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  ...baseActionsWriteApi(REDUX_CONFIG.statePrefix),

  // Text chat actions

  // Initialise chat
  chatInit: null,

  // Chat key handshake is successful
  chatKeyHandshakeSuccessful: null,

  // Reconnect chat when device comes from background to foreground
  chatReconnect: null,

  // Chat socket disconnected
  chatSocketConnecting: null,
  chatSocketConnected: null,
  chatSocketDisconnected: null,
  resetChatSocketConnectionState: null,
  chatSocketConnectingStarted: null,

  socketConnectionEstablished: null,

  chatSetMemberPublicKey: ['data'],

  chatAutoJoinedRoom: ['data'],

  // Set room map key
  setRoomsMap: ['data'],

  // Create room
  chatCreateRoomRequest: ['identityEmail', 'identityName', 'contactEmail', 'isWebApp'],
  chatCreateRoomSuccess: ['data'],
  chatCreateRoomError: ['error'],

  // Setup existing room
  chatSetupExistingRoomRequest: ['roomId', 'identityEmail', 'identityName', 'contactEmail'],
  chatSetupExistingRoomError: ['error'],

  // Join a room
  chatJoinRoomRequest: ['roomId', 'identityEmail'],
  chatJoinRoomSuccess: ['data'],
  chatJoinRoomError: ['error'],

  // Leave a room
  chatLeaveRoomRequest: ['roomId', 'resolve', 'reject'],
  chatLeaveRoomSuccess: ['data'],
  chatLeaveRoomError: ['error'],

  // action used to set `inviteInProgress` flag on a room
  // special case - when there is an existing room but the other person has left the room,
  // so when the current user sends a message, the other person is invited to join the room back.
  // This flag will be used to avoid multiple invites when the user sends multiple messages without waiting for success of previous messages.
  chatSetRoomInviteInProgress: ['roomId', 'payload'],

  // when the other memeber is invited successfully, update the `is_joined` flag on rooms `history` and `memebers` array to prevent multiple invites to happen
  chatRoomInviteSuccess: ['roomId', 'userEmail'],

  // update a room settings
  chatUpdateRoomSettingsRequest: ['roomId', 'settings'],
  chatUpdateRoomSettingsSuccess: ['data', 'settings'],
  chatUpdateRoomSettingsError: ['error'],

  chatRefreshRoomRequest: ['roomId', 'bulk'],
  chatRefreshRoomSuccess: ['data'],
  chatBulkRefreshRoomSuccess: ['data'],
  chatRefreshRoomError: ['error'],

  // Send ephemeral nudge in a room
  chatSendNudgeRequest: ['roomId', 'displayName'],
  chatSendNudgeSuccess: ['data'],
  chatNudgeChange: ['roomId'],
  chatSendNudgeError: ['error'],

  // Send message on a room
  chatSendMessageRequest: ['roomId', 'message', 'isE2EE'],
  chatSendMessageSuccess: ['data', 'message'],
  chatSendMessageError: ['error'],

  chatSendFileRequest: ['roomId', 'data', 'onProgress'],

  // Fetch messages on room
  chatGetMessagesRequest: ['roomId', 'paginate', 'paginateNew', 'messageId', 'limit'],
  chatGetMessagesSuccess: ['data', 'paginateNew', 'stopLoading'],
  chatGetMessagesError: ['roomId'],
  chatSetNoMoreMessagesAvailable: ['roomId'],

  // Received a message on a room
  chatMessageReceived: ['data', 'isE2EE'],
  chatMessageModified: ['data', 'isE2EE'],
  chatMessageChangeId: ['roomId', 'messageId', 'newMessageId', 'isE2EE'],

  // User starts/stops typing
  chatStartedTyping: ['roomId', 'isE2EE'],
  chatStoppedTyping: ['roomId', 'isE2EE'],

  // Other user starts/stops typing
  chatOtherUserStartedTyping: ['roomId', 'member', 'isE2EE'],
  chatOtherUserStoppedTyping: ['roomId', 'member', 'isE2EE'],

  // Ack a message (mark as read)
  chatAckMessage: ['roomId', 'messageId', 'isE2EE', 'isDeliveryAck'],

  // Mark a message as delivered
  chatMessageDelivered: ['roomId', 'messageId'],

  chatPeekNewMessageCountRequest: ['roomId', 'lastReadMessageId'],
  chatPeekNewMessageCountSuccess: ['data'],

  chatRemoveMessagesOnLastRestrictedMessageIdChange: ['roomId', 'lastRestrictedMessageId'],

  // file
  chatSaveMessageFile: ['roomId', 'messageId'],

  // caching
  chatForceRefresh: null,
  chatFetchFromCache: ['dataFromAPI', 'payload'],
  chatForceFetchNewMessages: ['roomId'],
  chatGetFromCacheOrRequest: ['payload'],
  chatSuccessForCache: ['data'],
  chatRoomReadyForSync: ['roomId'],
  chatGetMessagesSuccessForCache: ['data', 'paginateNew'],
  chatMessageSanityCheckSuccess: ['data', 'messageId']
})

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('chat', [
  { type: 'sendInvite', endpoint: 'ChatSendInvite', getTranslatedError: true },
  { type: 'canMemberChat', endpoint: 'ChatMember', getTranslatedError: true }
])

export const ChatTypes = merge(Types, APITypes)
export const ChatCreators = merge(Creators, APICreators)
export const ChatAPITypesToSagas = APITypesToSagas
export default ChatCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  ...APIState,

  socketConnecting: false,
  socketConnected: false,
  socketDown: false,

  // Keep track of existing rooms with
  // identity - contact email
  // `${room.member_email}__${contact.email}` => true
  roomsMap: {},
  memberPublicKey: {}
})

/* ------------- Reducers ------------- */

const getKey = isE2EE => (isE2EE ? 'e2ee' : 'regular')

const reset = () => INITIAL_STATE

const chatJoinRoomSuccess = (state, { data }) => {
  if (path(['data', data.room_id], state)) {
    return createUpdateItemSuccessReducer('room_id')(state, {
      data: {
        ...data,
        joined: true,
        // membersTyping: {},
        isLoadingMessages: false,
        noMoreMessagesAvailable: false
      }
    })
  }

  return createItemSuccessReducer('room_id')(state, {
    data: {
      ...data,
      joined: true,
      regular: {
        messages: {},
        messageIds: [],
        membersTyping: {}
      },
      e2ee: {
        messages: {},
        messageIds: [],
        membersTyping: {}
      },
      // membersTyping: {},
      isLoadingMessages: false,
      noMoreMessagesAvailable: false
    }
  })
}

const chatLeaveRoomRequest = (state, { roomId }) => state.setIn(['data', roomId, 'isLeavingRoom'], true)

const chatLeaveRoomSuccess = (state, { data }) => state
  // remove the id from the dataOrder
  .set('dataOrder', state.dataOrder.filter(roomId => roomId !== data.room_id))
  // remove the room from data
  .merge({ data: state.data.without(data.room_id) })

const chatLeaveRoomError = (state, { roomId }) => state.setIn(['data', roomId, 'isLeavingRoom'], false)

const chatUpdateRoomSettingsSuccess = (state, { data, settings }) => {
  const room = state.data[data.room_id]
  return state.setIn(['data', data.room_id], room.merge(settings))
}

const chatGetMessagesRequest = (state, { roomId }) => state.setIn(['data', roomId, 'isLoadingMessages'], true)

const chatGetMessagesError = (state, { roomId }) => !roomId ? state : state.setIn(['data', roomId, 'isLoadingMessages'], false)

const chatGetMessagesSuccess = (state, { data, paginateNew, stopLoading = true }) => {
  const existingMessages = path(['data', data.room_id, 'regular', 'messages'], state) || Immutable([])
  const existingMessageIds = path(['data', data.room_id, 'regular', 'messageIds'], state) || Immutable([])

  if (!paginateNew && (!data.messages || !data.messages.length)) {
    return state
      .setIn(['data', data.room_id, 'noMoreMessagesAvailable'], true)
      .setIn(['data', data.room_id, 'isLoadingMessages'], false)
  }

  const newMessageIds = data.messages.map(m => m.message_id)
  newMessageIds.reverse()
  let combinedMessageIds = paginateNew
    ? existingMessageIds.concat(newMessageIds)
    : newMessageIds.concat(existingMessageIds)

  combinedMessageIds = uniq(combinedMessageIds)
  combinedMessageIds = sortBy(id => uuidv1ToDate(id), combinedMessageIds)

  const newMessages = {}
  data.messages.map((m) => {
    newMessages[m.message_id] = m
  })

  let _state = state
    .setIn(['data', data.room_id, 'regular', 'messageIds'], combinedMessageIds)
    .setIn(['data', data.room_id, 'regular', 'messages'], merge(existingMessages, newMessages))

  if (stopLoading) {
    _state = _state.setIn(['data', data.room_id, 'isLoadingMessages'], false)
  }

  if (paginateNew && data.messages.length) {
    const lastReadMessageId = path(['data', data.room_id, 'last_read_message_id'], _state)
    // const activeChatRoomId = getActiveChatRoomId()
    // if (
    //   activeChatRoomId !== data.room_id &&
    //   path(['data', data.room_id], _state) &&
    //   lastReadMessageId
    // ) {
    if (lastReadMessageId) {
      _state = _state.setIn(['data', data.room_id, 'regular', 'unreadCount'], getUnreadMessagesCount(lastReadMessageId, combinedMessageIds))
    } else {
      _state = _state.setIn(['data', data.room_id, 'regular', 'unreadCount'], combinedMessageIds.length)
    }

    // }
  }

  return _state
}

const chatRemoveMessagesOnLastRestrictedMessageIdChange = (state, { roomId, lastRestrictedMessageId }) => {
  const existingMessages = path(['data', roomId, 'regular', 'messages'], state) || Immutable([])
  const existingMessageIds = path(['data', roomId, 'regular', 'messageIds'], state) || Immutable([])

  const updatedMessageIds = existingMessageIds.filter(messageId => uuidv1ToDate(messageId) > uuidv1ToDate(lastRestrictedMessageId))
  const updatedMessages = {}
  updatedMessageIds.map((m) => {
    updatedMessages[m] = existingMessages[m]
  })

  let _state = state
    .setIn(['data', roomId, 'regular', 'messageIds'], updatedMessageIds)
    .setIn(['data', roomId, 'regular', 'messages'], updatedMessages)

  return _state
}

const chatMessageSanityCheckSuccess = (state, { data, messageId }) => {
  const room = path(['data', data.room_id], state)
  if (!room) return state

  let existingMessageIds = path(['data', data.room_id, 'regular', 'messageIds'], state) || Immutable([])
  const messageIdIndex = existingMessageIds.indexOf(messageId)
  if (messageIdIndex === -1) return state

  let _state = chatGetMessagesSuccess(state, { data, paginateNew: true, stopLoading: false })
  existingMessageIds = path(['data', data.room_id, 'regular', 'messageIds'], _state) || Immutable([])
  existingMessageIds = existingMessageIds.asMutable()
  const newMessageIds = data.messages.map(m => m.message_id)
  let combinedMessageIds = existingMessageIds.concat(newMessageIds)
  combinedMessageIds = uniq(combinedMessageIds)
  combinedMessageIds = sortBy(id => uuidv1ToDate(id), combinedMessageIds)
  _state = _state.setIn(['data', data.room_id, 'regular', 'messageIds'], combinedMessageIds)
  return _state
}

const chatSetNoMoreMessagesAvailable = (state, { roomId }) => state.setIn(['data', roomId, 'noMoreMessagesAvailable'], true)

const chatSendNudgeRequest = (state, { roomId }) => {
  if (roomId) {
    return state.setIn(['data', roomId, 'is_ephemeral_nudge_sent'], null)
  }
  return state
}

const chatSendNudgeSuccess = (state, { data }) => {
  if (data && data.hasOwnProperty('room_id') && data.hasOwnProperty('status')) {
    return state.setIn(['data', data.room_id, 'is_ephemeral_nudge_sent'], data.status)
  }
  return state
}

const chatSetNudgeDisabled = (state, { roomId }) => {
  if (path(['data', roomId, 'is_ephemeral_nudge_sent'], state)) {
    return state.setIn(['data', roomId, 'is_ephemeral_nudge_sent'], false)
  }
  return state
}

const chatRefreshRoomSuccess = (state, { data }) => createUpdateItemSuccessReducer('room_id')(state, {
  data: { ...(data.rooms[0]), joined: true }
})

const chatMessageReceived = (state, { data, isE2EE }) => {
  const key = getKey(isE2EE)

  const room = path(['data', data.room_id], state)
  if (!room) return state

  // if message is already in the room then ignore
  // because existing messages should be modified
  // only via CHAT_MESSAGE_MODIFIED action
  const existingMessage = path(['data', data.room_id, key, 'messages', data.message_id], state)
  if (existingMessage) {
    return state
  }

  const existingMessageIds = path(['data', data.room_id, key, 'messageIds'], state) || Immutable([])
  let combinedMessageIds = uniq(existingMessageIds.concat([data.message_id]))
  combinedMessageIds = sortBy(id => uuidv1ToDate(id), combinedMessageIds)

  const existingMessages = path(['data', data.room_id, key, 'messages'], state) || Immutable([])
  const combinedMessages = merge(existingMessages, { [data.message_id]: data })

  let _state = state
    .setIn(['data', data.room_id, key, 'messages'], combinedMessages)
    .setIn(['data', data.room_id, key, 'messageIds'], combinedMessageIds)
    .setIn(['data', data.room_id, key, 'last_message_id'], data.message_id)
    .setIn(['data', data.room_id, 'last_message_id'], data.message_id)

  // increment the unread count for the room
  // in case if room is active, the CHAT_ACK_MESSAGE action
  // should be dispatched immidiately, turning unreadCount to 0
  // so active room does not show unreadCount to user
  const currentCount = path(['data', data.room_id, key, 'unreadCount'], state) || 0
  _state = _state.setIn(['data', data.room_id, key, 'unreadCount'], currentCount + 1)

  if (_state.dataOrder[0] !== data.room_id) {
    const roomIdIndex = findIndex(r => r === data.room_id, _state.dataOrder)
    if (roomIdIndex > -1) {
      _state = _state.set('dataOrder', [
        data.room_id,
        ...(_state.dataOrder.slice(0, roomIdIndex)),
        ...(_state.dataOrder.slice(roomIdIndex + 1))
      ])
    }
  }

  return _state
}

const chatMessageModified = (state, { data, isE2EE }) => {
  const key = getKey(isE2EE)
  const currentMessageData = path(['data', data.room_id, key, 'messages', data.message_id], state)

  // if there is no message found at that place then nothing to modify
  if (!currentMessageData) {
    return state
  }

  return state
    .setIn(['data', data.room_id, key, 'messages', data.message_id], currentMessageData.merge(data))
}

const chatMessageChangeId = (state, {
  roomId, messageId, newMessageId, isE2EE
}) => {
  const key = getKey(isE2EE)

  // if message does not exist then can't do a thing
  const message = path(['data', roomId, key, 'messages', messageId], state)
  if (!message) {
    return state
  }

  // replace the id in ids array
  let existingMessageIds = path(['data', roomId, key, 'messageIds'], state) || Immutable([])
  existingMessageIds = existingMessageIds.asMutable()
  const messageIdIndex = existingMessageIds.indexOf(messageId)
  if (messageIdIndex === -1) {
    return state
  }
  existingMessageIds.splice(messageIdIndex, 1, newMessageId)
  let modifiedMessageIds = Immutable(existingMessageIds)
  modifiedMessageIds = sortBy(id => uuidv1ToDate(id), modifiedMessageIds)

  // set old id to null and assign old message to a new id
  const mutableMessage = message.asMutable()
  const existingMessages = path(['data', roomId, key, 'messages'], state) || Immutable({})
  const modifiedMessages = existingMessages.merge({
    [messageId]: null,
    [newMessageId]: {
      ...mutableMessage,
      message_id: newMessageId
    }
  })

  const _state = state
    .setIn(['data', roomId, key, 'messages'], modifiedMessages)
    .setIn(['data', roomId, key, 'messageIds'], modifiedMessageIds)

  return _state
}

const chatSetRoomInviteInProgress = (state, { roomId, payload }) => state.setIn(['data', roomId, 'inviteInProgress'], payload)

const chatRoomInviteSuccess = (state, { roomId, userEmail }) => {
  let room = path(['data', roomId], state)
  if (!room) return state

  const contactIndex = room.history.findIndex(item => item.email === userEmail)
  room = room.setIn(['history', contactIndex, 'is_joined'], true)
  room = room.setIn(['members'], room.history)
  return state.setIn(['data', roomId], room)
}

const chatOtherUserStartedTyping = (state, { roomId, member, isE2EE }) => state.setIn(['data', roomId, isE2EE ? 'e2ee' : 'regular', 'membersTyping', member], true)

const chatOtherUserStoppedTyping = (state, { roomId, member, isE2EE }) => state.setIn(['data', roomId, isE2EE ? 'e2ee' : 'regular', 'membersTyping', member], false)

const chatAckMessage = (state, { roomId, messageId, isE2EE, isDeliveryAck }) => {
  if (isDeliveryAck) return state
  const room = path(['data', roomId], state)
  if (!room) return state

  const key = getKey(isE2EE)
  state = state.setIn(['data', roomId, 'last_read_message_id'], messageId)
  return state.setIn(['data', roomId, key, 'unreadCount'], 0)
}

const chatPeekNewMessageCountSuccess = (state, { data }) => {
  const room = path(['data', data.room_id], state)
  if (!room) return state
  return state.setIn(['data', data.room_id, 'regular', 'unreadCount'], data.total)
}

const chatAutoJoinedRoom = (state, { data }) => {
  const _state = state
    .setIn(['data', data.room_id], data)
    .setIn(['dataOrder'], uniq(Immutable([data.room_id]).concat(state.dataOrder)))

  const contact = getContactMember(data)
  return _state.setIn(['roomsMap', `${data.member_email}__${contact.email}`], data.room_id)
}

/* ------------- Hookup Reducers To Types ------------- */

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types,
  REDUX_CONFIG.apiDataKey, REDUX_CONFIG.apiDataIndex
)
const BASE_REDUCERS_WRITE_API = baseApiWriteReducerInit(REDUX_CONFIG.reducerPrefix, Types)

// Piggy back on createDataSuccessReducer and populate roomsMap
const chatSuccess = (state, payload) => {
  let _state = createDataSuccessReducer('rooms', 'room_id')(state, payload)

  const sortedRoomIds = sortBy(id => uuidv1ToDate(_state.data[id].last_message_id || _state.data[id].room_id), _state.dataOrder)
  _state = _state.set('dataOrder', reverse(sortedRoomIds))

  return _state
}

const chatCreateRoomSuccess = (state, payload) => {
  let _state = state
  if (path(['data', payload.data.room_id], state)) {
    _state = createUpdateItemSuccessReducer('room_id')(state, { data: payload.data })
  } else {
    _state = createItemSuccessReducer('room_id')(state, payload)
  }
  const contact = getContactMember(payload.data)
  return _state.setIn(['roomsMap', `${payload.data.member_email}__${contact.email}`], payload.data.room_id)
}

const chatMessageDelivered = (state, { roomId, messageId }) => state.setIn(['data', roomId, 'last_delivered_message_id'], messageId)

const chatSetMemberPublicKey = (state, { data }) => state.setIn(['memberPublicKey'], data)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,
  ...BASE_REDUCERS_WRITE_API,
  ...APIReducers,

  [Types.CHAT_SOCKET_CONNECTED]: state => state.merge({
    socketConnected: true,
    socketDown: false,
    socketConnecting: false
  }),

  [Types.CHAT_SOCKET_DISCONNECTED]: state => state.merge({
    socketConnected: false,
    socketDown: true,
    socketConnecting: false,
    memberPublicKey: {}
  }),

  [Types.RESET_CHAT_SOCKET_CONNECTION_STATE]: state => state.merge({
    socketConnected: false,
    socketDown: false,
    socketConnecting: false
  }),

  [Types.CHAT_SOCKET_CONNECTING]: state => state.set('socketConnecting', true),

  [Types.SET_ROOMS_MAP]: (state, { data }) => state.set('roomsMap', data),
  [Types.CHAT_SET_MEMBER_PUBLIC_KEY]: chatSetMemberPublicKey,
  [Types.CHAT_SUCCESS]: chatSuccess,

  [Types.CHAT_MESSAGE_RECEIVED]: chatMessageReceived,
  [Types.CHAT_MESSAGE_MODIFIED]: chatMessageModified,
  [Types.CHAT_MESSAGE_CHANGE_ID]: chatMessageChangeId,
  [Types.CHAT_CREATE_ROOM_SUCCESS]: chatCreateRoomSuccess,
  // [Types.CHAT_SEND_MESSAGE_SUCCESS]: chatSendMessageSuccess,
  [Types.CHAT_JOIN_ROOM_SUCCESS]: chatJoinRoomSuccess,

  [Types.CHAT_AUTO_JOINED_ROOM]: chatAutoJoinedRoom,

  [Types.CHAT_LEAVE_ROOM_REQUEST]: chatLeaveRoomRequest,
  [Types.CHAT_LEAVE_ROOM_SUCCESS]: chatLeaveRoomSuccess,
  [Types.CHAT_LEAVE_ROOM_ERROR]: chatLeaveRoomError,
  [Types.CHAT_UPDATE_ROOM_SETTINGS_SUCCESS]: chatUpdateRoomSettingsSuccess,

  [Types.CHAT_REFRESH_ROOM_SUCCESS]: chatRefreshRoomSuccess,

  [Types.CHAT_GET_MESSAGES_REQUEST]: chatGetMessagesRequest,
  [Types.CHAT_GET_MESSAGES_SUCCESS]: chatGetMessagesSuccess,
  [Types.CHAT_GET_MESSAGES_ERROR]: chatGetMessagesError,

  [Types.CHAT_SET_ROOM_INVITE_IN_PROGRESS]: chatSetRoomInviteInProgress,
  [Types.CHAT_ROOM_INVITE_SUCCESS]: chatRoomInviteSuccess,

  [Types.CHAT_MESSAGE_SANITY_CHECK_SUCCESS]: chatMessageSanityCheckSuccess,

  [Types.CHAT_SET_NO_MORE_MESSAGES_AVAILABLE]: chatSetNoMoreMessagesAvailable,

  [Types.CHAT_SEND_NUDGE_REQUEST]: chatSendNudgeRequest,
  [Types.CHAT_SEND_NUDGE_SUCCESS]: chatSendNudgeSuccess,
  [Types.CHAT_NUDGE_CHANGE]: chatSetNudgeDisabled,

  [Types.CHAT_OTHER_USER_STARTED_TYPING]: chatOtherUserStartedTyping,
  [Types.CHAT_OTHER_USER_STOPPED_TYPING]: chatOtherUserStoppedTyping,

  [Types.CHAT_ACK_MESSAGE]: chatAckMessage,

  [Types.CHAT_PEEK_NEW_MESSAGE_COUNT_SUCCESS]: chatPeekNewMessageCountSuccess,

  [Types.CHAT_REMOVE_MESSAGES_ON_LAST_RESTRICTED_MESSAGE_ID_CHANGE]: chatRemoveMessagesOnLastRestrictedMessageIdChange,

  [Types.CHAT_MESSAGE_DELIVERED]: chatMessageDelivered,

  [UserTypes.LOGOUT]: reset
})
