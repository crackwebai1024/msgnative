import { defineMessages } from 'react-intl'

const ns = 'native.CallHistory'
const m = defineMessages({

  title: {
    id: `${ns}.title`,
    defaultMessage: 'Calls'
  },

  detailsTitle: {
    id: `${ns}.details-title`,
    defaultMessage: 'Info'
  },

  allTab: {
    id: `${ns}.all-tab`,
    defaultMessage: 'All'
  },

  missedTab: {
    id: `${ns}.missed-tab`,
    defaultMessage: 'Missed'
  },

  navEdit: {
    id: `${ns}.nav-edit`,
    defaultMessage: 'Edit'
  },

  navDone: {
    id: `${ns}.nav-done`,
    defaultMessage: 'Done'
  },

  noCallsFound: {
    id: `${ns}.no-calls-found`,
    defaultMessage: 'No calls found'
  },

  youhaveNoCallsYet: {
    id: `${ns}.you-have-no-calls-yet`,
    defaultMessage: 'No recent calls'
  },

  noMissedCalls: {
    id: `${ns}.no-missed-calls`,
    defaultMessage: 'No missed calls'
  },

  callTypeIncoming: {
    id: `${ns}.call-type-incoming`,
    defaultMessage: 'Incoming'
  },

  callTypeOutgoing: {
    id: `${ns}.call-type-outgoing`,
    defaultMessage: 'Outgoing'
  },

  callTypeMissed: {
    id: `${ns}.call-type-missed`,
    defaultMessage: 'Missed'
  },

  callStateUnknown: {
    id: `${ns}.call-state-unknown`,
    defaultMessage: 'Call failed'
  },

  callStateAnswered: {
    id: `${ns}.call-state-answered`,
    defaultMessage: 'Answered'
  },

  callStateRejected: {
    id: `${ns}.call-state-rejected`,
    defaultMessage: 'Rejected'
  },

  callStateTimeout: {
    id: `${ns}.call-state-timeout`,
    defaultMessage: 'Timeout'
  },

  callStateUnsupported: {
    id: `${ns}.call-state-unsupported`,
    defaultMessage: 'Unsupported'
  },

  callStateCancelled: {
    id: `${ns}.call-state-cancelled`,
    defaultMessage: 'Cancelled'
  },

  callStateUserBusy: {
    id: `${ns}.call-state-user-busy`,
    defaultMessage: 'User Busy'
  },

  callStateManual: {
    id: `${ns}.call-state-manual`,
    defaultMessage: 'Answered'
  },

  callNotDeleted: {
    id: `${ns}.call-not-deleted`,
    defaultMessage: 'Call Not Deleted'
  }

})

export default m
