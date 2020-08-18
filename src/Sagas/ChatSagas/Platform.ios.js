import { eventChannel, END } from 'redux-saga'
import { take, race, call, put, select } from 'redux-saga/effects'
import RNCallKit from 'react-native-callkit'
import WebrtcActions, { WebrtcTypes, CALL_END_REASON } from 'commons/Redux/WebrtcRedux'

const INBOUND_CALL_TIMEOUT_MS = 30000

export function * createDidActivateAudioSessionChannel () {
  return eventChannel((emit) => {
    const cb = () => {
      emit({ test: 1 })

      // Cancel event channel after single emit
      emit(END)
    }

    RNCallKit.addEventListener('didActivateAudioSession', cb)
    return () => { RNCallKit.removeEventListener('didActivateAudioSession', cb) }
  })
}

export function * createEndCallKitChannel (callId) {
  return eventChannel((emit) => {
    const cb = (res) => {
      if (res.callUUID === callId) {
        emit(res)
      } else {
        console.info('createEndCallKitChannel: another call ended - ', res.callId)
      }

      // Cancel event channel after single emit
      emit(END)
    }

    RNCallKit.addEventListener('endCall', cb)
    return () => { RNCallKit.removeEventListener('endCall', cb) }
  })
}

export function * createDidReceiveStartCallActionCallKitChannel () {
  return eventChannel((emit) => {
    // RNCallKitPerformAnswerCallAction
    // RNCallKitDidReceiveStartCallAction

    RNCallKit.addEventListener('didReceiveStartCallAction', emit)
    return () => {
      RNCallKit.removeEventListener('didReceiveStartCallAction', emit)
    }
  })
}

export function * createTimeoutChannel (timeOut) {
  let timeout
  return eventChannel((emit) => {
    timeout = setTimeout(() => {
      emit(true)
    }, timeOut)
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  })
}

export function * showPlatformInboundCallUI (data, isVideo) {
  // TODO: last parameter should be changed to data.from_displayName once backend sends it
  /*
  displayIncomingCall
    uuid: string
    handle: string
    handleType: string (optional)
      generic
      number (default)
      email
    label: String
  */
  RNCallKit.displayIncomingCall(data.call_id, `Incoming: ${data.from_email} => ${data.to_email}`, 'generic', isVideo, data.from_email)

  const answerCallKitChannel = yield call(createDidActivateAudioSessionChannel)
  const endCallKitChannel = yield call(createEndCallKitChannel, data.call_id)
  const timeoutChannel = yield call(createTimeoutChannel, INBOUND_CALL_TIMEOUT_MS)

  console.info('inboundVideoCallOfferReceived - about to yield race on [answer, reject, timeout]')
  // Note: When on real device, and remote debugging is set, timeout doesnt seem to fire.
  return yield race({
    answer: take(answerCallKitChannel),
    reject: take(endCallKitChannel),
    timeout: take(timeoutChannel)
  })
}

/*
  This will be used to end call when cold launched,
  including both - when app hasn't yet been launched and
  app has been launched but screen is locked
*/

export function * listenForEndCallAction (callId, isOutbound) {
  if (!callId) {
    console.info('listenForEndCallAction: no callId passed')
    return
  }

  const endReason = yield race({
    userEnd: take(WebrtcTypes.END_VIDEO_CALL), // TODO: watch only ending video call
    callkitEnd: take(yield call(createEndCallKitChannel, callId))
  })

  if (endReason.callkitEnd) {
    const state = yield select(s => ({
      inProgress: s.webrtc.inProgress,
      isConnected: s.webrtc.isConnected,
      isOutboundCall: s.webrtc.isConnected
    }))

    if (!state.inProgress) return

    let reason
    if (state.isConnected) {
      reason = CALL_END_REASON.MANUAL
    } else {
      reason = isOutbound ? CALL_END_REASON.CANCELLED : CALL_END_REASON.REJECTED
    }

    console.log('calling endVideoCall: listenForEndCallAction - ', reason)
    yield put(WebrtcActions.endVideoCall(reason))
  }
}
