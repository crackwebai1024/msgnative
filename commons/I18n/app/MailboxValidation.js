import { defineMessages } from 'react-intl'

const ns = 'app.AuthValidation'
const m = defineMessages({
  identityRequired: {
    id: `${ns}.identity-required`,
    defaultMessage: 'Please choose a identity'
  },

  subjectRequired: {
    id: `${ns}.subject-required`,
    defaultMessage: 'Please enter a subject'
  },

  bodyRequired: {
    id: `${ns}.body-required`,
    defaultMessage: 'Please enter the email body'
  },

  recipientEmailRequired: {
    id: `${ns}.recipient-email-required`,
    defaultMessage: "Please enter recipient's email address"
  },

  recipientEmailInvalid: {
    id: `${ns}.recipient-email-invalid`,
    defaultMessage: "Recipient's email address is invalid"
  }

})

export default m
