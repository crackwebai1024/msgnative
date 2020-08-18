import { defineMessages } from 'react-intl'

const ns = 'app.AccountHistory'
const m = defineMessages({

  loginSuccess: {
    id: `${ns}.login-success`,
    defaultMessage: 'Login success'
  },

  loginFailure: {
    id: `${ns}.login-failure`,
    defaultMessage: 'Login failure'
  },

  origin: {
    id: `${ns}.origin`,
    defaultMessage: 'Origin'
  },

  network: {
    id: `${ns}.network`,
    defaultMessage: 'Network'
  },

  userAgent: {
    id: `${ns}.user-agent`,
    defaultMessage: 'User agent'
  },

  emptyList: {
    id: `${ns}.empty-list`,
    defaultMessage: 'Your history is empty.'
  }

})

export default m
