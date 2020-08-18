import { defineMessages } from 'react-intl'

const ns = 'app.DNS'
const m = defineMessages({

  mxNoRecord: {
    id: `${ns}.mx-no-record`,
    defaultMessage: 'Missing MX record'
  },
  mxNotPointed: {
    id: `${ns}.mx-not-pointed`,
    defaultMessage: 'MX record exists, but not pointed'
  },
  mxNoResolve: {
    id: `${ns}.mx-no-resolve`,
    defaultMessage: 'MX record does not resolve'
  },
  mxOrderPref: {
    id: `${ns}.mx-order-pref`,
    defaultMessage: 'MX needs to be highest priorty (lowest preference weight/value)'
  },
  nsError: {
    id: `${ns}.ns-error`,
    defaultMessage: 'Nameserver not responding to queries'
  },
  txtNoRecord: {
    id: `${ns}.txt-no-record`,
    defaultMessage: 'TXT verification record does not exist'
  },
  internalError: {
    id: `${ns}.internal-error`,
    defaultMessage: 'Internal error'
  },
  confirmed: {
    id: `${ns}.confirmed`,
    defaultMessage: 'Domain ownership has been confirmed'
  },
  mxOK: {
    id: `${ns}.mx-ok`,
    defaultMessage: 'MX record is correct'
  },
  spfOK: {
    id: `${ns}.spf-ok`,
    defaultMessage: 'SPF record is correct'
  },
  spfNoRecord: {
    id: `${ns}.spf-no-record`,
    defaultMessage: 'SPF TXT record does not exist'
  },
  spfNOA: {
    id: `${ns}.spf-noa`,
    defaultMessage: 'SPF TXT: missing "a:" context'
  },
  spfNoInclude: {
    id: `${ns}.spf-no-include`,
    defaultMessage: 'SPF TXT: missing "include:" context'
  },
  spfWrongInclude: {
    id: `${ns}.spf-wrong-include`,
    defaultMessage: 'SPF TXT: "include:" does not permit our network'
  },
  spfWrongA: {
    id: `${ns}.spf-wrong-a`,
    defaultMessage: 'SPF TXT: "a:" does not permit our network'
  },
  spfNoResolveA: {
    id: `${ns}.spf-no-resolve-a`,
    defaultMessage: 'SPF TXT: cannot resolve IP address in "a:"'
  }

})

export default m
