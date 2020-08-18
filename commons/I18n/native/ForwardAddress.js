import { defineMessages } from 'react-intl'

const ns = 'native.ForwardAddress'
const m = defineMessages({
  forwardAddress: {
    id: `${ns}.forward-address`,
    defaultMessage: 'Linked Email Address'
  },
  listTitle: {
    id: `${ns}.list-title`,
    defaultMessage: 'Linked Email'
  },
  forwardAddresses: {
    id: `${ns}.forward-addresses`,
    defaultMessage: 'Linked Email Addresses'
  },

  noForwardAddresses: {
    id: `${ns}.no-forward-addresses`,
    defaultMessage: 'No linked email addresses'
  },
  linkingMsgSafeToYourEmail: {
    id: `${ns}.linking-msgsafe-to-your-email`,
    defaultMessage: 'Linking MsgSafe.io to your other email addresses unlocks powerful new encryption and forwarding options.'
  },
  helpYouRecoverYourAccount: {
    id: `${ns}.help-you-recover-your-account`,
    defaultMessage: 'It will also help you recover your account if you ever lose your username or password.'
  },
  clickHereToLinkEmailAddress: {
    id: `${ns}.click-here-to-link-email`,
    defaultMessage: 'Click here to link email address'
  },

  deleteForwardAddress: {
    id: `${ns}.delete-forward-address`,
    defaultMessage: 'Delete linked email address {name}?'
  },

  forwardAddressNotDeleted: {
    id: `${ns}.forward-address-not-deleted`,
    defaultMessage: 'Linked email address not deleted'
  },

  lastConfirmationRequest: {
    id: `${ns}.last-confirmation-request`,
    defaultMessage: 'Last confirmation request was sent {lastTest}'
  },

  emailAddressDeleted: {
    id: `${ns}.email-address-deleted`,
    defaultMessage: 'Email Address Deleted'
  },

  emailAddressNotDeleted: {
    id: `${ns}.email-address-not-deleted`,
    defaultMessage: 'Email Address Not Deleted'
  },

  verificationEmailSent: {
    id: `${ns}.verification-email-sent`,
    defaultMessage: 'Verification email sent'
  },

  unableToSendVerificationEmail: {
    id: `${ns}.unable-to-send-verification-email`,
    defaultMessage: 'Unable to send verification email, please try again'
  },

  sendVerificationEmail: {
    id: `${ns}.send-verification-email`,
    defaultMessage: 'Send verification email'
  },

  addressNotBeenVerified: {
    id: `${ns}.address-not-been-verified`,
    defaultMessage: 'This address has not been verified.'
  },

  defaultStateMessage: {
    id: `${ns}.default-state-message`,
    defaultMessage: 'This is default linked email address now.'
  },

  nonDefaultStateMessage: {
    id: `${ns}.non-default-message`,
    defaultMessage: 'Click below button to set this as default linked email address.'
  },

  setDefault: {
    id: `${ns}.set-default`,
    defaultMessage: 'Set default'
  }
})

export default m
