import { put, call, select, take } from 'redux-saga/effects'

import { ChatTypes } from 'commons/Redux/ChatRedux'
import WebrtcActions, { WebrtcTypes } from 'commons/Redux/WebrtcRedux'

import { chatAPI } from '../ChatSagas/WebSocket/'

export function * announceCallEvent (action) {
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }
  const callId = yield select(s => s.webrtc.callId)
  try {
    yield call([chatAPI, chatAPI.sendRequestWithoutResponse], {
      cmd: '/webrtc/announce/event',
      args: {
        call_id: callId,
        call_event_data: JSON.stringify(action)
      }
    })
    return true
  } catch (e) {}
}

export function * handleCallEvent (data) {
  const { call_event_data: callEventData } = data
  const action = JSON.parse(callEventData)

  // handle an array of actions
  if (Array.isArray(action)) {
    for (let i = 0; i < action.length; i += 1) {
      yield call(processCallEvent, action[i])
    }
  } else {
    yield call(processCallEvent, action)
  }
}

export function * processCallEvent (action) {
  const { type, value } = action

  if (type === WebrtcTypes.UPDATE_LOCAL_ICE_CONNECTION_STATE) {
    yield put(WebrtcActions.updateRemoteIceConnectionState(value))
    return
  }

  if (type === WebrtcTypes.UPDATE_LOCAL_ICE_GATHERING_STATE) {
    yield put(WebrtcActions.updateRemoteIceGatheringState(value))
    return
  }

  if (type === WebrtcTypes.ADD_LOCAL_ICE_CANDIDATE) {
    yield put(WebrtcActions.addRemoteIceCandidate(value))
    return
  }

  yield call(console.log, 'unhandled call event!', action)
}
