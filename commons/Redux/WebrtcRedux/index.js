import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import { AppTypes } from '../AppRedux'
import { UserTypes } from '../UserRedux'
import { CALL_STATUS_EVENTS } from './Constants'
export {
  ICE_CONNECTION_STATE,
  ICE_GATHERING_STATE,
  EVENT_TYPE,
  GET_USER_MEDIA_STATE,
  CALL_END_REASON,
  CALL_STATUS_EVENTS
} from './Constants'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  // ice connection state
  updateLocalIceConnectionState: ['value'],
  updateRemoteIceConnectionState: ['value'],

  // ice gathering state
  updateLocalIceGatheringState: ['value'],
  updateRemoteIceGatheringState: ['value'],
  addLocalIceCandidate: ['value'],
  addRemoteIceCandidate: ['value'],
  clearLocalIceCandidates: [],

  // session description
  updateLocalDescription: ['value'],
  updateRemoteDescription: ['value'],

  // webrtc.getUserMedia function is expensive
  // we track it to make sure we are not abusing it
  updateLocalGetUserMediaState: ['value'],
  updateRemoteGetUserMediaState: ['value'],

  // Set the stats data from getStats call
  setWebrtcStats: ['value'],

  // Make an outbound video call offer
  makeOutboundVideoCallOffer: ['identityEmail', 'contactEmail', 'contactDisplayName', 'audioOnly', 'isCanel'],

  // Answer/reject an inbound video call offer
  // Sagas for this should just pick the current call data from store
  // instead of passing it around again
  answerInboundVideoCallOffer: null,

  // Received an inbound video call offer
  inboundVideoCallOfferReceived: ['data', 'isColdLaunch'],

  // Register only valid inbound calls - in progress
  setValidInboundVideoCallOffer: ['data', 'isColdLaunch'],

  // Register Inbound Video Call offer without saga - It does not care valid or invalid calls - old, invalid
  setInboundVideoCallOffer: ['data'],

  // Received an answer to outbound video call offer
  outboundVideoCallAnswerReceived: ['data'],

  outboundCallDelivered: ['callId'],

  // Call IDs
  // Dedicated action because we don't have call_id
  // when an outbound call process is kicked off
  // until /webrtc/call is talked to.
  // Same reason for the use of a local id
  setCallId: ['value'],
  setVideoCallLocalId: ['id'],

  // This is fired when we have everything for the call and are ready to go
  beginVideoCall: null,

  // Set local feed URL
  localVideoFeedReady: ['url'],

  // Set remote feed URL
  setVideoCallRemoteFeedUrl: ['url'],

  toggleCallMic: ['value'],
  toggleCallCamera: ['value'],
  toggleCallSpeaker: ['value'],
  setCallSpeakerEnabledState: ['value'],

  // Remote toggled their video camera on/off
  remoteToggledCallCamera: ['value'],

  // Dispatched by UI, ice connection failure and other places
  // This extracts the current redux slice data and dispatches
  // processCallEnd with it and then dispatches webrtcReset
  endVideoCall: ['reason', 'endedByRemote'],

  setCallEndInProgress: null,

  // Dispatched by endVideoCall and is listened to by the sagas
  // responsible with post-call tasks
  processCallEnd: ['callId', 'data'],

  // Inbound call UI
  displayInboundCall: null,
  hideInboundCall: null,

  // FIXME: webapp UI specific
  endChatCall: ['payload'],

  // Track `iceConnectionState` === 'connected'
  setCallIsConnectedState: ['value'],

  // iOS only
  setAudioSessionActivated: ['value'],

  // set ice servers
  setIceServers: ['value'],

  logCallEvent: ['value'],

  // reset
  webrtcReset: null,
  // start ringer

  startRinger: null
})

export const WebrtcTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  local: {
    iceConnectionState: null,
    iceGatheringState: null,
    iceCandidates: Immutable([]),
    description: null,
    getUserMediaState: null,
    flowState: null,
    webrtcStats: null
  },

  remote: {
    iceConnectionState: null,
    iceGatheringState: null,
    iceCandidates: Immutable([]),
    description: null,
    getUserMediaState: null,
    flowState: null
  },

  // Call diagnostics data
  // Sent to server once call is over
  diagnostics: {
    // call initiated timestamp
    // for callee, it is when user accepts the call
    callInitiatedTimestamp: null,

    // values with time elapsed since call was initiated
    iceCandidates: [],
    iceConnectionStates: [],
    iceGatheringStates: [],
    deviceNetworkChanges: [],
    events: [],

    // selectedLocalIceCandidate: null,
    // selectedRemoteIceCandidate: null,
  },

  // Set to true as soon as there's an inbound or outbound call
  inProgress: false,

  // Whether call is connected
  isConnected: false,

  // Call start time
  startTime: null,
  endTime: null,

  // Local call id, used for outbound calls
  localCallId: null,
  callId: null,

  // Whether outbound call
  isOutboundCall: null,
  identityEmail: null, // our identity
  contactEmail: null, // contact's email
  contactDisplayName: null,

  // Outbound call data & answer
  outboundCallData: null,
  outboundCallAnswer: null,
  outboundCallDelivered: false,

  // Inbound video call offer
  inboundCallOffer: null,

  // Whether initiated as audio only
  initiatedAsAudioOnly: null,

  // Mic
  localMicEnabled: null,
  remoteMicEnabled: null,

  // Camera
  localCameraEnabled: null,
  remoteCameraEnabled: null,

  // Speaker
  localSpeakerEnabled: null,

  // Video call feed
  localFeedURL: null,
  remoteFeedURL: null,

  endInProgress: false,
  callEndReason: null,

  // Whether cold launched for incoming call
  isColdLaunch: false,

  // Track whether audio session has been activated on iOS
  iOSAudioSessionActivated: false,

  // Default STUN/TURN servers
  iceServers: [{
    urls: 'turn:blink.msgsafe.io:443?transport=tcp',
    username: 'a9a2b514',
    credential: '00163e7826d6'
  }],

  // Used on webapp
  inboundCallUIVisible: false
})

/* ------------- Reducers ------------- */

const addCallDiagnosticsEvent = (state, event) => state.setIn(['diagnostics', 'events'], state.diagnostics.events.concat([{ value: event, timestamp: new Date() }]))

// ice connection state
export const updateLocalIceConnectionState = (state, { value }) =>
  state
    .setIn(['local', 'iceConnectionState'], value)
    .setIn(['diagnostics', 'iceConnectionStates'], state.diagnostics.iceConnectionStates.concat([{ value, timestamp: new Date() }]))

export const updateRemoteIceConnectionState = (state, { value }) =>
  state.setIn(['remote', 'iceConnectionState'], value)

// ice gathering state
export const updateLocalIceGatheringState = (state, { value }) =>
  state
    .setIn(['local', 'iceGatheringState'], value)
    .setIn(['diagnostics', 'iceGatheringStates'], state.diagnostics.iceGatheringStates.concat([{ value, timestamp: new Date() }]))

export const updateRemoteIceGatheringState = (state, { value }) =>
  state.setIn(['remote', 'iceGatheringState'], value)

export const addLocalIceCandidate = (state, { value }) =>
  state
    .setIn(['local', 'iceCandidates'], state.local.iceCandidates.concat([value]))
    .setIn(['diagnostics', 'iceCandidates'], state.diagnostics.iceCandidates.concat([{ value, timestamp: new Date() }]))

export const clearLocalIceCandidates = state =>
  state.setIn(['local', 'iceCandidates'], Immutable([]))

export const addRemoteIceCandidate = (state, { value }) =>
  state.setIn(['remote', 'iceCandidates'], state.remote.iceCandidates.concat([value]))

// session description
export const updateLocalDescription = (state, { value }) =>
  state.setIn(['local', 'description'], value)

export const updateRemoteDescription = (state, { value }) =>
  state.setIn(['remote', 'description'], value)

export const updateLocalGetUserMediaState = (state, { value }) =>
  state.setIn(['local', 'getUserMediaState'], value)

export const updateRemoteGetUserMediaState = (state, { value }) =>
  state.setIn(['remote', 'getUserMediaState'], value)

const setWebrtcStats = (state, { value }) =>
  state.setIn(['local', 'webrtcStats'], value)

const displayInboundCallUI = state => state.set('inboundCallUIVisible', true)
const hideInboundCallUI = state => state.set('inboundCallUIVisible', false)

const makeOutboundVideoCallOffer =
  (state, {
    identityEmail, contactEmail, contactDisplayName, audioOnly, isCancel
  }) => {
    if (!isCancel) {
      return addCallDiagnosticsEvent(state, CALL_STATUS_EVENTS.OUTBOUND_CALL_STARTED)
        .merge({
          inProgress: true,
          isOutboundCall: true,
          initiatedAsAudioOnly: audioOnly,
          localMicEnabled: true,
          remoteMicEnabled: true,
          localCameraEnabled: !audioOnly,
          remoteCameraEnabled: !audioOnly,
          localSpeakerEnabled: !audioOnly,
          outboundCallData: { identityEmail, contactEmail, contactDisplayName }, // todo: remove this
          identityEmail,
          contactEmail,
          contactDisplayName
        })
        .setIn(['diagnostics', 'callInitiatedTimestamp'], new Date())
    } else {
      return state
    }
  }

const localVideoFeedReady = (state, { url }) => {
  console.info('Local Video Feed Ready:', state)
  if (state.inProgress) {
    return state.set('localFeedURL', url)
  } else {
    return state
  }
}

const beginVideoCall = state => state.merge({
  startTime: new Date()
})

const inboundVideoCallOfferReceived = (state, { data, isColdLaunch }) => {

  return addCallDiagnosticsEvent(state, CALL_STATUS_EVENTS.INBOUND_CALL_RECEIVED)
    .merge({
      callId: data.call_id,
      inProgress: true,
      isOutboundCall: false,
      initiatedAsAudioOnly: data.is_audio_only,
      localMicEnabled: true,
      remoteMicEnabled: true,
      localCameraEnabled: !data.is_audio_only,
      remoteCameraEnabled: !data.is_audio_only,
      localSpeakerEnabled: !data.is_audio_only,
      identityEmail: data.to_email,
      contactEmail: data.from_email,
      contactDisplayName: data.from_display_name,
      inboundCallOffer: data,
      isColdLaunch
    })
    .setIn(['diagnostics', 'callInitiatedTimestamp'], new Date())
 }

const outboundVideoCallAnswerReceived = (state, { data }) => {
  console.info('outboundCallAnswer:', data)
  return addCallDiagnosticsEvent(state, CALL_STATUS_EVENTS.OUTBOUND_ANSWER_RECEIVED)
    .set('outboundCallAnswer', data)
}

const setVideoCallLocalId = (state, { id }) =>
  // TODO: should be the local storage
  state.set('localCallId', id)

// iOS only
const setAudioSessionActivated = (state, { value }) => state.set('iOSAudioSessionActivated', !!value)

const trackNetworkChangeForCallDiagnostics = (state, { networkType, networkEffectiveType }) =>
  !state.inProgress ? state : state.setIn(
    ['diagnostics', 'deviceNetworkChanges'],
    state.diagnostics.deviceNetworkChanges.concat([{ networkType, networkEffectiveType, timestamp: new Date() }])
  )

const endVideoCall = (state, { reason }) => state.merge({
  endTime: new Date(),
  localFeedURL: null,
  callEndReason: reason
})

const outboundCallDelivered = (state, { callId }) => {
  if (state.callId !== callId) return state

  return state.set('outboundCallDelivered', true)
}

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.LOG_CALL_EVENT]: (state, { value }) => addCallDiagnosticsEvent(state, value),

  [Types.SET_CALL_ID]: (state, { value }) => state.set('callId', value),

  // ice connection state
  [Types.UPDATE_LOCAL_ICE_CONNECTION_STATE]: updateLocalIceConnectionState,
  [Types.UPDATE_REMOTE_ICE_CONNECTION_STATE]: updateRemoteIceConnectionState,

  // ice gathering state
  [Types.UPDATE_LOCAL_ICE_GATHERING_STATE]: updateLocalIceGatheringState,
  [Types.UPDATE_REMOTE_ICE_GATHERING_STATE]: updateRemoteIceGatheringState,
  [Types.ADD_LOCAL_ICE_CANDIDATE]: addLocalIceCandidate,
  [Types.ADD_REMOTE_ICE_CANDIDATE]: addRemoteIceCandidate,
  [Types.CLEAR_LOCAL_ICE_CANDIDATES]: clearLocalIceCandidates,

  // session description
  [Types.UPDATE_LOCAL_DESCRIPTION]: updateLocalDescription,
  [Types.UPDATE_REMOTE_DESCRIPTION]: updateRemoteDescription,

  // WebRTC.getUserMedia()
  [Types.UPDATE_LOCAL_GET_USER_MEDIA_STATE]: updateLocalGetUserMediaState,
  [Types.UPDATE_REMOTE_GET_USER_MEDIA_STATE]: updateRemoteGetUserMediaState,

  // WebRTC stats
  [Types.SET_WEBRTC_STATS]: setWebrtcStats,

  [Types.SET_CALL_IS_CONNECTED_STATE]: (state, { value }) => state.set('isConnected', value),

  [Types.SET_VALID_INBOUND_VIDEO_CALL_OFFER]: inboundVideoCallOfferReceived,
  [Types.ANSWER_INBOUND_VIDEO_CALL_OFFER]: state => addCallDiagnosticsEvent(state, CALL_STATUS_EVENTS.INBOUND_CALL_ANSWERED),
  [Types.SET_INBOUND_VIDEO_CALL_OFFER]: (state, { data }) => state.set('inboundCallOffer', data),

  [Types.OUTBOUND_VIDEO_CALL_ANSWER_RECEIVED]: outboundVideoCallAnswerReceived,
  [Types.OUTBOUND_CALL_DELIVERED]: outboundCallDelivered,

  // Camera, mic, speaker toggle
  [Types.TOGGLE_CALL_CAMERA]: (state, { value }) => state.set('localCameraEnabled', typeof value !== 'undefined' ? value : !state.localCameraEnabled),
  [Types.TOGGLE_CALL_MIC]: (state, { value }) => state.set('localMicEnabled', typeof value !== 'undefined' ? value : !state.localMicEnabled),
  [Types.SET_CALL_SPEAKER_ENABLED_STATE]: (state, { value }) => state.set('localSpeakerEnabled', value),

  [Types.SET_ICE_SERVERS]: (state, { value }) => state.set('iceServers', value),
  [Types.SET_VIDEO_CALL_LOCAL_ID]: setVideoCallLocalId,

  [Types.BEGIN_VIDEO_CALL]: beginVideoCall,
  [Types.SET_VIDEO_CALL_REMOTE_FEED_URL]: (state, { url }) => state.set('remoteFeedURL', url),
  [Types.LOCAL_VIDEO_FEED_READY]: localVideoFeedReady,
  [Types.MAKE_OUTBOUND_VIDEO_CALL_OFFER]: makeOutboundVideoCallOffer,
  [Types.SET_AUDIO_SESSION_ACTIVATED]: setAudioSessionActivated,

  [Types.REMOTE_TOGGLED_CALL_CAMERA]: (state, { value }) => state.set('remoteCameraEnabled', value),

  [Types.DISPLAY_INBOUND_CALL]: displayInboundCallUI,
  [Types.HIDE_INBOUND_CALL]: hideInboundCallUI,

  [Types.END_VIDEO_CALL]: endVideoCall,
  [Types.SET_CALL_END_IN_PROGRESS]: state => state.set('endInProgress', true),

  [AppTypes.SET_NATIVE_APP_NETWORK_CONNECTION_INFO]: trackNetworkChangeForCallDiagnostics,

  // reset
  [Types.WEBRTC_RESET]: reset,
  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
