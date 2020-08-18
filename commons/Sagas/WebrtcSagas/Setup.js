import { put, call, select, take, spawn, fork, cancel, cancelled } from 'redux-saga/effects'
import { path } from 'ramda'

import { ChatTypes } from 'commons/Redux/ChatRedux'
import WebrtcActions, {
  WebrtcTypes,
  ICE_CONNECTION_STATE,
  GET_USER_MEDIA_STATE,
  CALL_END_REASON
} from 'commons/Redux/WebrtcRedux'

import {
  WebRTCLib,
  getNativeUserMedia,
  getNativeConstraints
} from 'app/Lib/WebRTC'
import { delay } from 'app/Lib/Device'
import { announceCallEvent } from './CallEvents'

import { chatAPI } from '../ChatSagas/WebSocket/'

import { DEFAULT_ICE_UDP, DEFAULT_BROWSER_CONSTRAINTS, audioOnlyConstraints, ALLOW_HOST_SDP } from './Constants'
import { parseCandidate, getLocalMedia, parseWebRTCStats } from './Utils'
import { createIceCandidateChannel, createGotRemoteStreamChannel, createIceConnectionStateChangeChannel } from './ChannelCreators'
import { listenAndToggleCamera, listenAndToggleMic } from './MediaToggle'

/**
 * Listens for remote ICE candidates and spawns addIceCandidateOnlyIfRemoteDescriptionIsSet
 *
 * Usage - forked with peer object from setupWebRTC
 *
 * @param {RTCPeerConnection} peer
 */
function * listenForRemoteICECandidateAndAddToPeer (peer) {
  console.info('listenForRemoteICECandidateAndAddToPeer: running...')
  while (true) {
    const event = yield take(WebrtcTypes.ADD_REMOTE_ICE_CANDIDATE)
    console.info('listenForRemoteICECandidateAndAddToPeer: ADD_REMOTE_ICE_CANDIDATE - ', event)
    // Instead of immediately adding remote ICE candidates, we wait until the remote description is set
    yield spawn(addIceCandidateOnlyIfRemoteDescriptionIsSet, peer, event.value)
  }
}

/**
 * Adds candidate to the peer object once remote description is set on the peer.
 *
 * Usage - spawned from listenForRemoteICECandidateAndAddToPeer function above.
 *
 * @param {RTCPeerConnection} peer
 * @param {string} candidate
 */
function * addIceCandidateOnlyIfRemoteDescriptionIsSet (peer, candidate) {
  // check if remote description has been set, if not wait/take until event updateRemoteDescription
  const remoteDesc = yield select(s => s.webrtc.remote.description)

  if (remoteDesc) {
    console.info('addIceCandidateOnlyIfRemoteDescriptionIsSet: remote description already present...')
  } else {
    console.info('addIceCandidateOnlyIfRemoteDescriptionIsSet: waiting for remote desc')
    yield take(WebrtcTypes.UPDATE_REMOTE_DESCRIPTION)
  }

  try {
    yield call([peer, peer.addIceCandidate], new WebRTCLib.RTCIceCandidate(candidate))
    console.info('addIceCandidateOnlyIfRemoteDescriptionIsSet: added remote ice candidate - ', candidate)
  } catch (e) {
    // console.info('addIceCandidateOnlyIfRemoteDescriptionIsSet: failed to add remote ice candidate - ', candidate)
  }
}

/**
 * Sends local ICE candidates to the remote.  Waits until the remote's ICE gather state is not new.
 *
 * Usage - forked from setupWebRTC
 */
function * sendLocalICECandidates () {
  while (true) {
    console.info('sendLocalICECandidates: listening...')
    const event = yield take(WebrtcTypes.UPDATE_REMOTE_ICE_GATHERING_STATE)
    console.info('sendLocalICECandidates: got event - ', event)

    // if (event.value === 'new') continue

    const candidates = yield select(s => s.webrtc.local.iceCandidates)
    console.info('sendLocalICECandidates: candidates to be sent - ', candidates)
    if (!candidates.length) break

    yield announceCallEvent(candidates.map(c => WebrtcActions.addLocalIceCandidate(c)))
    console.info('sendLocalICECandidates: candidates sent!')
    break
  }
}

/**
 * Create RTCPeerConnection peer object with appropriate ICE config and returns it.
 */
export function * initializeRTCPeerConnection () {
  const iceServers = yield select(s => s.webrtc.iceServers)
  let iceConfig = {
    iceServers
  }
  const isPrefUDP = yield select(s => s.user.data.pref_webrtc_udp)
  if (isPrefUDP === null || isPrefUDP === false) {
    // TCP (already default)
    console.info('* WebRTC: TCP ice')
  } else if (isPrefUDP === true) {
    iceConfig = DEFAULT_ICE_UDP
    console.info('* WebRTC: UDP ice')
  }

  return new WebRTCLib.RTCPeerConnection(iceConfig)
}

/**
 * createStream
 *
 * Creates and returns a stream based on appropriate constraints.
 *
 * @param {boolean} isRN - whether platform is react-native
 * @param {boolean} audioOnly - whether audio only constraint
 */
function * createStream (isRN, audioOnly) {
  let stream

  if (!isRN) {
    // browser specific
    stream = yield call([navigator.mediaDevices, navigator.mediaDevices.getUserMedia], DEFAULT_BROWSER_CONSTRAINTS)
    return stream
  }

  // native specific
  // console.info('localMedia.videoDevices -', localMedia.videoDevices)
  // TODO: video: true, audio: true if we fix the Video rendering issue related with the video toggle
  const constraints = yield call(getNativeConstraints, { video: true, audio: true })

  try {
    yield put(WebrtcActions.updateLocalGetUserMediaState(GET_USER_MEDIA_STATE.START_AUDIO_VIDEO))
    stream = yield call(getNativeUserMedia, constraints)
    yield put(WebrtcActions.updateLocalGetUserMediaState(GET_USER_MEDIA_STATE.END_AUDIO_VIDEO))
  } catch (e) {
    console.info('setupWebRTC: getNativeUserMedia error -', e)
  }

  if (!stream) {
    console.info('setupWebRTC: warning - failing over to audio only constraints')
    try {
      yield put(WebrtcActions.updateLocalGetUserMediaState(GET_USER_MEDIA_STATE.START_AUDIO))
      stream = yield call(getNativeUserMedia, audioOnlyConstraints)
      yield put(WebrtcActions.updateLocalGetUserMediaState(GET_USER_MEDIA_STATE.END_AUDIO))
    } catch (e) {
      console.info('setupWebRTC: getNativeUserMedia (audioOnly) failed, error -', e)
    }
  }

  // we can just have audio only constraint on audio calls
  // disable video tracks if set to audio only call
  if (audioOnly) {
    console.info('setupWebRTC: audio only call, disabing video tracks')
    const tracks = stream.getVideoTracks()
    tracks.map((t) => { t.enabled = false })
  }

  return stream
}

/**
 * setupWebRTC
 *
 * @param {RTCPeerConnection} peer - peer object
 * @param {function} callback - callback to be called once stream has been added on peer
 * @param {object} callbackData - callback data to be passed
 * @param {boolean} isInbound - whether call is inbound
 * @param {boolean} audioOnly - whether audio only call
 */
export function * setupWebRTC (peer, callback, callbackData, isInbound, audioOnly) {
  console.info('setupWebRTC: entered, audioOnly - ', audioOnly)

  let stream
  // Track if stream has been added on peer
  let streamAdded = false

  try {
    const localMedia = yield call(getLocalMedia)
    console.info('setupWebRTC: localMedia - ', localMedia)

    if (!localMedia || !localMedia.isCapable) {
      console.info('setupWebRTC: not capable, exiting')
      yield cancel()
    }

    if (isInbound && !chatAPI.ready) {
      yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
    }

    // Fork all side-effect sagas
    yield fork(listenForRemoteStream, peer)
    yield fork(gatherIceCandidates, peer)
    yield fork(listenForIceConnectionStateChangeChannel, peer)
    yield fork(listenForRemoteICECandidateAndAddToPeer, peer)
    yield fork(sendLocalICECandidates)

    // Create stream
    stream = yield call(createStream, localMedia.isReactNative, audioOnly)
    if (!stream) {
      console.info('setupWebRTC: failed to create stream, exiting')
      yield cancel()
    }

    // Add stream on peer
    yield call([peer, peer.addStream], stream)
    streamAdded = true
    console.info('setupWebRTC: stream added to peer...')

    // At this point, the peer object is ready and stream has been added on it

    // Call the setup callbacks with passed data
    if (callback && callbackData) {
      yield spawn(callback, peer, callbackData, audioOnly)
    }

    // Extract stream URL and store in redux
    const isRN = yield select(s => s.device.isReactNative)
    const localStreamURL = isRN ? stream.toURL() : URL.createObjectURL(stream)
    yield put(WebrtcActions.localVideoFeedReady(localStreamURL))

    // Fork camera and mic toggle functions with stream
    yield fork(listenAndToggleCamera, stream)
    yield fork(listenAndToggleMic, stream)

    // Block this saga until call end action
    // or else it enters finally block immediately
    yield take(WebrtcTypes.END_VIDEO_CALL)

  // handle cancellation
  } finally {
    const isCancelled = yield cancelled()
    console.log('setupWebRTC: cancelled - ', isCancelled)

    if (!isCancelled) return

    if (stream && streamAdded) {
      yield call([peer, peer.removeStream], stream)
    }

    if (stream) {
      yield call([stream, stream.release])
    }

    yield call([peer, peer.close])
  }
}

/**
 * Listens for `onaddstream` callback and dispatches the url to redux.
 *
 * Usage - forked with peer object from setupWebRTC
 *
 * @param peer
 */
function * listenForRemoteStream (peer) {
  console.info('listenForRemoteStream: entered')
  let stream
  try {
    const isReactNative = yield select(s => s.device.isReactNative)
    const channel = yield call(createGotRemoteStreamChannel, peer)
    const ev = yield take(channel)
    stream = ev.stream
    console.info('listenForRemoteStream: got remote stream')
    let url = null
    if (!isReactNative) {
      url = URL.createObjectURL(stream)
    } else {
      url = stream.toURL()
    }
    if (!url) {
      console.info('listenForRemoteStream: unable to extract URL from ev.stream - ', ev.stream)
      return null
    }
    console.info('listenForRemoteStream: stream url - ', url)

    yield put(WebrtcActions.setVideoCallRemoteFeedUrl(url))

    yield take(WebrtcTypes.END_VIDEO_CALL)

  // handle cleanup upon cancellation
  } finally {
    const isCancelled = yield cancelled()
    if (isCancelled && stream) {
      console.log('listenForRemoteStream: cancelled, doing cleanup')
      const tracks = yield call([stream, stream.getTracks])
      for (const track of tracks) {
        yield call([track, track.stop])
      }

      yield call([stream, stream.release])
    }
  }
}

function * updateWebrtcStats (peer) {
  let stats

  try {
    stats = yield call([peer, peer.getStats])
  } catch (e) {
    stats = e
  }

  if (!stats) return

  try {
    console.info('WebRTC stats - ', stats)
    console.info('WebRTC stats parsed - ', parseWebRTCStats(stats))
    yield put(WebrtcActions.setWebrtcStats(parseWebRTCStats(stats)))
  } catch (e) {}
}

/**
 * Listens for ice connection state change.
 *
 * new - Waiting for remote candidates to be added with `peer.addIceCandidate`
 * checking - Received remote candidates & now finding suitable pair for connection
 * connected - Suitable pair identified but more ICE candidates can be shared as per Trickle ICE protocol
 * completed - Checked all ICE candidate pairs & found the best one
 * failed - Exhausted all ICE candidates & failed to find suitable match
 * disconnected - At least one peer has closed connection;  may trigger intermittently and resolve
 *                on its own on unreliable networks and return back to connected state
 * closed - RTCPeerConnection instance has closed and is no longer handling requests
 *
 * Usage - forked with peer object from setupWebRTC
 *
 * @param {RTCPeerConnection} peer
 */
function * listenForIceConnectionStateChangeChannel (peer) {
  console.info('* listenForIceConnectionStateChangeChannel: entered')
  const channel = yield call(createIceConnectionStateChangeChannel, peer)
  let callAlreadyStarted = false

  while (true) {
    const event = yield take(channel)
    console.info('listenForIceConnectionStateChangeChannel: iceConnectionState - ', event.target.iceConnectionState)
    yield put(WebrtcActions.updateLocalIceConnectionState(event.target.iceConnectionState))
    const callId = yield select(s => s.webrtc.callId)
    switch (event.target.iceConnectionState) {
      case ICE_CONNECTION_STATE.CLOSED:
      case ICE_CONNECTION_STATE.FAILED:
        if (!callId) {
          // This is because END_VIDEO_CALL clears outboundCallAnswer, inboundCallOffer
          // And a recently destroyed peerConnection ice state can still fire on closed
          console.info('listenForIceConnectionStateChangeChannel: no callId')
          return
        }
        console.info('listenForIceConnectionStateChangeChannel: call over - callId - ', callId)
        console.log('calling endVideoCall: ice connection changed to - ', event.target.iceConnectionState)
        yield put(WebrtcActions.endVideoCall(CALL_END_REASON.FAILED))
        yield announceCallEvent(WebrtcActions.updateLocalIceConnectionState(event.target.iceConnectionState))
        console.info('listenForIceConnectionStateChangeChannel: exiting')
        return

      case ICE_CONNECTION_STATE.CONNECTED:
        // Call can enter connected => disconnected => connected due to network hiccups
        // so check if call has already been connected once
        if (callAlreadyStarted) continue
        callAlreadyStarted = true
        yield put(WebrtcActions.beginVideoCall())
        yield put(WebrtcActions.setCallIsConnectedState(true))
        yield spawn(updateWebrtcStats, peer)
        yield spawn(reportCallStatsToServer, callId, { 'is_successful': true })
    }
  }
}

/**
 * reportCallStatsToServer
 *
 * Report call stats to the server, for call history records.
 *
 * @param {string} callId - call id
 * @param {object} data - data to be sent to server (call_duration & is_successful)
 * @param {number} delayTime - delay the api call by specific amount of milliseconds
 */
export function * reportCallStatsToServer (callId, data, delayTime) {
  // Allow support for delaying sending call stats payload to server
  // So that it doesn't happen along with other call stuff
  if (delayTime) {
    yield delay(delayTime)
  }

  try {
    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/webrtc/report/stats',
      args: {
        call_id: callId,
        call_stats_data: data
      }
    })
  } catch (e) {}
}

/**
 * Listens for ICE candidates on peer and adds them to redux store
 *
 * Usage - forked with peer object from setupWebRTC
 *
 * @param {RTCPeerConnection} peer
 */
function * gatherIceCandidates (peer) {
  const channel = yield call(createIceCandidateChannel, peer)
  const filteredCandidates = []

  // clear old candidates
  yield put(WebrtcActions.clearLocalIceCandidates())
  // Set initial ice candidate state
  yield put(WebrtcActions.updateLocalIceGatheringState(peer.iceGatheringState))

  // chrome specific behavior - get null candidate as value when its done
  while (true) {
    const data = yield take(channel)

    // update the ice gathering state
    let currentIceGatherState = yield select(s => s.webrtc.local.iceGatheringState)
    if (currentIceGatherState !== peer.iceGatheringState) {
      yield put(WebrtcActions.updateLocalIceGatheringState(peer.iceGatheringState))
      currentIceGatherState = peer.iceGatheringState
    }

    // if we got null from channel then it's done
    if (!data || !data.candidate) {
      // Mark local ice gathering state as complete if candidate is empty
      // before actual ice gathering state itself changes to complete
      // Empty ice candidate does mean that ice gathering is complets
      if (currentIceGatherState !== 'complete') {
        yield put(WebrtcActions.updateLocalIceGatheringState('complete'))
      }
      break
    }

    // parse the candidate
    const parsed = parseCandidate(data.candidate.candidate)

    // include candidate into collection only if ALLOW_HOST_SDP is true
    if (ALLOW_HOST_SDP) {
      if (parsed.type === 'srflx' || parsed.type === 'relay' || parsed.type === 'host') {
        yield put(WebrtcActions.addLocalIceCandidate(data.candidate))
        filteredCandidates.push(data.candidate)
      } else {
        console.info('Invalid Local ICE Candidate:', parsed)
      }
    } else if (parsed.type === 'srflx' || parsed.type === 'relay') {
      yield put(WebrtcActions.addLocalIceCandidate(data.candidate))
      filteredCandidates.push(data.candidate)
    } else {
      console.info('Invalid Local ICE Candidate:', parsed)
    }

    // stop if iceGathering state is 'complete'
    if (peer.iceGatheringState === 'complete') break
  }
  return filteredCandidates
}

/**
 * Listens for remote client's ice connection state (failed or closed) and ends call.
 *
 * Bound to WebrtcTypes.UPDATE_REMOTE_ICE_CONNECTION_STATE
 *
 * @param {*} action
 */
export function * listenForRemoteIceConnectionState (action) {
  console.info('Remote ICE Connection:', action)
  if (action.type === 'closed' || action.type === 'failed' || action.value === 'closed' || action.value === 'failed') {
    // End Video Call
    console.log('calling endVideoCall: remote ice connection changed to ', action.type, action.value)
    yield put(WebrtcActions.endVideoCall(CALL_END_REASON.FAILED))
  }
}

function * reportDiagnostics (callId, data) {
  const args = {
    call_diagnostics_data: {
      diagnostics: data.diagnostics,
      callId: callId,
      isCaller: data.isOutboundCall,
      callType: data.initiatedAsAudioOnly ? 'audio' : 'video',
      ciphers: path(['local', 'webrtcStats', 'ciphers'], data),
      codec: path(['local', 'webrtcStats', 'codec'], data)
    }
  }

  // Delay sending the data by 3s
  yield delay(3000)
  try {
    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/webrtc/report/diagnostics',
      args
    })
  } catch (e) {}
}

export function * reportCallEndToServer (callId, reason) {
  yield spawn([chatAPI, chatAPI.sendRequestWithoutResponse], {
    cmd: '/webrtc/end',
    args: {
      call_id: callId,
      call_end_reason: reason
    }
  })
}

/**
 *
 * Bound to WebrtcTypes.END_VIDEO_CALL
 */
export function * endVideoCall ({ reason, endedByRemote }) {
  console.log('endVideoCall: entered ', reason, endedByRemote)

  if (yield select(s => !s.webrtc.inProgress)) {
    console.log('endVideoCall: no call in progress')
    yield put(WebrtcActions.webrtcReset()) // Clean webrtc for strict clean up
    return
  }

  if (yield select(s => s.webrtc.endInProgress)) {
    console.log('endVideoCall: end already in progress')
    return
  }

  yield put(WebrtcActions.setCallEndInProgress())

  const callId = yield select(s => s.webrtc.callId)

  // call_id can be null if user cancels call immediately after calling
  if (!endedByRemote && callId) {
    yield spawn(reportCallEndToServer, callId, reason)
  }

  const slice = yield select(s => s.webrtc.asMutable())
  yield put(WebrtcActions.processCallEnd(callId, slice))
  yield put(WebrtcActions.webrtcReset())
}

/**
 *  Takes the webrtc redux slice and reports call statistics and diagnostics to the server.
 */
export function * processCallEnd ({ callId, data }) {
  console.log('commons.processCallEnd: entered')

  // Report call duration to chatd
  if (data && data.startTime) {
    const callDuration = (new Date().getTime() - data.startTime) / 1000
    yield spawn(reportCallStatsToServer, callId, { call_duration: Math.round(callDuration) }, 2000)
  }

  yield spawn(reportDiagnostics, callId, data)
}
