import { takeLatest, takeEvery } from 'redux-saga/effects'

import { AppTypes } from 'commons/Redux/AppRedux'
import { ChatTypes } from 'commons/Redux/ChatRedux'
import { StartupTypes } from 'commons/Redux/StartupRedux'
import { UserTypes } from 'commons/Redux/UserRedux'
import { WebRTCTypes as AppWebRTCTypes } from 'app/Redux/WebRTCRedux'
import { WebrtcTypes } from 'commons/Redux/WebrtcRedux'

import { handleAppStateChange } from './AppState'
import { handleBootCallProcess, handleBootChatProcess } from './ContactActions'
import * as chatSagas from './index'
import ChatCacheSagaBindings from './ChatCacheSagas/SagaBindings'

export default [
  takeLatest(StartupTypes.STARTUP, chatSagas.videoChatRingerDaemon),

  takeLatest(AppTypes.NATIVE_APP_STATE_CHANGED, handleAppStateChange),
  takeLatest(AppWebRTCTypes.BOOT_CALL_PROCESS, handleBootCallProcess),
  takeLatest(AppWebRTCTypes.BOOT_CHAT_PROCESS, handleBootChatProcess),

  takeLatest(ChatTypes.CHAT_INIT, chatSagas.chatInit),

  takeEvery(WebrtcTypes.INBOUND_VIDEO_CALL_OFFER_RECEIVED, chatSagas.inboundVideoCallOfferReceived),
  takeLatest(WebrtcTypes.OUTBOUND_VIDEO_CALL_ANSWER_RECEIVED, chatSagas.outboundVideoCallAnswerReceived),
  takeLatest(WebrtcTypes.PROCESS_CALL_END, chatSagas.processCallEnd),
  // We dispatch this action with isCancel to cancel the current saga.
  takeLatest(WebrtcTypes.MAKE_OUTBOUND_VIDEO_CALL_OFFER, chatSagas.makeOutboundVideoCallOffer),
  takeLatest(ChatTypes.CHAT_MESSAGE_RECEIVED, chatSagas.onChatMessageReceived),

  takeLatest(ChatTypes.CHAT_SETUP_EXISTING_ROOM_ERROR, chatSagas.chatSetupExistingRoomError),
  takeLatest(ChatTypes.CHAT_CREATE_ROOM_ERROR, chatSagas.chatSetupExistingRoomError),
  takeLatest(ChatTypes.CHAT_CREATE_ROOM_SUCCESS, chatSagas.chatCreateRoomSuccess),
  takeLatest(ChatTypes.CHAT_LEAVE_ROOM_SUCCESS, chatSagas.chatLeaveRoomSuccess),

  ...ChatCacheSagaBindings
]
