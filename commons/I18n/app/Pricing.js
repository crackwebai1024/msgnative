import { defineMessages } from 'react-intl'

const ns = 'app.Pricing'
const m = defineMessages({
  pricing: {
    id: `${ns}.pricing`,
    defaultMessage: 'Pricing'
  },
  month: {
    id: `${ns}.month`,
    defaultMessage: 'month'
  },
  year: {
    id: `${ns}.year`,
    defaultMessage: 'year'
  },
  monthly: {
    id: `${ns}.monthly`,
    defaultMessage: 'monthly'
  },
  yearly: {
    id: `${ns}.yearly`,
    defaultMessage: 'yearly'
  },
  monthlyPlans: {
    id: `${ns}.monthly-plans`,
    defaultMessage: 'Monthly plans'
  },
  annualPlans: {
    id: `${ns}.annual-plans`,
    defaultMessage: 'Annual plans'
  },
  unlimited: {
    id: `${ns}.unlimited`,
    defaultMessage: 'unlimited'
  },
  free: {
    id: `${ns}.free`,
    defaultMessage: 'Free'
  },
  basic: {
    id: `${ns}.basic`,
    defaultMessage: 'Basic'
  },
  plus: {
    id: `${ns}.plus`,
    defaultMessage: 'Plus'
  },
  premium: {
    id: `${ns}.premium`,
    defaultMessage: 'Premium'
  },
  basic_m: {
    id: `${ns}.basic-m`,
    defaultMessage: 'Basic'
  },
  plus_m: {
    id: `${ns}.plus-m`,
    defaultMessage: 'Plus'
  },
  premium_m: {
    id: `${ns}.premium-m`,
    defaultMessage: 'Premium'
  },
  mostPopularPlan: {
    id: `${ns}.most-popular-plan`,
    defaultMessage: 'Most popular'
  },
  tryForFreePlan: {
    id: `${ns}.try-for-free-plan`,
    defaultMessage: 'Try for free'
  },
  currentPlan: {
    id: `${ns}.current-plan`,
    defaultMessage: 'Current plan'
  },
  buyPlan: {
    id: `${ns}.buy-plan`,
    defaultMessage: 'Buy plan'
  },
  selectPlan: {
    id: `${ns}.select-plan`,
    defaultMessage: 'Select plan'
  },
  allPlansInclude: {
    id: `${ns}.all-plans-include-feature`,
    defaultMessage: 'All plans include'
  },

  storage: {
    id: `${ns}.storage-feature`,
    defaultMessage: '{gbStorage} GB storage'
  },
  mailboxes: {
    id: `${ns}.mailboxes-feature`,
    defaultMessage: '{numIdentities} identities'
  },

  outgoingEmails: {
    id: `${ns}.outgoing-emails-feature`,
    defaultMessage: '{sendPerDay} daily outbound emails'
  },
  forwardedEmails: {
    id: `${ns}.forwarded-emails-feature`,
    defaultMessage: '{forwardPerDay} daily forwards'
  },

  premiumDomains: {
    id: `${ns}.premium-domains-feature`,
    defaultMessage: 'premium domains'
  },

  userCredit: {
    id: `${ns}.domain-credit-feature`,
    defaultMessage: '${userCredit} domain credit'
  },

  groupManager: {
    id: `${ns}.groups-feature`,
    defaultMessage: 'domain groups'
  },

  smtpTokenizedGateway: {
    id: `${ns}.smtp-tokenized-gateway-feature`,
    defaultMessage: 'SMTP tokenized gateway'
  },

  readyDomains: {
    id: `${ns}.ready-domains-feature`,
    defaultMessage: 'dozens of ready-to-use domains'
  },
  noLimitIncoming: {
    id: `${ns}.no-limit-incoming-feature`,
    defaultMessage: 'no limit on incoming emails'
  },
  domainPurchase: {
    id: `${ns}.domain-purchase-feature`,
    defaultMessage: 'domain purchase & integration'
  },
  connectYourOwnDomain: {
    id: `${ns}.connect-your-own-domain`,
    defaultMessage: 'connect your own domain'
  },
  gpgSmime: {
    id: `${ns}.gpg-smime-feature`,
    defaultMessage: 'GPG and S/MIME support'
  },
  encryptedMailboxes: {
    id: `${ns}.encrypted-mailboxes-feature`,
    defaultMessage: 'encrypted email'
  },
  secureAudioVideo: {
    id: `${ns}.secure-audio-video-feature`,
    defaultMessage: 'secure 1:1 audio and video chat'
  },
  emailPathAnalytics: {
    id: `${ns}.email-path-analytics-feature`,
    defaultMessage: 'email path analytics'
  },
  geteMail: {
    id: `${ns}.geteMail`,
    defaultMessage: 'Get email addresses that originate from 6+ countries; including Curaçao, United Kingdom, Germany, Netherlands, United States and Singapore.'
  }
})

export default m
