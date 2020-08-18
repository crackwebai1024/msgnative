import { defineMessages } from 'react-intl'

const ns = 'native.Dashboard'
const m = defineMessages({
  lastFiveEmails: {
    id: `${ns}.last-five-emails`,
    defaultMessage: 'LAST FIVE EMAILS'
  },
  viewAll: {
    id: `${ns}.view-all`,
    defaultMessage: 'VIEW ALL'
  },
  latestActiveIdentities: {
    id: `${ns}.latest-active-identities`,
    defaultMessage: 'LATEST ACTIVE IDENTITIES'
  },
  noEmailsFound: {
    id: `${ns}.no-emails-found`,
    defaultMessage: 'No emails found'
  },
  noIdentitiesFound: {
    id: `${ns}.no-identities-found`,
    defaultMessage: 'No identities found'
  },
  selectSound: {
    id: `${ns}.select-sound`,
    defaultMessage: 'Select Sound'
  },
  welcomeToMsgSafe: {
    id: `${ns}.welcome-to-msgsafe`,
    defaultMessage: 'Welcome to MsgSafe.io'
  },
  accountReadyToUse: {
    id: `${ns}.account-ready-to-use`,
    defaultMessage: 'Your new account is setup and ready to use with encrypted email, chat and calls.'
  },
  msgSafeIdentities: {
    id: `${ns}.msgsafe-identities`,
    defaultMessage: 'MsgSafe.io Identities'
  },
  identitiesText1: {
    id: `${ns}.identities-text-1`,
    defaultMessage: 'An identity is a custom MsgSafe.io email address that can be used to email, chat or make calls. Give out an identity instead of revealing your personal email address. Each identity is associated with its own group of contacts.'
  },
  identitiesText2: {
    id: `${ns}.identities-text-2`,
    defaultMessage: 'You’re all set with your first identity.\n Create as many as you like in the settings tab.'
  },
  endToEndEncryption: {
    id: `${ns}.end-to-end-encryption`,
    defaultMessage: 'End-To-End Encryption'
  },
  endToEndEncryptionText: {
    id: `${ns}.end-to-end-encryption-text`,
    defaultMessage: 'Your new MsgSafe.io identity address is automatically set up with GPG and S/MIME encryption keys and certificates, protecting your messages during transmission and at rest.'
  },
  secureEncryptedVoiceVideo: {
    id: `${ns}.secure-encrypted-voice-video`,
    defaultMessage: 'Secure, Encrypted Voice & Video'
  },
  secureEncryptedVoiceVideoText: {
    id: `${ns}.secure-encrypted-voice-video-text`,
    defaultMessage: 'Voice and video calling from MsgSafe.io is end-to-end encrypted. Feel confident knowing all calls are direct between users.'
  },
  encryptedEphemeralChat: {
    id: `${ns}.secure-encrypted-voice-video`,
    defaultMessage: 'Secure, Encrypted Voice & Video'
  },
  encryptedEphemeralChatText: {
    id: `${ns}.secure-encrypted-voice-video-text`,
    defaultMessage: 'Voice and video calling from MsgSafe.io is end-to-end encrypted. Feel confident knowing all calls are direct between users.'
  },
  startWithMsgSafe: {
    id: `${ns}.start-with-msgsafe`,
    defaultMessage: 'Get started with MsgSafe.io'
  },
  takeMeToInbox: {
    id: `${ns}.take-me-to-inbox`,
    defaultMessage: 'TAKE ME TO MY INBOX'
  }

})

export default m
