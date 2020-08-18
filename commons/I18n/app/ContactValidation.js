import { defineMessages } from 'react-intl'

const ns = 'app.ContactValidation'
const m = defineMessages({
  phoneNumberMaxLength: {
    id: `${ns}.phone-number-max-length`,
    defaultMessage: 'The phone number can have a maximum of 30 characters'
  },

  addressMaxLength: {
    id: `${ns}.address-max-length`,
    defaultMessage: 'The address can have a maximum of 254 characters'
  }
})

export default m
