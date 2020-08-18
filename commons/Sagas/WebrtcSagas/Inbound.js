import { delay } from 'redux-saga'
import { put, call, select, take, race, fork, cancel, spawn } from 'redux-saga/effects'
import WebrtcActions, { WebrtcTypes, CALL_END_REASON } from 'commons/Redux/WebrtcRedux'
import { ChatTypes } from 'commons/Redux/ChatRedux'

import {
  WebRTCLib,
  setNativeRemoteDescription, createNativeAnswer,
  setNativeLocalDescription
} from 'app/Lib/WebRTC'

import { chatAPI } from '../ChatSagas/WebSocket/'

import { INBOUND_CALL_TIMEOUT_MS } from './Constants'
import { prioritiseH264OnSDP } from './Utils'

import { setupWebRTC, initializeRTCPeerConnection } from './Setup'

/**
 * answerInboundVideoCallOffer
 *
 * Bound to `ANSWER_INBOUND_VIDEO_CALL_OFFER` action and only being used in webapp right.
 */
export function * answerInboundVideoCallOffer () {
  console.info('answerInboundVideoCallOffer: entered')
  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  const data = yield select(s => s.webrtc.inboundCallOffer)
  if (!data) return

  yield spawn(setupWebRTCForInbound, data)
}

/**
 * useOfferAndCreateAnswer
 *
 * - sets SDP offer as remote description on peer object and then create sdp answer
 * - munges the created sdp answer with prioritiseH264OnSDP to prioritise H264 codec
 * - sets this answer as local description
 *
 * @param {RTCPeerConnection} peer - peer object
 * @param {string} originalOffer - SDP offer string
 */
function * useOfferAndCreateAnswer (peer, originalOffer) {
  console.info('useOfferAndCreateAnswer: entered;  originalOffer - ', originalOffer)
  const isRN = yield select(s => s.device.isReactNative)

  const sdp = new WebRTCLib.RTCSessionDescription(originalOffer)
  if (!sdp) {
    console.info('useOfferAndCreateAnswer: RTCSessionDescription failed on originalOffer')
    return null
  }

  // Set remote description on peer
  console.info('useOfferAndCreateAnswer: setting remote desc...')
  const setRemoteDesc = isRN ? [setNativeRemoteDescription, peer, sdp] : [[peer, peer.setRemoteDescription], sdp]
  const res = yield call(...setRemoteDesc)
  if (!res) {
    console.info('useOfferAndCreateAnswer: failed to setRemoteDescription sdp -', sdp)
  }
  yield put(WebrtcActions.updateRemoteDescription(sdp))

  // Create answer
  const createAnswer = isRN ? [createNativeAnswer, peer] : [[peer, peer.createAnswer]]
  const answer = yield call(...createAnswer)
  answer.sdp = prioritiseH264OnSDP(answer.sdp)

  // Set local description with answer
  const setLocalDesc = isRN ? [setNativeLocalDescription, peer, answer] : [[peer, peer.setLocalDescription], answer]
  yield call(...setLocalDesc)
  yield put(WebrtcActions.updateLocalDescription(answer))

  return answer
}

/**
 * setupWebRTCForInbound
 *
 * This is the entry point for WebRTC resource setup for inbound calls,
 * called after inbound call UI has been rendered and user has accepted
 * the call.
 *
 * This saga should be spawned, not forked -- this listens for `END_VIDEO_CALL`
 * and cancels the child setupWebRTC fork.
 *
 * - creates peer object
 * - calls setupWebRTC with processInboundCall callback
 * - waits for `END_VIDEO_CALL` action and then cancels the setupWebRTC fork
 *
 * @param {object} data - object with keys - sdp_offer, call_id, is_audio_only
 */
export function * setupWebRTCForInbound (data) {
  const peer = yield call(initializeRTCPeerConnection)
  console.info('setupWebRTCForInbound: peer object ready')

  if (!peer) {
    console.info('setupWebRTCForInbound: failed to create peer object - ', peer)
    return
  }

  const parsed = JSON.parse(data.sdp_offer)
  const processInboundCallData = { callId: data.call_id, offer: parsed.offer }
  const process = yield fork(setupWebRTC, peer, processInboundCall, processInboundCallData, true, data.is_audio_only)

  console.log('setupWebRTCForInbound: waiting for END_VIDEO_CALL to cancel')
  yield take(WebrtcTypes.END_VIDEO_CALL)

  console.log('setupWebRTCForInbound: cancelling setupWebRTC')
  yield cancel(process)
}

/**
 * processInboundCall
 *
 * - used a callback for setupWebRTC
 * - waits for websocket connect if it's not, times out at 60 seconds
 * - sends answer on `/webrtc/answer` without candidates
 *
 * @param peer
 * @param callId
 * @param answer
 */
function * processInboundCall (peer, { callId, offer }, audioOnly) {
  console.info('processInboundCall: entered')

  const answer = yield call(useOfferAndCreateAnswer, peer, offer)
  console.info('processInboundCall: received answer from useOfferAndCreateAnswer - ', answer)

  if (!chatAPI.ready) { // Socket connection is not ready
    console.info('processInboundCall: socket not ready, waiting for handshake or timeout')
    const result = yield race({
      connected: take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL),
      timeout: delay(INBOUND_CALL_TIMEOUT_MS)
    })

    if (result.timeout) {
      console.info('processInboundCall: call timed out waiting for socket handshake')
      console.log('calling endVideoCall: inbound call timedout')
      yield put(WebrtcActions.endVideoCall(CALL_END_REASON.TIMEOUT))
      return
    }
  }

  try {
    console.info('processInboundCall: sending call answer payload - /webrtc/answer')
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/webrtc/answer',
      args: {
        call_id: callId,
        sdp_answer: JSON.stringify({
          answer: peer.localDescription,
          candidates: []
        })
      }
    })

    console.info('processInboundCall: /webrtc/answer response - ', res)
    if (!res || !res.status) { // Answer call failed
      console.info('processInboundCall: negative response, ending video call')
      console.log('calling endVideoCall: /webrtc/answer returned status false')
      yield put(WebrtcActions.endVideoCall(CALL_END_REASON.CALL_INVALID))
    }
  } catch (e) {}
}
