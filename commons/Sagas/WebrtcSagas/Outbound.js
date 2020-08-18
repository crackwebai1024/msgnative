import { delay } from 'redux-saga'
import { put, call, select, take, race, fork, cancel } from 'redux-saga/effects'
import NotificationActions from 'commons/Redux/NotificationRedux'

import WebrtcActions, { WebrtcTypes, CALL_END_REASON } from 'commons/Redux/WebrtcRedux'

import {
  WebRTCLib,
  setNativeRemoteDescription,
  createNativeOffer,
  setNativeLocalDescription
} from 'app/Lib/WebRTC'

import { chatAPI } from '../ChatSagas/WebSocket/'
import { OUTBOUND_CALL_TIMEOUT_MS } from './Constants'
import { setupWebRTC, initializeRTCPeerConnection, reportCallEndToServer } from './Setup'
import { prioritiseH264OnSDP } from './Utils'

/**
 * setupWebRTCForOutbound
 *
 * This is the entry point for WebRTC resource setup for outbound calls,
 * called after speaker state, CallKit setup has been done, user has been
 * sent to Video Chat screen.
 *
 * This saga should be spawned, not forked -- this listens for `END_VIDEO_CALL`
 * and cancels the child setupWebRTC fork.
 *
 * @param {string} identityEmail - identity email being used to call from
 * @param {string} contactEmail - contact email being called
 * @param {boolean} audioOnly - whether audio only call
 */
export function * setupWebRTCForOutbound (identityEmail, contactEmail, audioOnly) {
  console.info('setupWebRTCForOutbound: entered')

  // call can ended before this function executes
  if (yield select(s => !s.webrtc.localCallId || s.webrtc.endInProgres)) {
    console.info('setupWebRTCForOutbound: call already ended, exiting')
    return
  }

  const peer = yield call(initializeRTCPeerConnection)
  console.info('setupWebRTCForOutbound: got peer object')
  if (!peer) {
    console.info('setupWebRTCForOutbound - setupWebRTC failed. invalid peer')
    return null
  }

  const process = yield fork(setupWebRTC, peer, processOutboundCall, { identityEmail, contactEmail }, false, audioOnly)

  console.log('setupWebRTCForOutbound: waiting for END_VIDEO_CALL to cancel')
  yield take(WebrtcTypes.END_VIDEO_CALL)

  console.log('setupWebRTCForOutbound: cancelling setupWebRTC')
  yield cancel(process)
}

/**
 * Process Outbound Call.
 *
 * 1) Creates offer on peer
 * 2) Makes the `/webrtc/call` call with sdp offer.
 * 3) Waits for answer, reject or times out after 120 seconds.
 *
 * @param {RTCPeerConnection} peer - the peer object
 * @param {object} outboundData - object containing identityEmail & contactEmail
 * @param {boolean} audioOnly - whether audio only call
 */
function * processOutboundCall (peer, outboundData, audioOnly) {
  if (!outboundData) return

  // We wait until stream is added to the peer before creating the offer
  // otherwise the remote peer won't get the `onaddstream` callback with our stream
  // This callback is called after stream has been added to peer
  // Create the offer now that we have the stream
  yield call(createOffer, peer)

  console.info('processOutboundCall: outboundData - ', outboundData)
  console.info('processOutboundCall: making /webrtc/call request')
  try {
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/webrtc/call',
      args: {
        from_email: outboundData.identityEmail,
        to_email: outboundData.contactEmail,
        sdp_offer: JSON.stringify({
          offer: peer.localDescription,
          candidates: [],
          is_audio_only: audioOnly
        })
      }
    })

    // If call end is in progress or has already ended - when user ended call while above was waiting
    // for response from chatd
    if (yield select(s => !s.webrtc.inProgress || s.webrtc.endInProgres)) {
      console.log('processOutboundCall: found that call was ended after receiving /webrtc/call response, gonna exit now...')
      yield call(reportCallEndToServer, res.call_id, CALL_END_REASON.CANCELLED)
      return
    }

    console.info('processOutboundCall: /webrtc/call response - ', res)
    if (res) {
      yield put(WebrtcActions.setCallId(res.call_id))
    }

    if (res && !res.status) {
      console.log('calling endVideoCall: unsupported callee device')
      yield put(WebrtcActions.endVideoCall(CALL_END_REASON.UNSUPPORTED))
      return
    }

    console.info('processOutboundCall: about to yield race on [answered, rejected, timeout]')
    const result = yield race({
      answered: take(WebrtcTypes.OUTBOUND_VIDEO_CALL_ANSWER_RECEIVED),
      rejected: take(WebrtcTypes.END_VIDEO_CALL),
      timeout: delay(OUTBOUND_CALL_TIMEOUT_MS)
    })

    console.info('processOutboundCall: /webrtc/call response race result - ', result)

    if (result.answered) {
      const answer = result.answered.data
      console.info('processOutboundCall: answer - ', answer)
      try {
        const parsed = JSON.parse(answer.sdp_answer)
        const sdp = new WebRTCLib.RTCSessionDescription(parsed.answer)
        const isRN = yield select(s => s.device.isReactNative)
        const setRemoteDescription = isRN ? [setNativeRemoteDescription, peer, sdp] : [[peer, peer.setRemoteDescription], sdp]
        const description = yield call(...setRemoteDescription)
        yield put(WebrtcActions.updateRemoteDescription(sdp))
        console.info('processOutboundCall: peer.setRemoteDescription - ', description)
      } catch (e) {
        console.info('processOutboundCall: errror - ', e)
      }
    } else if (result.rejected) {
      console.info('processOutboundCall: call rejected')
      peer.close()
      console.log('calling endVideoCall: outbound call rejected')
      yield put(WebrtcActions.endVideoCall(result.rejected.reason))
    } else if (result.timeout) {
      console.info('processOutboundCall: call timed out')
      peer.close()
      console.log('calling endVideoCall: outbound call timeout')
      yield put(WebrtcActions.endVideoCall(CALL_END_REASON.TIMEOUT))
    }
  } catch (e) {}
}

/**
 * Creates and returns offer for outbound calls for the given peer object.
 *
 * @param {RTCPeerConnection} peer
 */
function * createOffer (peer) {
  console.info('createOffer: entered')
  const isRN = yield select(s => s.device.isReactNative)
  const _createOffer = isRN ? [createNativeOffer, peer] : [[peer, peer.createOffer]]
  const offer = yield call(..._createOffer)
  offer.sdp = prioritiseH264OnSDP(offer.sdp)

  // this kicks off the ICE process in chrome
  // attaches the offer on the peer object
  // as the `onicecandidate` callback fires, this offer is automatically updated
  const setLocalDesc = isRN ? [setNativeLocalDescription, peer, offer] : [[peer, peer.setLocalDescription], offer]
  yield call(...setLocalDesc)
  yield put(WebrtcActions.updateLocalDescription(offer))

  return offer
}
