import { defineMessages } from 'react-intl'

const ns = 'app.Login'
const m = defineMessages({
  seoTitle: {
    id: `${ns}.seo-title`,
    defaultMessage: 'Login to your account | MsgSafe.io'
  },

  seoDescription: {
    id: `${ns}.seo-description`,
    defaultMessage: 'Login securely to your MsgSafe.io account.'
  },

  seoKeywords: {
    id: `${ns}.seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  }

})

export default m
