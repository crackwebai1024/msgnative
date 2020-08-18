import { defineMessages } from 'react-intl'

const ns = 'native.Preferences'
const m = defineMessages({
  title: {
    id: `${ns}.title`,
    defaultMessage: 'Preferences - {userName}'
  },

  titleMeta: {
    id: `${ns}.title-meta`,
    defaultMessage: 'Preferences'
  },

  displayName: {
    id: `${ns}.display-name`,
    defaultMessage: 'Your full name'
  },

  language: {
    id: `${ns}.language`,
    defaultMessage: 'Language'
  },
  timezone: {
    id: `${ns}.timezone`,
    defaultMessage: 'Timezone'
  },

  preferenceSaved: {
    id: `${ns}.preference-saved`,
    defaultMessage: 'Preference saved'
  },

  preferredLanguage: {
    id: `${ns}.preferred-language`,
    defaultMessage: 'Preferred language'
  },

  preferredTimeZone: {
    id: `${ns}.preferred-time-zone`,
    defaultMessage: 'Preferred timezone'
  },

  choosePreferredLanguage: {
    id: `${ns}.choose-preferred-language`,
    defaultMessage: 'Choose your preferred language'
  },

  choosePreferredTimeZone: {
    id: `${ns}.choose-preferred-time-zone`,
    defaultMessage: 'Choose your preferred time zone'
  },

  preferredTimeZoneHelp: {
    id: `${ns}.preferred-time-zone-help`,
    defaultMessage: 'Set the default time zone when presenting time & date.'
  },

  preferredOrigin: {
    id: `${ns}.preferred-origin`,
    defaultMessage: 'Preferred region to send email from'
  },

  preferredOriginHelp: {
    id: `${ns}.preferred-origin-help`,
    defaultMessage: 'When you create new email addresses, this is the default country of origin. You can change this setting, for each identity, at any time.'
  },

  emailRendering: {
    id: `${ns}.email-rendering`,
    defaultMessage: 'Email Rendering'
  },

  remoteContentRendering: {
    id: `${ns}.remote-content-rendering`,
    defaultMessage: 'Remote content rendering'
  },

  remoteContentRenderingHelpOn: {
    id: `${ns}.remote-content-rendering-help-on`,
    defaultMessage: 'Downloaded and displayed'
  },

  remoteContentRenderingHelpOff: {
    id: `${ns}.remote-content-rendering-help-off`,
    defaultMessage: 'Always ask me'
  },

  embeddedContentRendering: {
    id: `${ns}.embedded-content-rendering`,
    defaultMessage: 'Embedded content rendering'
  },

  embeddedContentRenderingHelpOn: {
    id: `${ns}.embedded-content-rendering-help-on`,
    defaultMessage: 'Displayed automatically'
  },

  embeddedContentRenderingHelpOff: {
    id: `${ns}.embedded-content-rendering-help-off`,
    defaultMessage: 'Always ask me'
  },

  selectRegion: {
    id: `${ns}.select-region`,
    defaultMessage: 'Select Region'
  },
  preferredRegion: {
    id: `${ns}.preferred-region`,
    defaultMessage: 'Preferred region to send email from'
  },
  bypassPortBlocking: {
    id: `${ns}.bypass-port-blocking-firewalls`,
    defaultMessage: 'When making audio and video calls, bypass port blocking firewalls'
  },
  bypassPortBlockingHelpOn: {
    id: `${ns}.bypass-port-blocking-firewalls-help-on`,
    defaultMessage: 'Avoid port blocking, with the cost of reduced video quality'
  },
  bypassPortBlockingHelpOff: {
    id: `${ns}.bypass-port-blocking-firewalls-help-off`,
    defaultMessage: 'Prefer high quality video, but may not work in some countries and on some networks'
  },
  stripTextLabel: {
    id: `${ns}.strip-text-label`,
    defaultMessage: 'Strip rich text and HTML from email and convert to plaintext ("Markdown")'
  },
  stripTextHelpOn: {
    id: `${ns}.strip-text-help-on`,
    defaultMessage: 'Email will be converted, by default'
  },
  stripTextHelpOff: {
    id: `${ns}.strip-text-help-off`,
    defaultMessage: 'Email will not be converted, but can be using Identity settings'
  },

  blockedContacts: {
    id: `${ns}.blocked-contacts`,
    defaultMessage: 'Blocked Contact'
  },
  ignoredContacts: {
    id: `${ns}.ignored-contacts`,
    defaultMessage: 'Ignored Contacts'
  },

  application: {
    id: `${ns}.application`,
    defaultMessage: 'Application'
  },

  communication: {
    id: `${ns}.communication`,
    defaultMessage: 'Communication'
  },

  newIdentityDefaults: {
    id: `${ns}.new-identity-defaults`,
    defaultMessage: 'New identity defaults'
  },

  contactSettings: {
    id: `${ns}.contact-settings`,
    defaultMessage: 'Contact Settings'
  },

  nameValidation: {
    id: `${ns}.name-validation`,
    defaultMessage: 'Name is required'
  },

  notification: {
    id: `${ns}.notification`,
    defaultMessage: 'Notification'
  },
  notificationUpdated: {
    id: `${ns}.notifications-updated`,
    defaultMessage: 'Notifications Updated'
  },
  chatNotifications: {
    id: `${ns}.chat-notifications`,
    defaultMessage: 'Chat Notifications'
  },
  showNotifications: {
    id: `${ns}.show-notifications`,
    defaultMessage: 'Show Notifications'
  },
  sound: {
    id: `${ns}.sound`,
    defaultMessage: 'Sound'
  },
  incomingCalls: {
    id: `${ns}.incoming-calls`,
    defaultMessage: 'Incoming Calls'
  },
  alert: {
    id: `${ns}.alert`,
    defaultMessage: 'Alert'
  },
  inAppNotifications: {
    id: `${ns}.in-app-notifications`,
    defaultMessage: 'In-App Notifications'
  },
  inAppSounds: {
    id: `${ns}.in-app-sounds`,
    defaultMessage: 'In-App Sounds'
  },
  inAppVibrate: {
    id: `${ns}.in-app-vibrate`,
    defaultMessage: 'In-App Vibrate'
  },
  resetAllNotifications: {
    id: `${ns}.reset-all-notifications`,
    defaultMessage: 'Reset All Notifications'
  },
  undoAllNotificationSettings: {
    id: `${ns}.undo-all-notification-settings`,
    defaultMessage: 'Undo all custom notification settings for all your contacts.'
  },
  identityUpdated: {
    id: `${ns}.identity-updated`,
    defaultMessage: 'Identity updated'
  },
  preferredDomain: {
    id: `${ns}.preferred-domain`,
    defaultMessage: 'Preferred Domain'
  },
  preferredDomainForIdentities: {
    id: `${ns}.preferred-domain-for-identities`,
    defaultMessage: 'Preferred domain for new identities'
  },
  selectDomain: {
    id: `${ns}.select-domain`,
    defaultMessage: 'Select Domain'
  },
  defaultSettingsForIdentities: {
    id: `${ns}.default-settings-for-identities`,
    defaultMessage: 'Default Settings For New Identities'
  },
  useMsgsafeWebmail: {
    id: `${ns}.use-msgsafe-webmail`,
    defaultMessage: 'Use MsgSafe Webmail'
  },
  accessReceivedEmails: {
    id: `${ns}.access-received-emails`,
    defaultMessage: 'You can access received emails in MsgSafe Mail interface'
  },
  forwardToPrivateEmail: {
    id: `${ns}.forward-to-private-email`,
    defaultMessage: 'Emails will be forwarded to your private email address'
  },
  convertRichText: {
    id: `${ns}.convert-rich-text`,
    defaultMessage: 'Convert rich text to plain text'
  },
  identityPreferences: {
    id: `${ns}.identity-preferences`,
    defaultMessage: 'Identity Preferences'
  }
})

export default m
