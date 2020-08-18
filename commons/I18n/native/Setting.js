import { defineMessages } from 'react-intl'

const ns = 'native.Setting'
const m = defineMessages({
  configuration: {
    id: `${ns}.configuration`,
    defaultMessage: 'Configuration'
  },
  contacts: {
    id: `${ns}.contacts`,
    defaultMessage: 'Contacts'
  },
  identities: {
    id: `${ns}.identities`,
    defaultMessage: 'Identities'
  },

  linkedEmailAddresses: {
    id: `${ns}.linked-email-addresses`,
    defaultMessage: 'Linked email addresses'
  },

  settings: {
    id: `${ns}.settings`,
    defaultMessage: 'Settings'
  },
  preferences: {
    id: `${ns}.preferences`,
    defaultMessage: 'Preferences'
  },

  notifications: {
    id: `${ns}.notifications`,
    defaultMessage: 'Notifications'
  },

  deviceSettings: {
    id: `${ns}.device-settings`,
    defaultMessage: 'Device Settings'
  },

  security: {
    id: `${ns}.security`,
    defaultMessage: 'Security'
  },
  changePassword: {
    id: `${ns}.change-password`,
    defaultMessage: 'Change password'
  },

  logout: {
    id: `${ns}.logout`,
    defaultMessage: 'Logout'
  },

  plan: {
    id: `${ns}.plan`,
    defaultMessage: 'Plan'
  },

  upgradePlan: {
    id: `${ns}.upgrade-plan`,
    defaultMessage: 'Upgrade plan'
  },
  privacyPolicy: {
    id: `${ns}.privacy-policy`,
    defaultMessage: 'Privacy policy'
  },

  termsOfService: {
    id: `${ns}.terms-of-service`,
    defaultMessage: 'Terms of service'
  },

  about: {
    id: `${ns}.about`,
    defaultMessage: 'About'
  },
  nameIsRequired: {
    id: `${ns}.name-is-required`,
    defaultMessage: 'Name is required'
  }
})

export default m
