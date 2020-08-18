import { defineMessages } from 'react-intl'

const ns = 'app.ChangePassword'
const m = defineMessages({
  changePasswordSuccess: {
    id: `${ns}.changePasswordSuccess`,
    defaultMessage: 'Password successfully changed'
  },

  currentPassword: {
    id: `${ns}.currentPassword`,
    defaultMessage: 'Current Password'
  },

  password: {
    id: `${ns}.password`,
    defaultMessage: 'New Password'
  },

  passwordAgain: {
    id: `${ns}.passwordAgain`,
    defaultMessage: 'New Password Again'
  }
})

export default m
