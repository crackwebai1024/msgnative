import { defineMessages } from 'react-intl'

const ns = 'app.User'
const m = defineMessages({
  editProfileTitle: {
    id: `${ns}.edit-profile-title`,
    defaultMessage: 'Edit your profile – {userName}'
  },

  editProfileTitleMeta: {
    id: `${ns}.edit-profile-meta-title`,
    defaultMessage: 'Edit your profile'
  },

  accountSecurityTitle: {
    id: `${ns}.account-security-title`,
    defaultMessage: 'Account security profile'
  },

  preferredLanguage: {
    id: `${ns}.preferred-language`,
    defaultMessage: 'Preferred language'
  },

  preferredLanguageHelp: {
    id: `${ns}.preferred-language-help`,
    defaultMessage: 'Let us know the default language you would like our site to use.'
  },

  timeZoneHelp: {
    id: `${ns}.timezone-help`,
    defaultMessage: 'Let us know what timezone to use with presenting time & date.'
  },

  defaultCountryOfOrigin: {
    id: `${ns}.default-country-of-origin`,
    defaultMessage: 'Default country of origin'
  },

  defaultCountryOfOriginHelp: {
    id: `${ns}.default-country-of-origin-help`,
    defaultMessage: 'When you create new email addresses, we’ll make this the default country of origin.  You can change these settings, for any address, at any time.'
  },

  currentPassword: {
    id: `${ns}.current-password`,
    defaultMessage: 'Current Password'
  },

  newPassword: {
    id: `${ns}.new-password`,
    defaultMessage: 'New Password'
  },

  newPasswordAgain: {
    id: `${ns}.new-password-again`,
    defaultMessage: 'New Password (again)'
  },

  savePassword: {
    id: `${ns}.save-password`,
    defaultMessage: 'Save Password'
  },

  usernameChangeHelp1: {
    id: `${ns}.username-change-1`,
    defaultMessage: 'Usernames must be all lowercase.  They cannot be longer than 21 characters and can only contain letters, numbers, periods, hyphens, and underscores.  Most people choose to use their first name, last name, nickname, or some combination of those with initials.'
  },

  usernameChangeHelp2_1: {
    id: `${ns}.username-change-2-1`,
    defaultMessage: 'Note that you will never share your username with other users.'
  },

  usernameChangeHelp2_2: {
    id: `${ns}.username-change-2-2`,
    defaultMessage: 'Username only exists for you to login.'
  },

  resetPasswordByEmail: {
    id: `${ns}.reset-password-by-email`,
    defaultMessage: 'Reset your password by email.'
  },

  cantRememberCurrentPassword: {
    id: `${ns}.cant-remember-current-password`,
    defaultMessage: 'Can’t remember your current password?'
  },

  // Subscription

  subscriptionTitle: {
    id: `${ns}.subscription-title`,
    defaultMessage: 'Select a subscription plan'
  },

  subscriptionHelp: {
    id: `${ns}.subscription-help`,
    defaultMessage: 'Let us know which plan you would like to start with. You can upgrade at any time!'
  },

  couponLabel: {
    id: `${ns}.couple-label`,
    defaultMessage: 'Coupon code (optional)'
  },

  couponHelp: {
    id: `${ns}.couple-help`,
    defaultMessage: 'If you have a coupon and it is not already listed above, be sure to add it before making payment.'
  },

  selectPlan: {
    id: `${ns}.select-plan`,
    defaultMessage: 'Select a plan'
  },

  firstName: {
    id: `${ns}.first-name`,
    defaultMessage: 'First name'
  },

  lastName: {
    id: `${ns}.last-name`,
    defaultMessage: 'Last name'
  },

  postalCode: {
    id: `${ns}.postal-code`,
    defaultMessage: 'Postal Code'
  },

  country: {
    id: `${ns}.country`,
    defaultMessage: 'Country'
  },

  ccDetails: {
    id: `${ns}.cc-details`,
    defaultMessage: 'Credit card details'
  },

  ccNumber: {
    id: `${ns}.cc-number`,
    defaultMessage: 'Credit card number'
  },

  cvv: {
    id: `${ns}.cvv`,
    defaultMessage: 'CVV'
  },

  expiration: {
    id: `${ns}.expiration`,
    defaultMessage: 'Expires MM / YYYY'
  },

  ccName: {
    id: `${ns}.cc-name`,
    defaultMessage: 'Name on credit card'
  },

  ccTOSMessage: {
    id: `${ns}.cc-tos-message`,
    defaultMessage: "By submitting your credit or debit card, you agree to the recurring annual payment and MsgSafe.io's Terms of service"
  },

  emailAddressForInvoice: {
    id: `${ns}.email-address-for-invoice`,
    defaultMessage: 'Optional email address for invoice'
  },

  recurringPlanSubscription: {
    id: `${ns}.recurring-plan-subscription`,
    defaultMessage: 'Recurring plan subscription'
  },

  userCouponAdjustment: {
    id: `${ns}.user-coupon-adjustment`,
    defaultMessage: 'User coupon adjustment'
  },

  proratedAdjustment: {
    id: `${ns}.prorated-adjustment`,
    defaultMessage: 'Prorated adjustment'
  },

  upgradePlan: {
    id: `${ns}.upgrade-plan`,
    defaultMessage: 'Upgrade plan'
  },

  youHaveBeenUpgraded: {
    id: `${ns}.you-have-been-upgraded`,
    defaultMessage: "You've been upgraded to {planName} plan!"
  },

  selectPaymentSource: {
    id: `${ns}.select-payment-source`,
    defaultMessage: 'Select payment source'
  },

  loadingPaymentSources: {
    id: `${ns}.loading-payment-sources`,
    defaultMessage: 'Loading payment sources...'
  },

  newCard: {
    id: `${ns}.new-card`,
    defaultMessage: 'New card'
  },

  useExisting: {
    id: `${ns}.use-existing`,
    defaultMessage: 'Use existing'
  },

  expires: {
    id: `${ns}.expires`,
    defaultMessage: 'Expires'
  }

})

export default m
