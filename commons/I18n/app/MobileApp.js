import { defineMessages } from 'react-intl'

const ns = 'app.MobileApp'
const m = defineMessages({
  mobileApp: {
    id: `${ns}.mobileApp`,
    defaultMessage: 'Apps'
  },
  headerPre: {
    id: `${ns}.header.pre`,
    defaultMessage: 'MsgSafe.io for Android & iOS'
  },
  headerTitle: {
    id: `${ns}.header.title`,
    defaultMessage: 'Private. Secure. Encrypted. Ephemeral chat and file transfer, voice and video, and email with GPG and S/MIME.'
  },

  featuresPre: {
    id: `${ns}.features.pre`,
    defaultMessage: 'Features & Capabilities'
  },

  featuresTitle: {
    id: `${ns}.features.title`,
    defaultMessage: 'Secure, Encrypted Voice & Video'
  },

  featuresSubtitle: {
    id: `${ns}.features.subtitle`,
    defaultMessage: 'Talk to anyone with an email address'
  },

  featuresTitle1: {
    id: `${ns}.features.title1`,
    defaultMessage: 'Ephemeral Chat'
  },

  featuresContent1: {
    id: `${ns}.features.content1`,
    defaultMessage: 'Secure, end to end encrypted instant messages that last only a short time.'
  },

  featuresTitle2: {
    id: `${ns}.features.title2`,
    defaultMessage: 'Instant End-to-end encryption'
  },

  featuresContent2: {
    id: `${ns}.features.content2`,
    defaultMessage: 'Each MsgSafe.io email address is automatically setup with 4096-bit GPG and S/MIME encryption keys and certificates.'
  },

  featuresTitle3: {
    id: `${ns}.features.title3`,
    defaultMessage: 'Secure email made simple'
  },

  featuresContent3: {
    id: `${ns}.features.content3`,
    defaultMessage: 'Instantly create as many email addresses as you need while keeping your real email and identity private.'
  },

  benefitsPre: {
    id: `${ns}.benefits.pre`,
    defaultMessage: 'benefits'
  },

  benefitsTitle: {
    id: `${ns}.benefits.title`,
    defaultMessage: 'Use MsgSafe.io to secure your privacy online'
  },

  benefitsContent: {
    id: `${ns}.benefits.content`,
    defaultMessage: '<p>MsgSafe.io utilizes Transport Layer Security to protect the connection between you and our service. Learn more about MsgSafe’s Secure Internet Transactions.</p><p>By using our service, we immediately begin to protect your identity online, by providing as many email addresses as you need to create. You can use our webmail or take advantage of our advanced forwarding features. Learn more about how you can take control of the email you receive or block — make it difficult for others to track you down, market to you, share your address or steal your identity!</p>'
  },

  benefitsReadmore: {
    id: `${ns}.benefits.readmore`,
    defaultMessage: 'Know more about the benefits'
  },

  slogan: {
    id: `${ns}.slogan`,
    defaultMessage: 'Stay Private. Start today.'
  }
})

export default m
