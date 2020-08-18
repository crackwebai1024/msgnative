import { takeLatest, takeEvery } from 'redux-saga/effects'

import { WebrtcTypes } from 'commons/Redux/WebrtcRedux'
import { StartupTypes } from 'commons/Redux/StartupRedux'

import { webrtcAnnouncesDaemon, localWebrtcActionsCollector } from './Announce'
import { listenForRemoteIceConnectionState, endVideoCall, processCallEnd } from './Setup'
import { answerInboundVideoCallOffer } from './Inbound'

export default [
  // Used to end video call if the remote ice connection state is failed
  takeLatest(WebrtcTypes.UPDATE_REMOTE_ICE_CONNECTION_STATE, listenForRemoteIceConnectionState),
  takeEvery(WebrtcTypes.END_VIDEO_CALL, endVideoCall),
  takeLatest(WebrtcTypes.PROCESS_CALL_END, processCallEnd),

  takeLatest(WebrtcTypes.ANSWER_INBOUND_VIDEO_CALL_OFFER, answerInboundVideoCallOffer),

  takeLatest(StartupTypes.STARTUP_SUCCESS, webrtcAnnouncesDaemon),
  takeEvery(WebrtcTypes.UPDATE_LOCAL_ICE_CONNECTION_STATE, localWebrtcActionsCollector),
  takeEvery(WebrtcTypes.UPDATE_LOCAL_ICE_GATHERING_STATE, localWebrtcActionsCollector),
  takeEvery(WebrtcTypes.ADD_LOCAL_ICE_CANDIDATE, localWebrtcActionsCollector)
]
