import { defineMessages } from 'react-intl'

const ns = 'app.Contact'
const m = defineMessages({
  contact: {
    id: `${ns}.contact`,
    defaultMessage: 'Contact'
  },

  contacts: {
    id: `${ns}.contacts`,
    defaultMessage: 'Contacts'
  },

  selectContacts: {
    id: `${ns}.select-contact`,
    defaultMessage: 'Select Contacts'
  },

  emptyList: {
    id: `${ns}.empty-list`,
    defaultMessage: 'There are no contacts configured for your account.'
  },

  newContact: {
    id: `${ns}.new-contact`,
    defaultMessage: 'New Contact'
  },

  editContact: {
    id: `${ns}.edit-contact`,
    defaultMessage: 'Edit Contact'
  },

  updateContact: {
    id: `${ns}.update-contact`,
    defaultMessage: 'Update Contact'
  },

  createContact: {
    id: `${ns}.create-contact`,
    defaultMessage: 'Create Contact'
  },

  deleteContact: {
    id: `${ns}.delete-contact`,
    defaultMessage: 'Delete Contact {name}?'
  },

  contactNotDeleted: {
    id: `${ns}.contact-not-deleted`,
    defaultMessage: 'Contact Not Deleted'
  },

  contactName: {
    id: `${ns}.contact-name`,
    defaultMessage: 'Contact name'
  },

  contactNameHelp: {
    id: `${ns}.contact-name-help`,
    defaultMessage: 'The name to display when you receive emails from this contact'
  },

  selectIdentityHelp: {
    id: `${ns}.select-identity-help`,
    defaultMessage: 'Choose a mailbox to associate this contact with. Later you can use this contact with other mailboxes too.'
  },

  selectIdentity: {
    id: `${ns}.select-identity`,
    defaultMessage: 'Select mailbox'
  },

  contactStateTitleLabel: {
    id: `${ns}.contact-state-title-label`,
    defaultMessage: 'Accept, block or blackhole, email sent from this contact'
  },

  contactStateAcceptOption: {
    id: `${ns}.contact-state-accept-option`,
    defaultMessage: 'Accept email from contact'
  },

  contactStateBlockOption: {
    id: `${ns}.contact-state-block-option`,
    defaultMessage: 'Block email from contact - notify email rejected'
  },

  contactStateBlackholeOption: {
    id: `${ns}.contact-state-blackhole-option`,
    defaultMessage: 'Silently ignore email from contact - do not notify email was rejected'
  },

  physicalAddress: {
    id: `${ns}.physical-address`,
    defaultMessage: 'Physical address'
  },

  homePhone: {
    id: `${ns}.home-phone`,
    defaultMessage: 'Home phone'
  },

  mobilePhone: {
    id: `${ns}.mobile-phone`,
    defaultMessage: 'Mobile phone'
  },

  workPhone: {
    id: `${ns}.work-phone`,
    defaultMessage: 'Work phone'
  },

  contactInformation: {
    id: `${ns}.contact-information`,
    defaultMessage: 'Contact information'
  },

  notesTitle: {
    id: `${ns}.notes-title`,
    defaultMessage: 'Optional notes'
  },

  notes: {
    id: `${ns}.notes`,
    defaultMessage: 'Notes'
  },

  notesHelp: {
    id: `${ns}.notes-help`,
    defaultMessage: 'Please type any notes'
  },

  contactEmail: {
    id: `${ns}.contact-email`,
    defaultMessage: 'Contact email'
  },

  contactEmailHelp: {
    id: `${ns}.contact-email-help`,
    defaultMessage: 'Enter the email address of the contact'
  },

  pleaseSelectAContact: {
    id: `${ns}.please-select-a-contact`,
    defaultMessage: 'Please select a contact'
  },

  creationPageTitle: {
    id: `${ns}.creation-page-title`,
    defaultMessage: 'Create new contact'
  },

  contactCreatedNotify: {
    id: `${ns}.contact-created-notify`,
    defaultMessage: 'Contact created'
  },

  contactUpdatedNotify: {
    id: `${ns}.contact-updated-notify`,
    defaultMessage: 'Contact updated'
  },

  contactNotFound: {
    id: `${ns}.contact-not-found`,
    defaultMessage: 'Contact not found.'
  },

  contactNotFoundTypeToCreate: {
    id: `${ns}.contact-not-found-type-to-create`,
    defaultMessage: 'Contact not found, type full email address to use'
  },

  clickToCreateContact: {
    id: `${ns}.click-to-create-contact`,
    defaultMessage: 'Click to create contact.'
  },

  //
  // loadRemoteContent: {
  //   id: `${ns}.load-remote-content`,
  //   defaultMessage: 'Load remote content'
  // },
  //
  // loadEmbeddedImages: {
  //   id: `${ns}.load-embedded-images`,
  //   defaultMessage: 'Load embedded images'
  // },
  //
  // auto: {
  //   id: `${ns}.auto`,
  //   defaultMessage: 'Auto'
  // },
  //
  // manual: {
  //   id: `${ns}.manual`,
  //   defaultMessage: 'Manual'
  // },
  //
  // inherit: {
  //   id: `${ns}.inherit`,
  //   defaultMessage: 'Inherit'
  // },

  noContacts: {
    id: `${ns}.no-contacts-found`,
    defaultMessage: 'No contacts found'
  },

  noContactsForIdentity: {
    id: `${ns}.no-contacts-for-identity`,
    defaultMessage: 'No contacts found for {name}'
  }

})

export default m
