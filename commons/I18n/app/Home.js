import { defineMessages } from 'react-intl'

const ns = 'app.Home'
const m = defineMessages({
  title: {
    id: `${ns}.title`,
    defaultMessage: 'Most secure email - Free end to end encryption | MsgSafe.io'
  },

  metaDescription: {
    id: `${ns}.meta-description`,
    defaultMessage: 'MsgSafe.io is a privacy focused email service based in one of the most secure jurisdictions in the world. We offer free private email with end-to-end encryption.'
  },

  metaKeywords: {
    id: `${ns}.meta-keywords`,
    defaultMessage: 'secure email, free encrypted email, private email service, end to end encryption, anonymous email, secure chat, encrypted video'
  },

  metaOgTitle: {
    id: `${ns}.meta-og-title`,
    defaultMessage: 'Private, end-to-end encrypted, online communication: MsgSafe.io'
  },

  metaOgDescription: {
    id: `${ns}.meta-og-description`,
    defaultMessage: 'MsgSafe.io is a privacy focused email service based in one of the most secure jurisdictions in the world. We offer free private email with end-to-end encryption.'
  },

  metaTwitterTitle: {
    id: `${ns}.meta-twitter-title`,
    defaultMessage: 'Private, end-to-end encrypted, online communication: MsgSafe.io'
  },

  metaTwitterDescription: {
    id: `${ns}.meta-twitter-description`,
    defaultMessage: 'MsgSafe.io is a privacy focused email service based in one of the most secure jurisdictions in the world. We offer free private email with end-to-end encryption.'
  },

  virtualMailboxes: {
    id: `${ns}.virtual-mailboxes`,
    defaultMessage: 'Virtual identities and email addresses'
  },
  virtualMailboxesText: {
    id: `${ns}.virtual-mailboxes-text`,
    defaultMessage: 'Instantly create as many email addresses as you need - each associated with their own group of contacts.  Share addresses with anyone, but keep your real email address private.  Stop telecom companies, governments and hackers from seeing with whom you communicate'
  },

  endToEndEncryption: {
    id: `${ns}.end-to-end-encryption`,
    defaultMessage: 'End-to-end encryption'
  },
  endToEndEncryptionText: {
    id: `${ns}.end-to-end-encryption-text`,
    defaultMessage: 'Each virtual mailbox is automatically setup with 4096-bit GPG and S/MIME encryption keys and certificates.   All email stored at MsgSafe.io is encrypted.  You can manage the encryption profile for each contact you communicate with.  MsgSafe.io cannot read your email'
  },

  bringOrBuyYourOwnDomain: {
    id: `${ns}.bring-or-buy-your-own-domain`,
    defaultMessage: 'Bring or buy your own domain'
  },
  bringOrBuyYourOwnDomainText: {
    id: `${ns}.bring-or-buy-your-own-domain-text`,
    defaultMessage: 'Protect your entire family or organization by managing all identities and email addresses with the domain you already own.  If you don’t own a domain, you can use our domain registration services to purchase a domain integrated with MsgSafe.io and privacy protection'
  },
  stayPrivateStartToday: {
    id: `${ns}.stay-private-start-today`,
    defaultMessage: 'Stay Private. Start Today.'
  },
  secureEncryptedVoiceVideo: {
    id: `${ns}.secure-encrypted-voice-and-video`,
    defaultMessage: 'Secure, encrypted voice & video'
  },
  secureEncryptedVoiceVideoText: {
    id: `${ns}.secure-encrypted-voice-and-video-text`,
    defaultMessage: 'You don’t trust FaceTime, Skype, Duo, Hangouts and similar services hosted by companies like Apple, Microsoft and Google?  Try our secure and private audio and video services.  You can invite people to call you from a browser link'
  },

  emailAnalysisFiltering: {
    id: `${ns}.email-analysis-filtering`,
    defaultMessage: 'Email analysis & filtering'
  },
  emailAnalysisFilteringText: {
    id: `${ns}.email-analysis-filtering-text`,
    defaultMessage: 'Effortlessly learn about the contacts that communicate with you.  Learn the source of origination, geographic path, and other details about the email you receive.  If you don’t like what you see, you can change your rules, without changing your email addresses'
  },

  dedicatedToImprovingYourPrivacy: {
    id: `${ns}.dedicated-to-improving-your-privacy`,
    defaultMessage: 'Dedicated to improving your privacy'
  },
  dedicatedToImprovingYourPrivacyText: {
    id: `${ns}.dedicated-to-improving-your-privacy-text`,
    defaultMessage: 'With rocketing growth  online and improvements to computer capacity, governments and the private sector are collecting and sharing information on every facet of people’s lives.  We are dedicated to actively improving privacy protection with innovative technology'
  },
  getEmailWorld: {
    id: `${ns}.get-email-world`,
    defaultMessage: `Get identities and email addresses that originate email from 6+ countries; including Curaçao, United Kingdom, Germany, Netherlands, United States and Singapore`
  },
  howMsgQuestion: {
    id: `${ns}.how-msg-question`,
    defaultMessage: `How does MsgSafe.io protect my privacy and security?`
  },
  watchVideo: {
    id: `${ns}.watch-video`,
    defaultMessage: `Watch the Video`
  },

  multiPlatform: {
    id: `${ns}.multi-platform`,
    defaultMessage: `The new MsgSafe.io is available for Android, iOS, and the web`
  },
  multiPlatformDescription: {
    id: `${ns}.multi-platform-description`,
    defaultMessage: `MsgSafe.io is a privacy-focused encrypted email, text chat, voice and video communication service.  We are based out of Panama with primary technical operations in Curaçao, one of the most secure privacy-oriented jurisdictions in the world.`
  },
  multiPlatformHighLight1: {
    id: `${ns}.multi-platform-highlight1`,
    defaultMessage: `Email`
  },
  multiPlatformHighLight1Description: {
    id: `${ns}.multi-platform-highlight1-description`,
    defaultMessage: `A new email client with powerful features and intuitive interaction. Encrypted email has never been so easy and productive.`
  },
  multiPlatformHighLight2: {
    id: `${ns}.multi-platform-highlight2`,
    defaultMessage: `Chat`
  },
  multiPlatformHighLight2Description: {
    id: `${ns}.multi-platform-highlight2-description`,
    defaultMessage: `Combining traditional permanent chat (with history) and ephemeral chat (without history).`
  },
  multiPlatformHighLight3: {
    id: `${ns}.multi-platform-highlight3`,
    defaultMessage: `Voice & Video`
  },
  multiPlatformHighLight3Description: {
    id: `${ns}.multi-platform-highlight3-description`,
    defaultMessage: `The very best in encrypted audio and video calls. Our solutions work in environments where other products fail.`
  },

  iOSAppTitle: {
    id: `${ns}.ios-app`,
    defaultMessage: `Android & iOS!`
  },
  iOSAppDescription: {
    id: `${ns}.ios-app-description`,
    defaultMessage: `We are excited to announce our new app will soon be available on Android and iOS!`
  },
  iOSAppDownload: {
    id: `${ns}.ios-app-download`,
    defaultMessage: `Download on the`
  },
  iOSAppStore: {
    id: `${ns}.ios-app-store`,
    defaultMessage: `App Store`
  },

  testimonials: {
    id: `${ns}.testimonials`,
    defaultMessage: `Testimonials`
  }
})

export default m
