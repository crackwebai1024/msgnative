import { defineMessages } from 'react-intl'

const ns = 'native.Call'
const m = defineMessages({
  callEndReasonTimeout: {
    id: `${ns}.call-end-reason-timeout`,
    defaultMessage: 'Call Unanswered'
  },

  callEndReasonRejected: {
    id: `${ns}.call-end-reason-rejected`,
    defaultMessage: 'Call Rejected'
  },

  callEndReasonUnsupported: {
    id: `${ns}.call-end-reason-unsupported`,
    defaultMessage: 'User Not Available'
  },

  callEndReasonCancelled: {
    id: `${ns}.call-end-reason-cancelled`,
    defaultMessage: 'Call Cancelled'
  },

  callEndReasonUserBusy: {
    id: `${ns}.call-end-reason-user-busy`,
    defaultMessage: 'User is on another call'
  },

  callEndReasonUnknown: {
    id: `${ns}.call-end-reason-unknown`,
    defaultMessage: 'Call Ended'
  },

  callEndReasonManual: {
    id: `${ns}.call-end-reason-manual`,
    defaultMessage: 'Call Ended'
  },

  callStateConnecting: {
    id: `${ns}.call-state-connecting`,
    defaultMessage: 'Connecting'
  },

  callStateConnected: {
    id: `${ns}.call-state-connected`,
    defaultMessage: 'Connected'
  },

  callStateRinging: {
    id: `${ns}.call-state-ringing`,
    defaultMessage: 'Ringing'
  }
})

export default m
