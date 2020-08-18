import { call, select, take } from 'redux-saga/effects'

import { WebrtcTypes } from 'commons/Redux/WebrtcRedux'

import { chatAPI } from '../ChatSagas/WebSocket/'

export function * listenAndToggleCamera (stream) {
  while (true) {
    const { value } = yield take(WebrtcTypes.TOGGLE_CALL_CAMERA)

    const tracks = stream.getVideoTracks()
    tracks.map((t) => { t.enabled = value })

    // notify peer about video state change
    const callId = yield select(s => s.webrtc.callId)
    if (callId) {
      try {
        yield call([chatAPI, chatAPI.sendRequest], {
          cmd: '/webrtc/remote/video/toggle',
          args: {
            call_id: callId,
            is_enabled: value
          }
        })
      } catch (e) {}
    } else {
      console.info('listenAndToggleCamera: not announcing video toggle; unable to extract call_id')
    }
  }
}

export function * listenAndToggleMic (stream) {
  while (true) {
    const { value } = yield take(WebrtcTypes.TOGGLE_CALL_MIC)

    const tracks = stream.getAudioTracks()
    tracks.map((t) => { t.enabled = value })
  }
}
