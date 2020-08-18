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

// Custom event type constants we use to pass webrtc event types
export const EVENT_TYPE = {
  ICE_CONNECTION_STATE_UPDATE: 'WEBRTC_ICE_CONNECTION_STATE_UPDATE',
  ICE_GATHERING_STATE_UPDATE: 'WEBRTC_ICE_GATHERING_STATE_UPDATE',
  ICE_CANDIDATE_ADDITION: 'ICE_CANDIDATE_ADDITION'
}

// Custom event type constants we use to track WebRTC.getUserMedia function
export const GET_USER_MEDIA_STATE = {
  START_AUDIO_VIDEO: 'START_GET_USER_MEDIA_AUDIO_VIDEO',
  END_AUDIO_VIDEO: 'END_GET_USER_MEDIA_AUDIO_VIDEO',
  START_AUDIO: 'START_GET_USER_MEDIA_AUDIO',
  END_AUDIO: 'END_GET_USER_MEDIA_AUDIO'
}

export const CALL_END_REASON = {
  // Call ended by caller before it was accepted by callee
  CANCELLED: 'CANCELLED',

  // Call rejected
  REJECTED: 'REJECTED',

  // Missed call
  TIMEOUT: 'TIMEOUT',

  // Callee doesn't have any supported device
  UNSUPPORTED: 'UNSUPPORTED',

  // Call was successful and call was ended manually
  MANUAL: 'MANUAL',

  // Call failed
  FAILED: 'FAILED',

  // User busy on another call
  USER_BUSY: 'USER_BUSY',

  // Call is invalid, don't call `/webrtc/end`
  CALL_INVALID: 'CALL_INVALID'
}

export const CALL_STATUS_EVENTS = {
  OUTBOUND_CALL_STARTED: 'OUTBOUND_CALL_STARTED',
  OUTBOUND_ANSWER_RECEIVED: 'OUTBOUND_ANSWER_RECEIVED',
  OUTBOUND_CALL_REJECTED: 'OUTBOUND_CALL_REJECTED',
  OUTBOUND_CALL_MISSED: 'OUTBOUND_CALL_MISSED',

  INBOUND_CALL_RECEIVED: 'INBOUND_CALL_RECEIVED',
  INBOUND_CALL_ANSWERED: 'INBOUND_CALL_ANSWERED',
  INBOUND_CALL_REJECTED: 'INBOUND_CALL_REJECTED',

  CALL_STARTED: 'CALL_STARTED',
  CALL_ENDED: 'CALL_ENDED'
}
