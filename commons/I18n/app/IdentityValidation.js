import { defineMessages } from 'react-intl'

const ns = 'app.IdentityValidation'
const m = defineMessages({
  displayNameRequired: {
    id: `${ns}.display-name-required`,
    defaultMessage: 'Display name is required'
  },

  displayNameMinLength: {
    id: `${ns}.display-name-min-length`,
    defaultMessage: 'Display name must have a minimum of 4 characters'
  },

  emailUsernameValid: {
    id: `${ns}.email-username-valid`,
    defaultMessage: 'You can only use letters, numbers or period'
  },

  emailUsernameMinLength: {
    id: `${ns}.email-username-min-length`,
    defaultMessage: 'Must have a minimum of 4 characters'
  },

  forwardEspIsRequired: {
    id: `${ns}.forwardESP-is-required`,
    defaultMessage: 'You need to specify the forward destination'
  }
})

export default m
