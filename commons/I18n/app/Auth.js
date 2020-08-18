import { defineMessages } from 'react-intl'

const ns = 'app.Auth'
const m = defineMessages({
  username: {
    id: `${ns}.username`,
    defaultMessage: 'Username'
  },

  emailAddress: {
    id: `${ns}.email-address`,
    defaultMessage: 'Email address'
  },

  preferredUsername: {
    id: `${ns}.preferred-username`,
    defaultMessage: 'Preferred username'
  },

  password: {
    id: `${ns}.password`,
    defaultMessage: 'Password'
  },

  passwordAgain: {
    id: `${ns}.password-again`,
    defaultMessage: 'Password (again)'
  },

  passwordIsRequired: {
    id: `${ns}.password-is-required`,
    defaultMessage: 'Password is required'
  },

  logIn: {
    id: `${ns}.login`,
    defaultMessage: 'Login'
  },

  signIn: {
    id: `${ns}.sign-in`,
    defaultMessage: 'Sign In'
  },

  logOut: {
    id: `${ns}.logout`,
    defaultMessage: 'Logout'
  },

  privateEncryptedOnlineCommunication: {
    id: `${ns}.private-encrypted-online-communication`,
    defaultMessage: 'Private, end-to-end encrypted, online communication.'
  },

  privateEncryptedOnlineCommunicationForEveryone: {
    id: `${ns}.private-encrypted-online-communication-everyone`,
    defaultMessage: 'Private, end-to-end encrypted, online communication. For everyone.'
  },

  forEveryone: {
    id: `${ns}.for-everyone`,
    defaultMessage: 'For everyone.'
  },

  signupToContinue: {
    id: `${ns}.signup-to-continue`,
    defaultMessage: 'Register to continue to MsgSafe.io'
  },

  loginToContinue: {
    id: `${ns}.login-to-continue`,
    defaultMessage: 'Login to continue to MsgSafe.io'
  },

  dontHaveAccount: {
    id: `${ns}.dont-have-account`,
    defaultMessage: 'Don\'t have an account?'
  },

  alreadyHaveAccount: {
    id: `${ns}.already-have-account`,
    defaultMessage: 'Already have an account?'
  },

  signUp: {
    id: `${ns}.signup`,
    defaultMessage: 'Sign Up'
  },

  pleaseCheckYourMailbox: {
    id: `${ns}.please-check-your-mailbox`,
    defaultMessage: 'Please check your mailbox.'
  },

  recoverUsername: {
    id: `${ns}.recover-username`,
    defaultMessage: 'Recover Username'
  },

  forgotUsername: {
    id: `${ns}.forgot-username`,
    defaultMessage: 'Forgot Username'
  },

  forgotPassword: {
    id: `${ns}.forgot-password`,
    defaultMessage: 'Forgot your password?'
  },

  recoveryEmail: {
    id: `${ns}.recovery-email`,
    defaultMessage: 'Recovery Email'
  },

  emailMeMyUsername: {
    id: `${ns}.email-me-my-username`,
    defaultMessage: 'Email me my username'
  },

  logoutSuccessful: {
    id: `${ns}.logout-successful`,
    defaultMessage: 'You are now logged out.'
  },

  resetPassword: {
    id: `${ns}.reset-password`,
    defaultMessage: 'Reset Password'
  },

  resetPasswordSuccess: {
    id: `${ns}.reset-password-success`,
    defaultMessage: 'Password Reset Successful'
  },

  passwordResetCode: {
    id: `${ns}.password-reset-code`,
    defaultMessage: 'Password Reset Code'
  },

  passwordResetCodeRequired: {
    id: `${ns}.password-reset-code-required`,
    defaultMessage: 'Password Reset Code Required'
  },

  invalidCode: {
    id: `${ns}.invalid-code`,
    defaultMessage: 'Invalid Code'
  },

  userEmailConfirmation: {
    id: `${ns}.user-email-confirmation`,
    defaultMessage: 'User email confirmation'
  },

  userEmailConfirmationSuccessMessage: {
    id: `${ns}.user-email-confirmation-success-message`,
    defaultMessage: 'Thank you for confirming your email address'
  },

  cryptoConfirmation: {
    id: `${ns}.crypto-confirmation`,
    defaultMessage: 'Encryption confirmation'
  },

  cryptoConfirmationSuccessMessage: {
    id: `${ns}.crypto-confirmation-success-message`,
    defaultMessage: 'You have confirmed decryption. Your key is now available for use'
  },

  usernameHelp: {
    id: `${ns}.username-help`,
    defaultMessage: 'This will be your account name for login.'
  },

  newPassword: {
    id: `${ns}.new-password`,
    defaultMessage: 'Password'
  },

  passwordHelp: {
    id: `${ns}.password-help`,
    defaultMessage: 'This will be your password for login.'
  },

  optionalRecoveryEmail: {
    id: `${ns}.optional-recovery-email`,
    defaultMessage: 'Optional recovery email'
  },

  recoveryEmailOptional: {
    id: `${ns}.recovery-email-optional`,
    defaultMessage: 'Recovery email (optional)'
  },

  recoveryEmailOptionalHelp: {
    id: `${ns}.recovery-email-optional-help`,
    defaultMessage: 'This is used to recover your account if you lose your username or password.  It will also be used for notifications and invoices.  Don’t worry, you can change it later.'
  },

  seoTitle: {
    id: `${ns}.seo-title`,
    defaultMessage: 'Register for private, encrypted email | MsgSafe.io'
  },

  seoDescription: {
    id: `${ns}.seo-description`,
    defaultMessage: 'Register here for your free private email account.'
  },

  seoKeywords: {
    id: `${ns}.seo-keywords`,
    defaultMessage: 'msgsafe, email, free email, secure email, encrypted email, gpg, pgp, smime, s/mime, e2ee, end-to-end encryption, virtual email, privacy, protection, online privacy, privacy online'
  },

  yesRecover: {
    id: `${ns}.yes-recover`,
    defaultMessage: 'recover'
  },

  noTryAgain: {
    id: `${ns}.no-try-again`,
    defaultMessage: 'try again'
  },

  'Incorrect credentials': {
    id: `${ns}.incorrect-credentials`,
    defaultMessage: 'Sorry, you provided incorrect credentials. Can we help you recover your password?'
  },

  captcha: {
    id: `${ns}.captcha`,
    defaultMessage: 'Verification'
  },

  captchaHelp: {
    id: `${ns}.captcha-help`,
    defaultMessage: 'We want to be sure you are not a robot.'
  }
})

export default m
