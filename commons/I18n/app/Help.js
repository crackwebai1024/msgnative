import { defineMessages } from 'react-intl'

const ns = 'app.Help'
const m = defineMessages({
  needHelpQ: {
    id: `${ns}.need-help-q`,
    defaultMessage: 'Need help?'
  },

  help: {
    id: `${ns}.help`,
    defaultMessage: 'Help'
  },

  commonLoginIssues: {
    id: `${ns}.common-login-issues`,
    defaultMessage: 'Common Login Issues'
  },

  contactSupportTeam: {
    id: `${ns}.contact-support-team`,
    defaultMessage: 'Contact Support Team'
  }
})

export default m
