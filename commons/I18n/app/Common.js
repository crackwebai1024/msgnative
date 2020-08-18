import { defineMessages } from 'react-intl'

const ns = 'app.Common'
const m = defineMessages({
  emptyResponseError: {
    id: `${ns}.empty-response-error`,
    defaultMessage: 'Unable to connect to the server. Please try again.'
  },

  about: {
    id: `${ns}.about`,
    defaultMessage: 'About'
  },

  yes: {
    id: `${ns}.yes`,
    defaultMessage: 'Yes'
  },

  no: {
    id: `${ns}.no`,
    defaultMessage: 'No'
  },
  later: {
    id: `${ns}.later`,
    defaultMessage: 'Later'
  },

  email: {
    id: `${ns}.email`,
    defaultMessage: 'Email'
  },

  mailboxesUsedBy: {
    id: `${ns}.mailboxes-used-by`,
    defaultMessage: 'Identities used by'
  },

  selectFolder: {
    id: `${ns}.select-folder`,
    defaultMessage: 'Select Folder'
  },

  privacy: {
    id: `${ns}.privacy`,
    defaultMessage: 'Privacy'
  },

  terms: {
    id: `${ns}.terms`,
    defaultMessage: 'Terms'
  },

  domainName: {
    id: `${ns}.domain-name`,
    defaultMessage: 'Domain name'
  },

  close: {
    id: `${ns}.close`,
    defaultMessage: 'Close'
  },

  fullName: {
    id: `${ns}.full-name`,
    defaultMessage: 'Full Name'
  },

  emailAddress: {
    id: `${ns}.email-address`,
    defaultMessage: 'Email Address'
  },

  ascending: {
    id: `${ns}.ascending`,
    defaultMessage: 'Ascending'
  },

  descending: {
    id: `${ns}.descending`,
    defaultMessage: 'Descending'
  },

  newest: {
    id: `${ns}.newest`,
    defaultMessage: 'Newest'
  },

  oldest: {
    id: `${ns}.oldest`,
    defaultMessage: 'Oldest'
  },

  region: {
    id: `${ns}.region`,
    defaultMessage: 'Region'
  },

  filters: {
    id: `${ns}.filters`,
    defaultMessage: 'Filters'
  },

  reset: {
    id: `${ns}.reset`,
    defaultMessage: 'Reset'
  },

  countSelected: {
    id: `${ns}.count-selected`,
    defaultMessage: '{countSelected} Selected'
  },

  sort: {
    id: `${ns}.sort`,
    defaultMessage: 'Sort'
  },

  date: {
    id: `${ns}.date`,
    defaultMessage: 'Date'
  },

  done: {
    id: `${ns}.done`,
    defaultMessage: 'Done'
  },
  discard: {
    id: `${ns}.discard`,
    defaultMessage: 'Discard'
  },

  loadingEllipses: {
    id: `${ns}.loadingEllipses`,
    defaultMessage: 'Loading...'
  },

  loadingMoreResults: {
    id: `${ns}.loadingMoreResults`,
    defaultMessage: 'Loading more results...'
  },

  waitPlease: {
    id: `${ns}.waitPlease`,
    defaultMessage: 'This may take a while, please be patient.'
  },

  searchEllipses: {
    id: `${ns}.searchEllipses`,
    defaultMessage: 'Search...'
  },

  search: {
    id: `${ns}.search`,
    defaultMessage: 'Search'
  },

  active: {
    id: `${ns}.active`,
    defaultMessage: 'Active'
  },

  name: {
    id: `${ns}.name`,
    defaultMessage: 'Name'
  },

  settings: {
    id: `${ns}.settings`,
    defaultMessage: 'Settings'
  },

  edit: {
    id: `${ns}.edit`,
    defaultMessage: 'Edit'
  },

  editToolbar: {
    id: `${ns}.editToolbar`,
    defaultMessage: 'EDIT'
  },

  new: {
    id: `${ns}.new`,
    defaultMessage: 'New'
  },

  update: {
    id: `${ns}.update`,
    defaultMessage: 'Update'
  },

  create: {
    id: `${ns}.create`,
    defaultMessage: 'Create'
  },

  cancel: {
    id: `${ns}.cancel`,
    defaultMessage: 'Cancel'
  },

  submit: {
    id: `${ns}.submit`,
    defaultMessage: 'Submit'
  },

  delete: {
    id: `${ns}.delete`,
    defaultMessage: 'Delete'
  },

  deleted: {
    id: `${ns}.deleted`,
    defaultMessage: 'Deleted'
  },

  displayName: {
    id: `${ns}.display-name`,
    defaultMessage: 'Display name'
  },

  generate: {
    id: `${ns}.generate`,
    defaultMessage: 'Generate'
  },

  clickForRandom: {
    id: `${ns}.click-for-random`,
    defaultMessage: 'Click for random'
  },

  save: {
    id: `${ns}.save`,
    defaultMessage: 'Save'
  },

  saveChanges: {
    id: `${ns}.save-changes`,
    defaultMessage: 'Save changes'
  },

  timeZone: {
    id: `${ns}.time-zone`,
    defaultMessage: 'Time Zone'
  },

  perYear: {
    id: `${ns}.perYear`,
    defaultMessage: 'per year'
  },

  next: {
    id: `${ns}.next`,
    defaultMessage: 'Next'
  },

  skip: {
    id: `${ns}.skip`,
    defaultMessage: 'Skip'
  },

  add: {
    id: `${ns}.add`,
    defaultMessage: 'Add'
  },
  ok: {
    id: `${ns}.ok`,
    defaultMessage: 'Ok'
  },
  warning: {
    id: `${ns}.warning`,
    defaultMessage: 'Warning'
  },

  listItems: {
    id: `${ns}.list-item-n-found`,
    defaultMessage: '{nItems} items found'
  },

  listUnreadItems: {
    id: `${ns}.list-unread-item-n-found`,
    defaultMessage: '{nItems} unread items found'
  },

  listUnreadItemsNotFound: {
    id: `${ns}.list-unread-item-not-found`,
    defaultMessage: 'No unread items found'
  },

  listItemsNotFound: {
    id: `${ns}.list-item-not-found`,
    defaultMessage: 'No items found'
  },

  confirmRemove: {
    id: `${ns}.confirm-remove`,
    defaultMessage: 'Are you sure you want to delete {nameStr}?'
  },

  notYet: {
    id: `${ns}.not-yet`,
    defaultMessage: 'Not yet'
  },

  lastUsed: {
    id: `${ns}.last-used`,
    defaultMessage: 'Active'
  },

  sent: {
    id: `${ns}.sent`,
    defaultMessage: 'Sent'
  },

  received: {
    id: `${ns}.received`,
    defaultMessage: 'Received'
  },

  forwarded: {
    id: `${ns}.forwarded`,
    defaultMessage: 'Forwarded'
  },

  blocked: {
    id: `${ns}.blocked`,
    defaultMessage: 'Blocked'
  },

  blackholed: {
    id: `${ns}.blackholed`,
    defaultMessage: 'Silent ignore'
  },

  updated: {
    id: `${ns}.updated`,
    defaultMessage: 'Updated'
  },
  created: {
    id: `${ns}.created`,
    defaultMessage: 'Created'
  },
  modified: {
    id: `${ns}.modified`,
    defaultMessage: 'Modified'
  },
  lastActivity: {
    id: `${ns}.last-activity`,
    defaultMessage: 'Last Activity'
  },

  show: {
    id: `${ns}.show`,
    defaultMessage: 'Show'
  },

  hide: {
    id: `${ns}.hide`,
    defaultMessage: 'Hide'
  },

  download: {
    id: `${ns}.download`,
    defaultMessage: 'Download'
  },

  copy: {
    id: `${ns}.copy`,
    defaultMessage: 'Copy'
  },

  viewTerms: {
    id: `${ns}.view-terms`,
    defaultMessage: 'View terms'
  },

  makePayment: {
    id: `${ns}.make-payment`,
    defaultMessage: 'Make payment'
  },

  invoiceDetails: {
    id: `${ns}.invoice-details`,
    defaultMessage: 'Invoice details'
  },

  totalForPayment: {
    id: `${ns}.total-for-payment`,
    defaultMessage: 'Total for payment'
  },

  addCard: {
    id: `${ns}.add-card`,
    defaultMessage: 'Add Card'
  },

  requirements: {
    id: `${ns}.requirements`,
    defaultMessage: 'Requirements'
  },

  reload: {
    id: `${ns}.reload`,
    defaultMessage: 'reload'
  },

  acceptTerms: {
    id: `${ns}.accept-terms`,
    defaultMessage: 'Accept terms'
  },

  pleaseReviewTerms: {
    id: `${ns}.please-review-terms`,
    defaultMessage: 'Please review agreement'
  },

  termsAcknowledgement: {
    id: `${ns}.terms-acknowledgement`,
    defaultMessage: 'YOU ACKNOWLEDGE THAT YOU HAVE READ THIS AGREEMENT AND AGREE TO ALL ITS TERMS AND CONDITIONS. YOU HAVE INDEPENDENTLY EVALUATED THE DESIRABILITY OF THE SERVICE AND ARE NOT RELYING ON ANY REPRESENTATION AGREEMENT, GUARANTEE OR STATEMENT OTHER THAN AS SET FORTH IN THIS AGREEMENT.'
  },

  clickHereToCreate: {
    id: `${ns}.click-here-to-create`,
    defaultMessage: 'Click here to create one'
  },
  userTryingReachNotAvailable: {
    id: `${ns}.userTryingReachNotAvailable`,
    defaultMessage: `The user you are trying to reach is not available.`
  },
  joinedRoomBy: {
    id: `${ns}.joinedRoomBy`,
    defaultMessage: `You're joined chat room by {contact}`
  }
})

export default m
