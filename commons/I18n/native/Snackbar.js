import { defineMessages } from 'react-intl'

const ns = 'native.Snackbar'
const m = defineMessages({

  contactDeleted: {
    id: `${ns}.contact-deleted`,
    defaultMessage: 'Contact deleted'
  },

  couldntDeleteContact: {
    id: `${ns}.couldnt-delete-contact`,
    defaultMessage: 'Could not Delete the Contact'
  },

  deletingContact: {
    id: `${ns}.deleting-contact`,
    defaultMessage: 'Deleting contact'
  },
  forwardAddressDeleted: {
    id: `${ns}.forward-address-deleted`,
    defaultMessage: 'Forward address deleted'
  },
  couldntDeleteForwardAddress: {
    id: `${ns}.couldnt-delete-forward-address`,
    defaultMessage: 'Couldn\'t delete forward address'
  },
  connecting: {
    id: `${ns}.connecting`,
    defaultMessage: 'Connecting...'
  },
  socketDown: {
    id: `${ns}.socket-down`,
    defaultMessage: 'Socket down'
  },
  noItemsFound: {
    id: `${ns}.no-items-found`,
    defaultMessage: 'No items found...'
  },
  noSearchResults: {
    id: `${ns}.no-search-results`,
    defaultMessage: 'No search results...'
  },
  touchToReturnToCall: {
    id: `${ns}.touch-to-return-to-call`,
    defaultMessage: 'Touch to return to call'
  },
  areYouSure: {
    id: `${ns}.are-you-sure`,
    defaultMessage: 'Are you sure?'
  },
  changesWillBeDiscarded: {
    id: `${ns}.changes-will-discarded`,
    defaultMessage: 'Your changes will be discarded.'
  },
  establishCommunicationWithYourFriend: {
    id: `${ns}.establish-communication-with-your-friend`,
    defaultMessage: 'Without contact access, you won’t be able to establish secure communications with your friends.'
  },
  dontAllow: {
    id: `${ns}.dont-allow`,
    defaultMessage: 'Don\'t Allow'
  },
  allow: {
    id: `${ns}.allow`,
    defaultMessage: 'Allow'
  },

  next: {
    id: `${ns}.next`,
    defaultMessage: 'Next'
  },
  userNudged: {
    id: `${ns}.user-nudged`,
    defaultMessage: 'User nudged!'
  },
  somethingWentWrong: {
    id: `${ns}.something-went-wrong`,
    defaultMessage: 'Something went wrong, please try again.'
  },
  incomingCalls: {
    id: `${ns}.incoming-calls`,
    defaultMessage: 'Incoming Calls'
  },
  drawOverAppsPermission: {
    id: `${ns}.draw-over-apps-permission`,
    defaultMessage: 'To receive incoming calls on your device, please enable the \'Draw over other apps\' permission for MsgSafe.'
  },
  goToSettings: {
    id: `${ns}.go-to-settings`,
    defaultMessage: 'GO TO SETTINGS'
  },
  permissionPromptTitle: {
    id: `${ns}.permission-prompt-title`,
    defaultMessage: 'MsgSafe Permission'
  },
  recordPermissionText: {
    id: `${ns}.record-perm-text`,
    defaultMessage: 'MsgSafe needs access to your microphone to make secure voice calls'
  },
  cameraPermissionText: {
    id: `${ns}.camera-perm-text`,
    defaultMessage: 'MsgSafe needs access to your camera to make secure video calls'
  },
  readContactsPermissionText: {
    id: `${ns}.read-contacts-perm-text`,
    defaultMessage: 'MsgSafe needs access to your contacts'
  },
  readExtStoragePermissionText: {
    id: `${ns}.read-ext-storage-perm-text`,
    defaultMessage: 'MsgSafe needs read access to your external storage to read avatars'
  },
  writeExtStoragePermissionText: {
    id: `${ns}.write-ext-storage-perm-text`,
    defaultMessage: 'MsgSafe needs write access to your external storage to save avatars'
  },
  readCallLogPermissionText: {
    id: `${ns}.read-call-log-perm-text`,
    defaultMessage: 'MsgSafe needs read access to your call log to manage call history'
  },
  writeCallLogPermissionText: {
    id: `${ns}.write-call-log-perm-text`,
    defaultMessage: 'MsgSafe needs write access to your call log to manage call history'
  },
  noCameraMicTitle: {
    id: `${ns}.no-camera-mic-title`,
    defaultMessage: 'MsgSafe does not have access to your camera or mic'
  }
})

export default m
