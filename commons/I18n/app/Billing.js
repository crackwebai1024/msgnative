import { defineMessages } from 'react-intl'

const ns = 'app.Billing'
const m = defineMessages({
  billing: {
    id: `${ns}.billing`,
    defaultMessage: 'Billing'
  },

  history: {
    id: `${ns}.history`,
    defaultMessage: 'History'
  },

  paymentHistory: {
    id: `${ns}.payment-history`,
    defaultMessage: 'Payment History'
  },

  methods: {
    id: `${ns}.methods`,
    defaultMessage: 'Methods'
  },

  paymentMethods: {
    id: `${ns}.payment-methods`,
    defaultMessage: 'Payment Methods'
  },

  yourPaymentMethods: {
    id: `${ns}.your-payment-methods`,
    defaultMessage: 'Your Payment Methods'
  },

  addNewPayment: {
    id: `${ns}.add-new-payment`,
    defaultMessage: 'Add New'
  },

  cancelNewPayment: {
    id: `${ns}.cancel-new-payment`,
    defaultMessage: 'Cancel'
  },

  delete: {
    id: `${ns}.delete`,
    defaultMessage: 'Delete'
  },

  setDefault: {
    id: `${ns}.set-default`,
    defaultMessage: 'Set Default'
  },

  default: {
    id: `${ns}.default`,
    defaultMessage: 'Default'
  },
  paymentSuccess: {
    id: `${ns}.payment-success`,
    defaultMessage: 'OK'
  },

  paymentFailure: {
    id: `${ns}.payment-failure`,
    defaultMessage: 'Fail'
  },

  amount: {
    id: `${ns}.amount`,
    defaultMessage: 'Amount'
  },

  status: {
    id: `${ns}.status`,
    defaultMessage: 'Status'
  },

  emptyList: {
    id: `${ns}.empty-list`,
    defaultMessage: 'Your history is empty.'
  },

  planUpgrade: {
    id: `${ns}.plan-upgrade`,
    defaultMessage: 'Plan Upgrade'
  },

  planRenew: {
    id: `${ns}.plan-renew`,
    defaultMessage: 'Plan Renew'
  },

  domainPurchase: {
    id: `${ns}.domain-purchase`,
    defaultMessage: 'Domain Purchase'
  }

})

export default m
