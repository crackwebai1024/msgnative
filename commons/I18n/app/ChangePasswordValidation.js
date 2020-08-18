import { defineMessages } from 'react-intl'

const ns = 'app.ChangePasswordValidation'
const m = defineMessages({
  currentPasswordRequired: {
    id: `${ns}.current-password-required`,
    defaultMessage: 'Current password is required'
  },

  passwordRequired: {
    id: `${ns}.new-password-required`,
    defaultMessage: 'New password is required'
  },
  passwordMinLength: {
    id: `${ns}.new-password-min-length`,
    defaultMessage: 'New password must have a minimum of 8 characters'
  },
  passwordMaxLength: {
    id: `${ns}.new-password-max-length`,
    defaultMessage: 'New password can have a maximum of 64 characters'
  },
  passwordInvalid: {
    id: `${ns}.new-password-invalid`,
    defaultMessage: 'New password must have at least 8 characters, 1 alpha, and 1 numeric'
  },

  passwordAgainRequired: {
    id: `${ns}.new-password-again-required`,
    defaultMessage: 'New password is required again'
  },
  passwordsDoNotMatch: {
    id: `${ns}.new-passwords-do-not-match`,
    defaultMessage: 'Not same as the password'
  }
})

export default m
