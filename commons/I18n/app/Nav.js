import { defineMessages } from 'react-intl'

const ns = 'app.Nav'
const m = defineMessages({
  mail: {
    id: `${ns}.mail`,
    defaultMessage: 'Email'
  },

  chat: {
    id: `${ns}.chat`,
    defaultMessage: 'Chat'
  },

  contacts: {
    id: `${ns}.contacts`,
    defaultMessage: 'Contacts'
  },

  identities: {
    id: `${ns}.identities`,
    defaultMessage: 'Identities'
  },

  domains: {
    id: `${ns}.domains`,
    defaultMessage: 'Domains'
  },

  compose: {
    id: `${ns}.compose`,
    defaultMessage: 'Compose'
  }

})

export default m
