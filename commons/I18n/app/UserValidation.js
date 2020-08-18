import { defineMessages } from 'react-intl'

const ns = 'app.UserValidation'
const m = defineMessages({
  preferredLanguageRequired: {
    id: `${ns}.preferred-language-required`,
    defaultMessage: 'Please choose your preferred language'
  },

  defaultCountryOfOriginRequired: {
    id: `${ns}.default-country-of-origin-required`,
    defaultMessage: 'Please choose the default country of origin'
  },

  defaultDomainForNewAddressesRequired: {
    id: `${ns}.default-domain-for-new-addresses-required`,
    defaultMessage: 'Please choose the default domain for new addresses'
  },

  newPasswordRequired: {
    id: `${ns}.new-password-required`,
    defaultMessage: 'New password is required'
  },

  planRequired: {
    id: `${ns}.plan-required`,
    defaultMessage: 'Please choose a plan'
  },

  ccNameRequired: {
    id: `${ns}.cc-name-required`,
    defaultMessage: 'Please enter the name on credit card'
  },

  ccNumberRequired: {
    id: `${ns}.cc-number-required`,
    defaultMessage: 'Please enter the credit card number'
  },

  ccNumberInvalid: {
    id: `${ns}.cc-number-invalid`,
    defaultMessage: 'Please enter a valid credit card number'
  },

  ccCVVRequired: {
    id: `${ns}.cc-cvv-required`,
    defaultMessage: 'Please enter the credit card CVV'
  },

  ccCVVInvalid: {
    id: `${ns}.cc-cvv-invalid`,
    defaultMessage: 'Please enter a valid credit card CVV'
  },

  ccExpirationRequired: {
    id: `${ns}.cc-expiration-required`,
    defaultMessage: 'Please enter the credit card expiration in MM/YYYY format'
  },

  ccExpirationInvalid: {
    id: `${ns}.cc-expiration-invaild`,
    defaultMessage: 'Please enter a valid expiration in MM/YYYY format'
  }
})

export default m
