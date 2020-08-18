import { Platform } from 'react-native'
import { select, call, take, put } from 'redux-saga/effects'

import WebrtcActions, { WebrtcTypes } from 'commons/Redux/WebrtcRedux'
import { setSpeakerOn, setSpeakerOff, createSpeakerStateListenerChannel } from './Sound'

export function * listenAndToggleSpeaker () {
  // default settings as defined in ChatRedux
  const enabled = yield select(s => s.webrtc.localSpeakerEnabled)
  if (enabled) {
    setSpeakerOn()
  } else {
    setSpeakerOff()
  }

  // Now wait for changes
  while (true) {
    const action = yield take([
      WebrtcTypes.TOGGLE_CALL_SPEAKER,
      WebrtcTypes.END_VIDEO_CALL
    ])
    if (action.type === 'END_VIDEO_CALL') {
      console.info('* listenAndToggleSpeaker - shutting down loop')
      return
    }
    const enable = action.value
    console.log('listenAndToggleSpeaker: changing state to - ', enable)
    if (enable) {
      setSpeakerOn()
    } else {
      setSpeakerOff()
    }
    console.info('* listenAndToggleSpeaker - newValue=', enable)

    // todo: cleanup
    // iOS will emit speaker state change signal and listenAndToggleOSSpeaker will do it
    // if (Platform.OS === 'android') {
    yield put(WebrtcActions.setCallSpeakerEnabledState(enable))
    // }
  }
}

// This will listen to speaker on/off event outside the app, iOS: CallKit Speaker Button, Android: TBD
export function * listenAndToggleOSSpeaker () {
  console.log('listenAndToggleOSSpeaker: entered')
  const speakerChannel = yield call(createSpeakerStateListenerChannel)
  // Now watch speaker state changes
  while (true) {
    const action = yield take(speakerChannel)
    console.info('listenAndToggleOSSpeaker: received - ', action)
    yield put(WebrtcActions.setCallSpeakerEnabledState(action.speaker))
  }
}
