import { defineMessages } from 'react-intl'

const ns = 'app.AuthValidation'
const m = defineMessages({
  nameRequired: {
    id: `${ns}.name-required`,
    defaultMessage: 'Full name is required'
  },

  usernameRequired: {
    id: `${ns}.username-required`,
    defaultMessage: 'Username is required'
  },
  usernameRegex: {
    id: `${ns}.username-regex`,
    defaultMessage: 'You can only use lower case letters, numbers, @ or period'
  },
  usernameMinLength: {
    id: `${ns}.username-min-length`,
    defaultMessage: 'Username must have a minimum of 5 characters'
  },
  usernameMaxLength: {
    id: `${ns}.username-max-length`,
    defaultMessage: 'Username can have a maximum of 30 characters'
  },

  passwordRequired: {
    id: `${ns}.password-required`,
    defaultMessage: 'Password is required'
  },
  passwordMinLength: {
    id: `${ns}.password-min-length`,
    defaultMessage: 'Password must have a minimum of 8 characters'
  },
  passwordMaxLength: {
    id: `${ns}.password-max-length`,
    defaultMessage: 'Password can have a maximum of 64 characters'
  },
  passwordInvalid: {
    id: `${ns}.password-invalid`,
    defaultMessage: 'Password must have at least 8 characters, 1 alpha, and 1 numeric'
  },

  passwordAgainRequired: {
    id: `${ns}.password-again-required`,
    defaultMessage: 'Password check is required'
  },
  passwordsDoNotMatch: {
    id: `${ns}.passwords-do-not-match`,
    defaultMessage: 'Passwords do not match'
  },

  mailboxIsRequired: {
    id: `${ns}.mailbox-is-required`,
    defaultMessage: 'The part before the @ symbol that identifies the name of the mailbox'
  },

  captchaRequired: {
    id: `${ns}.captcha-required`,
    defaultMessage: 'This field is required'
  }
})

export default m
