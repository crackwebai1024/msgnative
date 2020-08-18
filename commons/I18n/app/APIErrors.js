import { defineMessages } from 'react-intl'

const ns = 'app.APIErrors'
const m = defineMessages({
  'key-is-already-confirmed': {
    defaultMessage: 'Key is already confirmed',
    id: `${ns}.key-is-already-confirmed`
  },
  'too-many-cc-addresses': {
    defaultMessage: 'Too many CC addresses',
    id: `${ns}.too-many-cc-addresses`
  },
  'plan-id-is-invalid': {
    defaultMessage: 'The plan id is invalid',
    id: `${ns}.plan-id-is-invalid`
  },
  'server-error-api-error': {
    defaultMessage: 'There was a server side api error please try again',
    id: `${ns}.server-error-api-error`
  },
  'change-password-auth-failed': {
    defaultMessage: 'Authentication failed',
    id: `${ns}.change-password-auth-failed`
  },
  'add-failed': {
    defaultMessage: 'Add failed',
    id: `${ns}.add-failed`
  },
  'email-address-already-confirmed-different-account': {
    defaultMessage: 'The email address is confirmed on different account',
    id: `${ns}.email-address-already-confirmed-different-account`
  },
  'server-error-request-failed-dont-try-again': {
    defaultMessage: 'The request failed dont try again',
    id: `${ns}.server-error-request-failed-dont-try-again`
  },
  'email-address-not-active': {
    defaultMessage: 'Email address is not set to active',
    id: `${ns}.email-address-not-active`
  },
  'invalid-decrypt-token': {
    defaultMessage: 'Invalid decrypt token',
    id: `${ns}.invalid-decrypt-token`
  },
  'no-plans-available': {
    defaultMessage: 'There are no plans available',
    id: `${ns}.no-plans-available`
  },
  'request-exceeds-max': {
    defaultMessage: 'The request exceeds maximum allowed',
    id: `${ns}.request-exceeds-max`
  },
  'email-address-already-confirmed': {
    defaultMessage: 'The email address is already confirmed',
    id: `${ns}.email-address-already-confirmed`
  },
  'update-failed': {
    defaultMessage: 'Update failed',
    id: `${ns}.update-failed`
  },
  'invalid-request-missing-id': {
    defaultMessage: 'Invalid request missing id',
    id: `${ns}.invalid-request-missing-id`
  },
  'password-reset-request-expired': {
    defaultMessage: 'Password reset request is expired',
    id: `${ns}.password-reset-request-expired`
  },
  'contact-email-duplicate': {
    defaultMessage: 'The contact (email address) exists',
    id: `${ns}.contact-email-duplicate`
  },
  'domain-not-available': {
    defaultMessage: 'Domain not available',
    id: `${ns}.domain-not-available`
  },
  'email-address-duplicate-on-your-account': {
    defaultMessage: 'The email address is already in use by your account',
    id: `${ns}.email-address-duplicate-on-your-account`
  },
  'username-not-available': {
    defaultMessage: 'The username is not available',
    id: `${ns}.username-not-available`
  },
  'user-credit-grather-than-price': {
    defaultMessage: 'Your available user credit is greater than price',
    id: `${ns}.user-credit-grather-than-price`
  },
  'http-pickup-failure-expired': {
    defaultMessage: 'Message is expired',
    id: `${ns}.http-pickup-failure-expired`
  },
  'invalid-mailbox-action-type': {
    defaultMessage: 'The mailbox action type is invalid',
    id: `${ns}.invalid-mailbox-action-type`
  },
  'invalid-pem-format': {
    defaultMessage: 'Invalid pem format',
    id: `${ns}.invalid-pem-format`
  },
  'domain-is-premium-not-supported': {
    defaultMessage: 'Domain is premium class - not supported at this time',
    id: `${ns}.domain-is-premium-not-supported`
  },
  'email-bad-grammar': {
    defaultMessage: 'The email address provided has bad grammar',
    id: `${ns}.email-bad-grammar`
  },
  'login-failed': {
    defaultMessage: 'Incorrect credentials',
    id: `${ns}.login-failed`
  },
  'vcard-parse-error': {
    defaultMessage: 'There was an error parsing the vcard data',
    id: `${ns}.vcard-parse-error`
  },
  'identity-email-grammar-error': {
    defaultMessage: 'The email address does not meet grammar requirements',
    id: `${ns}.identity-email-grammar-error`
  },
  'payment-failed-to-process': {
    defaultMessage: 'Payment failed to process',
    id: `${ns}.payment-failed-to-process`
  },
  'http-pickup-failure-message-not-configured': {
    defaultMessage: 'Message is not configured for http pickup',
    id: `${ns}.http-pickup-failure-message-not-configured`
  },
  'missing-cc-info': {
    defaultMessage: 'Missing credit card information',
    id: `${ns}.missing-cc-info`
  },
  'coupon-already-used': {
    defaultMessage: 'The coupon has already been used',
    id: `${ns}.coupon-already-used`
  },
  'invalid-key-owner-type': {
    defaultMessage: 'Invalid key owner type',
    id: `${ns}.invalid-key-owner-type`
  },
  'max-identities-upgrade-your-plan': {
    defaultMessage: 'Max identities reached. Please upgrade your plan',
    id: `${ns}.max-identities-upgrade-your-plan`
  },
  'invalid-request': {
    defaultMessage: 'Invalid request',
    id: `${ns}.invalid-request`
  },
  'username-bad-grammar': {
    defaultMessage: 'Please try another username',
    id: `${ns}.username-bad-grammar`
  },
  'connection-not-available': {
    defaultMessage: 'Connection not available',
    id: `${ns}.connection-not-available`
  },
  'invalid-arguments': {
    defaultMessage: 'Invalid arguments',
    id: `${ns}.invalid-arguments`
  },
  'key-is-duplicate': {
    defaultMessage: 'Key is duplicate',
    id: `${ns}.key-is-duplicate`
  },
  'email-address-is-not-valid': {
    defaultMessage: 'Email address is not valid',
    id: `${ns}.email-address-is-not-valid`
  },
  'no-features-available': {
    defaultMessage: 'There are no features available',
    id: `${ns}.no-features-available`
  },
  'email-address-must-be-confirmed': {
    defaultMessage: 'Email address not confirmed',
    id: `${ns}.email-address-must-be-confirmed`
  },
  'invalid-coupon': {
    defaultMessage: 'The coupon is invalid',
    id: `${ns}.invalid-coupon`
  },
  'invalid-date-interval': {
    defaultMessage: 'Invalid date interval, use hour/day/year/week',
    id: `${ns}.invalid-date-interval`
  },
  'domain-service-not-available': {
    defaultMessage: 'Domain service not available',
    id: `${ns}.domain-service-not-available`
  },
  'invalid-key-enc-type': {
    defaultMessage: 'Invalid key enc type',
    id: `${ns}.invalid-key-enc-type`
  },
  'get-failed': {
    defaultMessage: 'Get failed',
    id: `${ns}.get-failed`
  },
  'invalid-metadata-key-grammar': {
    defaultMessage: 'Invalid metadata key grammar',
    id: `${ns}.invalid-metadata-key-grammar`
  },
  'error-confirming-email-address': {
    defaultMessage: 'Error confirming your email address',
    id: `${ns}.error-confirming-email-address`
  },
  'invalid-metadata-val-grammar': {
    defaultMessage: 'Invalid metadata val grammar',
    id: `${ns}.invalid-metadata-val-grammar`
  },
  'invalid-fingerprint': {
    defaultMessage: 'Invalid fingerprint',
    id: `${ns}.invalid-fingerprint`
  },
  'server-error-generating-smime-and-pgp-keys': {
    defaultMessage: 'There was an error generating smime and pgp keys',
    id: `${ns}.server-error-generating-smime-and-pgp-keys`
  },
  'client-error-invalid-domain-not-purchased': {
    defaultMessage: 'The domain is not purchased with MsgSafe',
    id: `${ns}.client-error-invalid-domain-not-purchased`
  },
  'identity-not-active': {
    defaultMessage: 'The identity is not active',
    id: `${ns}.identity-not-active`
  },
  'no-active-email-address': {
    defaultMessage: 'Missing an active email address',
    id: `${ns}.no-active-email-address`
  },
  'invitation-exists': {
    defaultMessage: 'Invitiation exists',
    id: `${ns}.invitation-exists`
  },
  'invalid-payment-type': {
    defaultMessage: 'Invalid payment type',
    id: `${ns}.invalid-payment-type`
  },
  'delete-failed': {
    defaultMessage: 'Delete failed',
    id: `${ns}.delete-failed`
  },
  'non-sufficient-user-credit': {
    defaultMessage: 'Your available user credit is less than price',
    id: `${ns}.non-sufficient-user-credit`
  },
  'failed-to-fetch-identity': {
    defaultMessage: 'Failed to fetch the identities. Please try again.',
    id: `${ns}.failed-to-fetch-identity`
  },
  'identity-email-address-not-available': {
    defaultMessage: 'The email address is not available',
    id: `${ns}.identity-email-address-not-available`
  },
  'identity-email-not-valid-for-esp': {
    defaultMessage: 'This email address is already taken',
    id: `${ns}.identity-email-not-valid-for-esp`
  },
  'failed-to-fetch-contact': {
    defaultMessage: 'Failed to fetch the contacts. Please try again.',
    id: `${ns}.failed-to-fetch-contact`
  },
  'failed-to-create-contact': {
    defaultMessage: 'Failed to create the contact. Please try again.',
    id: `${ns}.failed-to-create-contact`
  },
  'failed-to-update-contact': {
    defaultMessage: 'Failed to update the contact. Please try again.',
    id: `${ns}.failed-to-update-contact`
  },
  'failed-to-remove-contact': {
    defaultMessage: 'Failed to remove the contact. Please try again.',
    id: `${ns}.failed-to-remove-contact`
  },
  'failed-to-fetch': {
    defaultMessage: 'Failed to fetch. Please try again.',
    id: `${ns}.failed-to-fetch`
  },
  'failed-to-create': {
    defaultMessage: 'Failed to create. Please try again.',
    id: `${ns}.failed-to-create`
  },
  'failed-to-update': {
    defaultMessage: 'Failed to update. Please try again.',
    id: `${ns}.failed-to-update`
  },
  'failed-to-remove': {
    defaultMessage: 'Failed to remove. Please try again.',
    id: `${ns}.failed-to-remove`
  },
  'request-failed': {
    defaultMessage: 'Request Failed. Please try again.',
    id: `${ns}.request-failed`
  },
  'failed-to-fetch-missed-call': {
    defaultMessage: 'Failed to fetch missed call history',
    id: `${ns}.failed-to-fetch-missed-call`
  },
  'failed-to-fetch-call-history': {
    defaultMessage: 'Failed to fetch call history',
    id: `${ns}.failed-to-fetch-call-history`
  },
  'failed-to-fetch-domains': {
    defaultMessage: 'Failed to fetch domains. Please try again.',
    id: `${ns}.failed-to-fetch-domains`
  },
  'failed-to-create-domain': {
    defaultMessage: 'Failed to create domain. Please try again.',
    id: `${ns}.failed-to-create-domain`
  },
  'failed-to-update-domain': {
    defaultMessage: 'Failed to update domain. Please try again.',
    id: `${ns}.failed-to-update-domain`
  },
  'failed-to-delete-domain': {
    defaultMessage: 'Failed to delete domain. Please try again.',
    id: `${ns}.failed-to-delete-domain`
  },
  'domain-request-failed': {
    defaultMessage: 'Domain request failed. Please try again.',
    id: `${ns}.domain-request-failed`
  },
  'failed-to-fetch-regions': {
    defaultMessage: 'Failed to fetch the regions',
    id: `${ns}.failed-to-fetch-regions`
  },
  'failed-to-fetch-payment-history': {
    defaultMessage: 'Failed to fetch the payment history. Please try again.',
    id: `${ns}.failed-to-fetch-payment-history`
  },
  'failed-to-fetch-payment-methods': {
    defaultMessage: 'Failed to fetch the payment methods. Please try again.',
    id: `${ns}.failed-to-fetch-payment-methods`
  },
  'failed-to-create-payment-method': {
    defaultMessage: 'Failed to create the payment. Please try again.',
    id: `${ns}.failed-to-create-payment-method`
  },
  'failed-to-update-payment-method': {
    defaultMessage: 'Failed to update the payment. Please try again.',
    id: `${ns}.failed-to-update-payment-method`
  },
  'failed-to-fetch-user-emails': {
    defaultMessage: 'Failed to fetch the user emails. Please try again.',
    id: `${ns}.failed-to-fetch-user-emails`
  },
  'unable-to-login': {
    defaultMessage: 'Unable to login, please check username & password and try again',
    id: `${ns}.unable-to-login`
  },
  'unable-to-signup': {
    defaultMessage: 'Unable to signup, please try again',
    id: `${ns}.unable-to-signup`
  },
  'failed-to-send-username': {
    defaultMessage: 'Failed to send username. Please try again.',
    id: `${ns}.failed-to-send-username`
  },
  'failed-to-request-password-reset': {
    defaultMessage: 'Failed to request password reset. Please try again.',
    id: `${ns}.failed-to-request-password-reset`
  },
  'failed-to-reset-password': {
    defaultMessage: 'Failed to reset password. Please try again.',
    id: `${ns}.failed-to-reset-password`
  },
  'failed-to-update-profile': {
    defaultMessage: 'Failed to update the profile. Please try again.',
    id: `${ns}.failed-to-update-profile`
  },
  'failed-to-update-identity-settings': {
    defaultMessage: 'Failed to update the identity settings. Please try again.',
    id: `${ns}.failed-to-update-identity-settings`
  },
  captchaIncorrect: {
    id: `${ns}.captcha-incorrect`,
    defaultMessage: 'Verification failed, please try again.'
  },
  'failed-to-fetch-mailbox': {
    defaultMessage: 'Failed to fetch the mailbox data. Please try again.',
    id: `${ns}.failed-to-fetch-mailbox`
  },
  'failed-to-retrieve-mailbox': {
    defaultMessage: 'Failed to fetch the mailbox data. Please try again.',
    id: `${ns}.failed-to-fetch-mailbox`
  },
  'failed-to-update-mailbox': {
    defaultMessage: 'Failed to update the mailbox data. Please try again.',
    id: `${ns}.failed-to-update-mailbox`
  },
  'failed-to-fetch-your-email': {
    defaultMessage: 'Failed to fetch your email, please try again',
    id: `${ns}.failed-to-fetch-your-email`
  },
  'connect-to-internet-and-retry': {
    defaultMessage: 'Please connect to internet and retry.',
    id: `${ns}.connect-to-internet-and-retry`
  },
  'failed-to-send-email': {
    defaultMessage: 'Failed to send the email. Please try again.',
    id: `${ns}.failed-to-send-email`
  },
  'chat-room-already-exist': {
    defaultMessage: 'Chat Room with {contactEmail} already exist',
    id: `${ns}.chat-room-already-exist`
  },
  'room-not-found': {
    defaultMessage: 'Room not found',
    id: `${ns}.room-not-found`
  },
  'contact-not-available': {
    defaultMessage: 'This contact is not available',
    id: `${ns}.contact-not-available`
  }
})

export default m
