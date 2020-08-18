import { defineMessages } from 'react-intl'

const ns = 'app.Misc'
const m = defineMessages({
  allow: {
    id: `${ns}.allow`,
    defaultMessage: 'Allow'
  },

  next: {
    id: `${ns}.next`,
    defaultMessage: 'Next'
  },

  accountHistory: {
    id: `${ns}.accountHistory`,
    defaultMessage: 'Account History'
  },

  notFoundMessage: {
    id: `${ns}.not-found-message`,
    defaultMessage: 'Sorry, we can’t seem to find the page you’re looking for.'
  },

  errorCode404: {
    id: `${ns}.error-code-404`,
    defaultMessage: 'Error code: 404.'
  },

  newBuildAvailableMessage: {
    id: `${ns}.new-build-available-message`,
    defaultMessage: "Please <span class='bold'>reload</span> to ensure you are using our latest software update"
  },

  underMaintenanceNote: {
    id: `${ns}.under-maintenance-note`,
    defaultMessage: 'Under Maintenance'
  },

  underMaintenanceMessage: {
    id: `${ns}.under-maintenance-message`,
    defaultMessage: '<span class=\'bold\'>UNDER MAINTENANCE</span> &nbsp; We apologize for the inconvenience, but we’re undergoing scheduled maintenance and upgrades. We will return shortly.'
  },

  maintenanceMessage: {
    id: `${ns}.maintenance-message`,
    defaultMessage: 'We apologize for the inconvenience, but we’re undergoing scheduled maintenance and upgrades. We will return shortly.'
  },

  msgsafeLoading: {
    id: `${ns}.msgsafe-loading`,
    defaultMessage: 'Loading...'
  },

  enableJs1: {
    id: `${ns}.enable-js-1`,
    defaultMessage: 'MsgSafe.io requires {js} to function properly. Please'
  },

  enableJs2: {
    id: `${ns}.enable-js-2`,
    defaultMessage: 'enable JavaScript'
  },

  enableJs3: {
    id: `${ns}.enable-js-3`,
    defaultMessage: 'for your browser.'
  }

})

export default m
