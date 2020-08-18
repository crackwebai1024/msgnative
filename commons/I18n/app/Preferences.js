import { defineMessages } from 'react-intl'

const ns = 'app.Preferences'
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

  preferredLanguage: {
    id: `${ns}.preferred-language`,
    defaultMessage: 'Choose your preferred language'
  },

  preferredLanguageHelp: {
    id: `${ns}.preferred-language-help`,
    defaultMessage: 'Set the default language within the application.'
  },

  preferredTimeZone: {
    id: `${ns}.preferred-time-zone`,
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

  embeddedContentRendering: {
    id: `${ns}.embedded-content-rendering`,
    defaultMessage: 'Embedded content rendering'
  },

  remoteContentRenderingHelpOn: {
    id: `${ns}.remote-content-rendering-help-on`,
    defaultMessage: 'Downloaded and displayed'
  },

  remoteContentRenderingHelpOff: {
    id: `${ns}.remote-content-rendering-help-off`,
    defaultMessage: 'Always ask me'
  }
})

export default m
