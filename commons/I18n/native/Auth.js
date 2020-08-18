import { defineMessages } from 'react-intl'

const ns = 'native.Auth'
const m = defineMessages({
  or: {
    id: `${ns}.or`,
    defaultMessage: 'or'
  },
  primary: {
    id: `${ns}.primary`,
    defaultMessage: 'Primary'
  },
  setPrimary: {
    id: `${ns}.set-primary`,
    defaultMessage: 'Set Primary'
  },

  makeSecureCommunication: {
    id: `${ns}.make-secure-communication`,
    defaultMessage: 'Make secure communication as simple as picking your contact.'
  },
  pleaseLetUsIntegrate: {
    id: `${ns}.let-us-integrate`,
    defaultMessage: 'Please let us integrate with your existing contacts. We value your privacy and you\'re always in control.'
  },
  manuallyAddContacts: {
    id: `${ns}.manually-add-contacts`,
    defaultMessage: 'No thanks. I wish to manually add my contacts.'
  },

  recoverEmailWarning: {
    id: `${ns}.recover-email-warning`,
    defaultMessage: 'Recovery Email Warning'
  },
  notProvidedEmailAddress: {
    id: `${ns}.not-provided-email-address`,
    defaultMessage: `You did not provide an email address, so recovery is impossible if you forget your password. \n Add recovery email now?`
  },
  notNow: {
    id: `${ns}.not-Now`,
    defaultMessage: 'Not Now'
  },
  addEmail: {
    id: `${ns}.add-email`,
    defaultMessage: 'Add Email'
  },
  addYourEmail: {
    id: `${ns}.add-your-email`,
    defaultMessage: 'Add Your Email'
  },
  addEmailAddress: {
    id: `${ns}.add-email-address`,
    defaultMessage: 'Add email address'
  },
  addEmailAddressToMakeItEasy: {
    id: `${ns}.add-email-address-to-make-it-easy`,
    defaultMessage: 'Add your email address to make it easy for others to connect with you on MsgSafe.io.'
  },
  receiveVerificationEmail: {
    id: `${ns}.receive-verification-email`,
    defaultMessage: 'You will receive a verification email for each email address you provide with a link to verify your account.'
  },
  advantageOfAddingEmailAddress: {
    id: `${ns}.advantage-of-adding-email-address`,
    defaultMessage: 'Advantages of adding an email address:'
  },
  communicateSecurely: {
    id: `${ns}.communicate-securely`,
    defaultMessage: 'Communicate securely with people you know'
  },
  forwardEncryptedMail: {
    id: `${ns}.forward-encrypted-mail`,
    defaultMessage: 'Forward encrypted mail from a MsgSafe.io identity'
  },
  recoverYourAccount: {
    id: `${ns}.recover-your-account`,
    defaultMessage: 'Recover your account if you lose your password'
  },
  neverSellOrShareYourInfo: {
    id: `${ns}.never-sell-or-share-your-info`,
    defaultMessage: 'We are committed to protecting the privacy of our users. We will never sell or share your information.'
  },
  createNewAccount: {
    id: `${ns}.create-new-account`,
    defaultMessage: 'Create a New Account'
  },
  usernameMustBeCharacters: {
    id: `${ns}.username-must-be-characters`,
    defaultMessage: 'Your username must be 5-30 characters'
  },
  passwordMustHaveMinimum: {
    id: `${ns}.password-must-have-minimum`,
    defaultMessage: 'Your password must have a minimum of 8 characters, 1 alpha and 1 numeric'
  },
  yourEmailAddressWillBe: {
    id: `${ns}.your-email-address-will-be`,
    defaultMessage: 'Your email address will be:'
  },
  createFirstEmailAndIdentity: {
    id: `${ns}.create-first-email-and-identity`,
    defaultMessage: 'Create your first MsgSafe.io email address and identity.'
  },
  selectYourChoiceOfDomain: {
    id: `${ns}.select-your-choice-of-domain`,
    defaultMessage: 'Select your choice of domain'
  },
  signupFormHelpText: {
    id: `${ns}.signup-form-help-text`,
    defaultMessage: 'MsgSafe.io protects your true identity and private email addresses, by providing you with as many email addresses as you need. You can instantly communicate with the email addresses you add.  You can add more email addresses and identities, and refine the settings and details, any time you want.'
  },
  emailUsernameValid: {
    id: `${ns}.email-username-valid`,
    defaultMessage: 'You can only use letters, numbers or period'
  },

  emailUsernameMinLength: {
    id: `${ns}.email-username-min-length`,
    defaultMessage: 'Must have a minimum of 4 characters'
  }

})

export default m
