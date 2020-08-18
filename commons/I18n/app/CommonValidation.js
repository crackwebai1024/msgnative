import { defineMessages } from 'react-intl'

const ns = 'app.CommonValidation'
const m = defineMessages({
  emailRequired: {
    id: `${ns}.email-required`,
    defaultMessage: 'Email is required'
  },
  emailInvalid: {
    id: `${ns}.email-invalid`,
    defaultMessage: 'Invalid email address'
  },

  identityRequired: {
    id: `${ns}.identity-required`,
    defaultMessage: 'Link contact to an identity'
  },

  domainNameRequired: {
    id: `${ns}.domain-name-required`,
    defaultMessage: 'Domain name required'
  },
  domainNameInvalid: {
    id: `${ns}.domain-name-invalid`,
    defaultMessage: 'Invalid domain name'
  },
  domainRequired: {
    id: `${ns}.domain-required`,
    defaultMessage: 'Domain is required'
  },

  thisCannotBeEmpty: {
    id: `${ns}.this-cannot-be-empty`,
    defaultMessage: 'This cannot be empty'
  },

  minLength4: {
    id: `${ns}.min-length-4`,
    defaultMessage: 'Must have a minimum of 4 characters'
  },

  fullNameRequired: {
    id: `${ns}.full-name-required`,
    defaultMessage: 'Please enter your full name'
  },

  displayNameRequired: {
    id: `${ns}.display-name-required`,
    defaultMessage: 'Display name is required'
  },

  identityNameRequired: {
    id: `${ns}.identity-name-required`,
    defaultMessage: 'Identity name is required'
  },
  identityEmailRequired: {
    id: `${ns}.identity-email-required`,
    defaultMessage: 'Identity email is required'
  },
  regionRequired: {
    id: `${ns}.region-required`,
    defaultMessage: 'Region is required'
  },
  chooseDomainFirst: {
    id: `${ns}.choose-domain-first`,
    defaultMessage: 'Please choose a domain first'
  },
  useOnlyLettersNumberPeriod: {
    id: `${ns}.use-only-letters-number-period`,
    defaultMessage: 'You can only use letters, numbers or period'
  }
})

export default m
