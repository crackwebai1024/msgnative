
import { takeLatest, takeEvery } from 'redux-saga/effects'

import { ChatTypes, ChatAPITypesToSagas } from 'commons/Redux/ChatRedux'

import * as chatSagas from './index'

export default [
  ...ChatAPITypesToSagas,

  takeEvery(ChatTypes.CHAT_INIT, chatSagas.chatInit),
  takeEvery(ChatTypes.CHAT_SETUP_EXISTING_ROOM_REQUEST, chatSagas.chatSetupExistingRoomRequest),
  takeEvery(ChatTypes.CHAT_CREATE_ROOM_REQUEST, chatSagas.chatCreateRoomRequest),
  takeEvery(ChatTypes.CHAT_JOIN_ROOM_REQUEST, chatSagas.chatJoinRoomRequest),
  takeEvery(ChatTypes.CHAT_LEAVE_ROOM_REQUEST, chatSagas.chatLeaveRoomRequest),
  takeEvery(ChatTypes.CHAT_UPDATE_ROOM_SETTINGS_REQUEST, chatSagas.chatUpdateRoomSettingsRequest),
  takeEvery(ChatTypes.CHAT_SEND_MESSAGE_REQUEST, chatSagas.chatSendMessageRequest),
  takeEvery(ChatTypes.CHAT_SEND_NUDGE_REQUEST, chatSagas.chatSendNudgeRequest),
  takeEvery(ChatTypes.CHAT_SEND_FILE_REQUEST, chatSagas.chatSendFileRequest),
  takeEvery(ChatTypes.CHAT_REFRESH_ROOM_REQUEST, chatSagas.chatRefreshRoom),
  takeEvery(ChatTypes.CHAT_ACK_MESSAGE, chatSagas.chatAckMessage),
  takeEvery(ChatTypes.CHAT_PEEK_NEW_MESSAGE_COUNT_REQUEST, chatSagas.chatPeekNewMessageCountRequest),
  takeEvery(ChatTypes.CHAT_MESSAGE_RECEIVED, chatSagas.chatMessageStatusWatch),

  takeLatest(ChatTypes.CHAT_STARTED_TYPING, chatSagas.chatStartedTyping),
  takeLatest(ChatTypes.CHAT_STOPPED_TYPING, chatSagas.chatStoppedTyping)
]
