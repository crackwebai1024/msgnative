import { defineMessages } from 'react-intl'

const ns = 'app.Terms'
const m = defineMessages({
  seoTitle: {
    id: `${ns}.seo-title`,
    defaultMessage: 'Terms and Conditions | MsgSafe.io'
  },

  seoDescription: {
    id: `${ns}.seo-description`,
    defaultMessage: 'MsgSafe.io Terms and Conditions'
  },

  seoKeywords: {
    id: `${ns}.seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },

  terms: {
    id: `${ns}.terms`,
    defaultMessage: 'Terms'
  },

  privacy: {
    id: `${ns}.privacy`,
    defaultMessage: 'Privacy'
  }

})

export default m
