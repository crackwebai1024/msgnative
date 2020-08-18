import { defineMessages } from 'react-intl'

const ns = 'app.ForwardAddress'
const m = defineMessages({
  forwardAddress: {
    id: `${ns}.forward-address`,
    defaultMessage: 'Linked Email Address'
  },

  forwardAddresses: {
    id: `${ns}.forward-addresses`,
    defaultMessage: 'Linked Email Addresses'
  },

  noForwardAddresses: {
    id: `${ns}.no-forward-addresses`,
    defaultMessage: 'No Linked Email Addresses'
  },

  listTitle: {
    id: `${ns}.list-title`,
    defaultMessage: 'Linked Email'
  },
  emptyList: {
    id: `${ns}.empty-list`,
    defaultMessage: 'There are no linked email addresses configured for your account.'
  },

  newForwardAddress: {
    id: `${ns}.new-forward-address`,
    defaultMessage: 'New linked email address'
  },

  createTitle: {
    id: `${ns}.create-title`,
    defaultMessage: 'New forwarding mail address'
  },

  editTitle: {
    id: `${ns}.edit-title`,
    defaultMessage: 'Edit forwarding mail address'
  },

  displayNameHelp: {
    id: `${ns}.display-name-help`,
    defaultMessage: 'The name to display when MsgSafe.io sends email to the address you provide.'
  },
  emailAddressHelp: {
    id: `${ns}.email-address-help`,
    defaultMessage: 'The full address at an alternate Email Service Provider (ESP). Examples include email addresses at GMail, Outlook, and private mail servers. Please verify you have typed the address correctly, you will need to confirm you can receive email at the address you have provided.'
  },

  createDesc1: {
    id: `${ns}.create-desc-1`,
    defaultMessage: 'The email address you provide can be used by MsgSafe.io to receive notifications, do password reset, and use our advanced forwarding services.'
  },

  addressNotConfirmed: {
    id: `${ns}.address-not-confirmed`,
    defaultMessage: 'This address it not confirmed'
  },

  sendConfirmation: {
    id: `${ns}.send-confirmation`,
    defaultMessage: 'Send confirmation'
  },
  sendAnotherConfirmation: {
    id: `${ns}.send-another-confirmation`,
    defaultMessage: 'Send another confirmation'
  },
  lastConfirmationSentOn: {
    id: `${ns}.last-confirmation-sent-on`,
    defaultMessage: 'Last confirmation sent: {lastTest}'
  },

  notConfirmedDesc1: {
    id: `${ns}.not-confirmed-desc-1`,
    defaultMessage: 'Your address is not confirmed. Please check your provider mailbox for a confirmation message from MsgSafe.io.'
  },

  editDisplayNameHelp1: {
    id: `${ns}.edit-display-name-help1`,
    defaultMessage: 'The name used in To: for emails sent by MsgSafe.io.'
  },
  editDisplayNameHelp2: {
    id: `${ns}.edit-display-name-help2`,
    defaultMessage: 'This includes optional notifications, system messages and forwarding services.'
  },

  editCryptoForwardHelp: {
    id: `${ns}.edit-crypto-forward-help`,
    defaultMessage: 'We can deliver your email to alternate service providers, like Gmail, Outlook and private email servers. When forwarding, we still provide valuable analytics for your private email addresses -- and can optionally encrypt the mail we forward, so your other service providers cannot read it. Forwarded email will still show up in your Forwards folder.'
  },

  editRecoveryTitle: {
    id: `${ns}.edit-recovery-title`,
    defaultMessage: 'Use this email address for system messages and notifications'
  },

  editRecoveryToggle: {
    id: `${ns}.edit-recovery-toggle`,
    defaultMessage: 'Send notifications and system messages to this email address'
  },

  pleaseCheckForConfirmationEmail: {
    id: `${ns}.please-check-for-confirmation-email`,
    defaultMessage: 'Please check for confirmation email at {eMail}.'
  },

  notConfirmedDetail: {
    id: `${ns}.not-confirmed-detail`,
    defaultMessage: 'Your forwarding email address has not been confirmed.  Please check your service provider (@{domainName}) for confirmation email.  If you cannot locate it in your Inbox, check the email address you added, as well as the mail filters and spam folder at your service provider.'
  },
  requestNewConfirmation: {
    id: `${ns}.request-new-confirmation`,
    defaultMessage: 'Request new confirmation'
  },
  pendingConfirmation: {
    id: `${ns}.pending-confirmation`,
    defaultMessage: 'pending confirmation'
  },
  lastConfirmationRequest: {
    id: `${ns}.last-confirmation-request`,
    defaultMessage: 'Last confirmation request was sent {lastTest}'
  },

  pleaseSelectAForwardAddress: {
    id: `${ns}.please-select-a-forward-address`,
    defaultMessage: 'Please select a linked email address'
  },

  deleteForwardAddress: {
    id: `${ns}.delete-forward-address`,
    defaultMessage: 'Delete linked email address {name}?'
  },

  forwardAddressNotDeleted: {
    id: `${ns}.forward-address-not-deleted`,
    defaultMessage: 'Linked email address not deleted'
  }

})

export default m
