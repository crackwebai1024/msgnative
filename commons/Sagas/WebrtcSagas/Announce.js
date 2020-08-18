import { select, call, fork, take, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { ChatTypes } from 'commons/Redux/ChatRedux'
import { WebrtcTypes } from 'commons/Redux/WebrtcRedux'
import { chatAPI } from '../ChatSagas/WebSocket/'

let webrtcActions = []

export function * localWebrtcActionsCollector (action) {
  webrtcActions.push(action)
}

export function * webrtcAnnouncesDaemon () {
  while (true) {
    yield take(WebrtcTypes.INBOUND_VIDEO_CALL_OFFER_RECEIVED)
    webrtcActions = []
    const announcer = yield fork(localWebrtcActionsAnnouncer)
    yield take(WebrtcTypes.END_VIDEO_CALL)
    yield cancel(announcer)
  }
}

export function * localWebrtcActionsAnnouncer () {
  while (true) {
    if (webrtcActions.length) {
      const callId = yield select(s => s.webrtc.callId)
      if (!chatAPI.ready) {
        yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
      }
      try {
        yield call([chatAPI, chatAPI.sendRequestWithoutResponse], {
          cmd: '/webrtc/announce/event',
          args: {
            call_id: callId,
            call_event_data: JSON.stringify(webrtcActions)
          }
        })
      } catch (e) {}
      webrtcActions = []
    }
    yield delay(1000)
  }
}
