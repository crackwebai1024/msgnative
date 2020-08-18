import { defineMessages } from 'react-intl'

const ns = 'app.Dashboard'
const m = defineMessages({
  title: {
    id: `${ns}.title`,
    defaultMessage: 'Dashboard'
  },

  emailStats: {
    id: `${ns}.email-stats`,
    defaultMessage: 'Email stats'
  },

  counters: {
    id: `${ns}.counters`,
    defaultMessage: 'counters'
  },

  accountStats: {
    id: `${ns}.account-stats`,
    defaultMessage: 'Account stats'
  },

  configured: {
    id: `${ns}.configured`,
    defaultMessage: 'configured'
  },

  sent: {
    id: `${ns}.sent`,
    defaultMessage: 'Sent'
  },

  received: {
    id: `${ns}.received`,
    defaultMessage: 'Received'
  },

  forwarded: {
    id: `${ns}.forwarded`,
    defaultMessage: 'Forwarded'
  },

  blocked: {
    id: `${ns}.blocked`,
    defaultMessage: 'Blocked'
  },

  silentlyIgnored: {
    id: `${ns}.silently-ignored`,
    defaultMessage: 'Silently ignored'
  },

  mailboxes: {
    id: `${ns}.mailboxes`,
    defaultMessage: 'Identities'
  },

  contacts: {
    id: `${ns}.contacts`,
    defaultMessage: 'Contacts'
  },

  forwardingAddresses: {
    id: `${ns}.forwerding-addresses`,
    defaultMessage: 'Linked email addresses'
  },

  domains: {
    id: `${ns}.domains`,
    defaultMessage: 'Domains'
  },

  accountLimits: {
    id: `${ns}.account-limits`,
    defaultMessage: 'Account limits'
  },

  usedOf: {
    id: `${ns}.used-of`,
    defaultMessage: 'Used {usedStr} of {totalStr}'
  },

  storage: {
    id: `${ns}.storage`,
    defaultMessage: 'Storage'
  },

  lowMailboxesMsg: {
    id: `${ns}.low-mailboxes-msg`,
    defaultMessage: 'You need to upgrade to create more identities and email addresses.'
  },

  lowStorageMsg: {
    id: `${ns}.low-storage-msg`,
    defaultMessage: 'You are running low on storage.'
  },

  upgrade: {
    id: `${ns}.upgrade`,
    defaultMessage: 'upgrade'
  },

  dailyLimits: {
    id: `${ns}.daily-limits`,
    defaultMessage: 'Daily limits'
  },

  sentEmails: {
    id: `${ns}.sent-emails`,
    defaultMessage: 'Sent emails'
  },

  forwardedEmails: {
    id: `${ns}.forwarded-emails`,
    defaultMessage: 'Forwarded emails'
  },

  perDay: {
    id: `${ns}.per-day`,
    defaultMessage: 'per day'
  },

  signature: {
    id: `${ns}.signature`,
    defaultMessage: 'Signature'
  },

  freePlanOnly: {
    id: `${ns}.free-plan-only`,
    defaultMessage: 'free plan only'
  },

  signatureTxt: {
    id: `${ns}.signature-txt-1`,
    defaultMessage: "Sent using MsgSafe.io's Free Plan. Private, end-to-end encrypted, online communication. For everyone. https://www.msgsafe.io"
  },

  paidPlans: {
    id: `${ns}.paid-plans`,
    defaultMessage: 'Paid plans'
  },

  signatureUpgradeMsg: {
    id: `${ns}.signature-upgrade-msg`,
    defaultMessage: "are required to turn off MsgSafe.io's signature. Paying customers enables us to operate, develop and expand this service."
  },

  yourPlanIs: {
    id: `${ns}.your-plan-is`,
    defaultMessage: "You are on MsgSafe.io's {planName} Plan."
  },

  pleaseUpgrade: {
    id: `${ns}.please-upgrade`,
    defaultMessage: 'If you like this service, please'
  },

  unlimited: {
    id: `${ns}.unlimited`,
    defaultMessage: 'unlimited'
  },

  mailboxesLimitNotice: {
    id: `${ns}.mailboxes-limit-notice`,
    defaultMessage: 'You need to upgrade to create more identities and email addresses.'
  },

  storageLimitNotice: {
    id: `${ns}.storage-limit-notice`,
    defaultMessage: 'You are running low on storage.'
  },

  emailSendLimitNotice: {
    id: `${ns}.email-send-limit-notice`,
    defaultMessage: 'You need to upgrade to send more emails per day.'
  },

  emailForwardLimitNotice: {
    id: `${ns}.email-forward-limit-notice`,
    defaultMessage: 'You need to upgrade to forward more emails per day.'
  },

  loading: {
    id: `${ns}.loading`,
    defaultMessage: 'Loading...'
  },

  free: {
    id: `${ns}.plan-free`,
    defaultMessage: 'Free'
  },

  basic: {
    id: `${ns}.plan-basic`,
    defaultMessage: 'Basic'
  },

  plus: {
    id: `${ns}.plan-plus`,
    defaultMessage: 'Plus'
  },

  premium: {
    id: `${ns}.plan-premium`,
    defaultMessage: 'Premium'
  },

  basic_m: {
    id: `${ns}.plan-basic-m`,
    defaultMessage: 'Monthly Basic'
  },

  plus_m: {
    id: `${ns}.plan-plus-m`,
    defaultMessage: 'Monthly Plus'
  },

  premium_m: {
    id: `${ns}.plan-premium-m`,
    defaultMessage: 'Monthly Premium'
  }

})

export default m
