import { defineMessages } from 'react-intl'

const ns = 'app.CryptoValidation'
const m = defineMessages({
  passphraseRequired: {
    id: `${ns}.passphrase-required`,
    defaultMessage: 'Passphrase is required'
  },
  passphraseMinLength: {
    id: `${ns}.passphrase-min-length`,
    defaultMessage: 'Passphrase must have a minimum of 5 characters'
  },
  passphraseMaxLength: {
    id: `${ns}.passphrase-max-length`,
    defaultMessage: 'Passphrase can have a maximum of 128 characters'
  },
  passphraseDoNotMatch: {
    id: `${ns}.passphrases-do-not-match`,
    defaultMessage: 'Passphrases do not match'
  },
  passphraseMatchSmime: {
    id: `${ns}.passphrases-match-smime`,
    defaultMessage: 'PKCS 12 passphrase matches S/MIME'
  },
  passphraseMatchPkcs12: {
    id: `${ns}.passphrases-match-pkcs12`,
    defaultMessage: 'S/MIME passphrase matches PKCS 12'
  }
})

export default m
