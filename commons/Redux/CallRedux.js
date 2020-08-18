import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import uuidv1 from 'uuid/v1'
import { path } from 'ramda'
import { UserTypes } from './UserRedux'

/**
 * Note: not in use right now.
 */

export const CALL_STATUS = {
  // dumb status, default when fresh call instance is created
  // so it is not null
  NEW: '@@CALL/STATUS_NEW',

  // the call is ringing, waiting for the callee to pick it up
  PENDING: '@@CALL/STATUS_PENDING',

  // the call is answered by callee
  ANSWERED: '@@CALL/STATUS_ANSWERED',

  // the webrtc setup is happening
  CONNECTING: '@@CALL/STATUS_CONNECTING',

  // the call is on
  ACTIVE: '@@CALL/STATUS_ACTIVE',

  // the call is on hold
  ON_HOLD: '@@CALL/STATUS_ON_HOLD',

  // the call ended
  ENDED: '@@CALL/STATUS_ENDED',

  // the call was made a while ago and got to the callee side
  // long after caller initiated it. This could happen because
  // of poor network on either side
  EXPIRED: '@@CALL/STATUS_EXPIRED',

  // if callee never picked up the call times out
  TIMED_OUT: '@@CALL/STATUS_TIMED_OUT',

  // callee received a call with status === false
  // we set this status in that case
  INVALID: '@@CALL/STATUS_INVALID',

  // callee rejected the call
  REJECTED: '@@CALL/STATUS_REJECTED',

  // caller cancelled the call
  CANCELLED: '@@CALL/STATUS_CANCELLED',

  // the call was ended because of device permission
  // limitations
  RESTRICTED: '@@CALL/STATUS_RESTRICTED'
}

// RTCIceConnectionState enum
// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState
export const ICE_CONNECTION_STATE = {
  NEW: 'new',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DISCONNECTED: 'disconnected',
  CLOSED: 'closed'
}

// RTCIceGatheringState enum
// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceGatheringState
export const ICE_GATHERING_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETE: 'complete'
}

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  create: ['clientId', 'data'],
  setServerId: ['clientId', 'value'],
  setFromEmail: ['clientId', 'value'],
  setToEmail: ['clientId', 'value'],
  setStatus: ['clientId', 'value'],
  setStartTime: ['clientId', 'value'],
  setSdp: ['clientId', 'value'],
  turnOnLocalVideo: ['clientId'],
  turnOffLocalVideo: ['clientId'],
  turnOnRemoteVideo: ['clientId'],
  turnOffRemoteVideo: ['clientId'],
  turnOnLocalAudio: ['clientId'],
  turnOffLocalAudio: ['clientId'],
  turnOnRemoteAudio: ['clientId'],
  turnOffRemoteAudio: ['clientId'],
  turnOnSpeaker: ['clientId'],
  turnOffSpeaker: ['clientId'],
  setLocalFeedUrl: ['clientId', 'value'],
  setRemoteFeedUrl: ['clientId', 'value'],
  setLocalRtcIceConnectionState: ['clientId', 'value'],
  setLocalRtcIceGatheringState: ['clientId', 'value'],
  setLocalRtcDescription: ['clientId', 'value'],
  addLocalRtcIceCandidate: ['clientId', 'value'],
  addLocalError: ['clientId', 'value'],
  setRemoteRtcIceConnectionState: ['clientId', 'value'],
  setRemoteRtcIceGatheringState: ['clientId', 'value'],
  setRemoteRtcDescription: ['clientId', 'value'],
  addRemoteRtcIceCandidate: ['clientId', 'value'],
  addRemoteError: ['clientId', 'value'],
  offer: ['clientId'],
  offerAccept: ['clientId'],
  offerReject: ['clientId'],
  offerTimeout: ['clientId'],
  coldOffer: ['serverId'],
  call: ['clientId'],
  callAccept: ['clientId'],
  callReject: ['clientId'],
  callNoConnection: ['clientId'],
  setupWebrtc: ['clientId'],
  setupWebrtcSuccess: ['clientId'],
  setupWebrtcFail: ['clientId'],
  setIsColdLaunchState: ['clientId', 'value'],
  setIsIncomingState: ['clientId', 'value']
}, {
  prefix: '@@Call/'
})

export const CallTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const CALL_PEER_INITIAL_STATE = {
  videoOn: false,
  audioOn: false,
  speakerOn: false,
  feedUrl: null,
  rtcIceConnectionState: null,
  rtcIceGatheringState: null,
  rtcIceCandidates: [],
  rtcDescription: null,
  errors: []
}

export const CALL_INITIAL_STATE = Immutable({

  // id of a call that we use on client side
  // uuidv1
  clientId: null,

  // id of a call that server assigns
  // uuidv1 <== ?
  serverId: null,

  // the caller
  fromEmail: null,

  // the callee
  toEmail: null,

  // call status
  status: CALL_STATUS.NEW,

  // the start time of the call
  // used to track the call duration
  startTime: null,

  // raw sdp string
  sdp: null,

  local: {
    ...CALL_PEER_INITIAL_STATE
  },

  remote: {
    ...CALL_PEER_INITIAL_STATE
  },

  isColdLaunch: false,

  isIncoming: null
})

export const INITIAL_STATE = Immutable({
  data: {}
})

/* ------------- Reducers ------------- */

const reset = () => INITIAL_STATE

/**
 * Updates a property for a call at given path.
 * @param {array} path The path of a call property. E.g. ['foo', 'bar']
 * translates to ['data', cleintId, 'foo', 'bar']
 */
const updatePath = path => (state, { clientId, value }) => {
  // make sure the call exists
  const call = state.data[clientId]
  if (!call) {
    return state
  }

  // do nothing if value is not passed
  if (value === void 0) {
    return state
  }

  return state.setIn(['data', clientId, ...path], value)
}

const setValueAtPath = (path, value) => (state, { clientId }) => updatePath(path)(state, { clientId, value })

const create = (state, { clientId, data }) => {
  if (clientId) {
    // make sure the call does not exist`
    const call = state.data[clientId]
    if (call) {
      return state
    }
  } else {
    clientId = uuidv1()
  }
  const callState = CALL_INITIAL_STATE.merge(data || {}).setIn(['clientId'], clientId)
  return state.setIn(['data', clientId], callState)
}

const validStatuses = Object.keys(CALL_STATUS).map(i => CALL_STATUS[i])
const setStatus = (state, { clientId, value }) => {
  // make sure value is a valid status
  if (validStatuses.indexOf(value) === -1) {
    return state
  }
  return updatePath(['status'])(state, { clientId, value })
}

const validIceConnectionStates = Object.keys(ICE_CONNECTION_STATE).map(i => ICE_CONNECTION_STATE[i])
const setIceConnectionState = location => (state, { clientId, value }) => {
  // make sure value is a valid ice connection state
  if (validIceConnectionStates.indexOf(value) === -1) {
    return state
  }
  return updatePath([location, 'rtcIceConnectionState'])(state, { clientId, value })
}

const validIceGatheginStates = Object.keys(ICE_GATHERING_STATE).map(i => ICE_GATHERING_STATE[i])
const setIceGatheringState = location => (state, { clientId, value }) => {
  // make sure value is a valid ice gathering state
  if (validIceGatheginStates.indexOf(value) === -1) {
    return state
  }
  return updatePath([location, 'rtcIceGatheringState'])(state, { clientId, value })
}

const pushValueAtPath = pathArr => (state, { clientId, value }) => {
  const call = state.data[clientId]

  // no call no do
  if (!call) {
    return state
  }

  // no value no point
  if (value === void 0) {
    return state
  }
  const values = path(pathArr, call)
  return state.setIn(['data', clientId, ...pathArr], values.concat([value]))
}

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [UserTypes.LOGOUT]: reset,
  [CallTypes.CREATE]: create,
  [CallTypes.SET_SERVER_ID]: updatePath(['serverId']),
  [CallTypes.SET_FROM_EMAIL]: updatePath(['fromEmail']),
  [CallTypes.SET_TO_EMAIL]: updatePath(['toEmail']),
  [CallTypes.SET_STATUS]: setStatus,
  [CallTypes.SET_START_TIME]: updatePath(['startTime']),
  [CallTypes.SET_SDP]: updatePath(['sdp']),
  [CallTypes.TURN_ON_LOCAL_VIDEO]: setValueAtPath(['local', 'videoOn'], true),
  [CallTypes.TURN_OFF_LOCAL_VIDEO]: setValueAtPath(['local', 'videoOn'], false),
  [CallTypes.TURN_ON_REMOTE_VIDEO]: setValueAtPath(['remote', 'videoOn'], true),
  [CallTypes.TURN_OFF_REMOTE_VIDEO]: setValueAtPath(['remote', 'videoOn'], false),
  [CallTypes.TURN_ON_LOCAL_AUDIO]: setValueAtPath(['local', 'audioOn'], true),
  [CallTypes.TURN_OFF_LOCAL_AUDIO]: setValueAtPath(['local', 'audioOn'], false),
  [CallTypes.TURN_ON_SPEAKER]: setValueAtPath(['local', 'speakerOn'], true),
  [CallTypes.TURN_OFF_SPEAKER]: setValueAtPath(['local', 'speakerOn'], false),
  [CallTypes.TURN_ON_REMOTE_AUDIO]: setValueAtPath(['remote', 'audioOn'], true),
  [CallTypes.TURN_OFF_REMOTE_AUDIO]: setValueAtPath(['remote', 'audioOn'], false),
  [CallTypes.SET_LOCAL_FEED_URL]: updatePath(['local', 'feedUrl']),
  [CallTypes.SET_REMOTE_FEED_URL]: updatePath(['remote', 'feedUrl']),
  [CallTypes.SET_LOCAL_RTC_ICE_CONNECTION_STATE]: setIceConnectionState('local'),
  [CallTypes.SET_REMOTE_RTC_ICE_CONNECTION_STATE]: setIceConnectionState('remote'),
  [CallTypes.SET_LOCAL_RTC_ICE_GATHERING_STATE]: setIceGatheringState('local'),
  [CallTypes.SET_REMOTE_RTC_ICE_GATHERING_STATE]: setIceGatheringState('remote'),
  [CallTypes.SET_LOCAL_RTC_DESCRIPTION]: updatePath(['local', 'rtcDescription']),
  [CallTypes.SET_REMOTE_RTC_DESCRIPTION]: updatePath(['remote', 'rtcDescription']),
  [CallTypes.ADD_LOCAL_RTC_ICE_CANDIDATE]: pushValueAtPath(['local', 'rtcIceCandidates']),
  [CallTypes.ADD_REMOTE_RTC_ICE_CANDIDATE]: pushValueAtPath(['remote', 'rtcIceCandidates']),
  [CallTypes.ADD_LOCAL_ERROR]: pushValueAtPath(['local', 'errors']),
  [CallTypes.ADD_REMOTE_ERROR]: pushValueAtPath(['remote', 'errors']),
  [CallTypes.SET_IS_COLD_LAUNCH_STATE]: updatePath(['isColdLaunch']),
  [CallTypes.SET_IS_INCOMING_STATE]: updatePath(['isIncoming'])
})
