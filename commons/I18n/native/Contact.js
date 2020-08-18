import { defineMessages } from 'react-intl'

const ns = 'native.Contact'
const m = defineMessages({
  contact: {
    id: `${ns}.contact`,
    defaultMessage: 'Contact'
  },

  contacts: {
    id: `${ns}.contacts`,
    defaultMessage: 'Contacts'
  },
  organization: {
    id: `${ns}.organization`,
    defaultMessage: 'Organization'
  },

  deleteContact: {
    id: `${ns}.delete-contact`,
    defaultMessage: 'Delete Contact {name}?'
  },

  contactNotDeleted: {
    id: `${ns}.contact-not-deleted`,
    defaultMessage: 'Contact Not Deleted'
  },

  identityIsNotDeleted: {
    id: `${ns}.identity-is-not-deleted`,
    defaultMessage: 'Identity Not Deleted'
  },

  address: {
    id: `${ns}.address`,
    defaultMessage: 'Address'
  },

  notes: {
    id: `${ns}.notes`,
    defaultMessage: 'Notes'
  },
  device: {
    id: `${ns}.device`,
    defaultMessage: 'Device'
  },

  noContacts: {
    id: `${ns}.no-contacts-found`,
    defaultMessage: 'No contacts found'
  },

  noContactsForIdentity: {
    id: `${ns}.no-contacts-for-identity`,
    defaultMessage: 'No contacts found for {name}'
  },
  notExistingContact: {
    id: `${ns}.not-existing-contact`,
    defaultMessage: 'Not Existing Contact'
  },
  addToYourContactList: {
    id: `${ns}.add-to-your-contact-list`,
    defaultMessage: 'Seems this email isn\'t in your contact list. Do you want to add this?'
  },
  deviceContact: {
    id: `${ns}.device-contact`,
    defaultMessage: 'Device Contact'
  },
  selectEmail: {
    id: `${ns}.select-email`,
    defaultMessage: 'Select Email'
  },
  keyAdded: {
    id: `${ns}.key-added`,
    defaultMessage: '{key} added!'
  },
  couldNotAdd: {
    id: `${ns}.could-not-added`,
    defaultMessage: 'Could not add the {key}: {err}'
  },
  copiedToClipboard: {
    id: `${ns}.copied-to-clipboard`,
    defaultMessage: 'Copied to clipboard'
  },
  contactSaved: {
    id: `${ns}.contact-saved`,
    defaultMessage: 'Contact saved'
  },
  identityKnownBy: {
    id: `${ns}.identity-known-by`,
    defaultMessage: 'Linked identity, known by'
  },
  identityRequired: {
    id: `${ns}.identity-required`,
    defaultMessage: 'Link contact to an identity'
  },
  emailSettings: {
    id: `${ns}.email-settings`,
    defaultMessage: 'Email Settings'
  },
  allowEmails: {
    id: `${ns}.allow-emails`,
    defaultMessage: 'Allow Emails?'
  },
  allowBlockOrIgnore: {
    id: `${ns}.allow-block-or-ignore`,
    defaultMessage: 'Allow, block or silently ignore?'
  },
  selectContactState: {
    id: `${ns}.select-contact-state`,
    defaultMessage: 'Select Contact State'
  },
  actions: {
    id: `${ns}.actions`,
    defaultMessage: 'Actions'
  },
  viewContact: {
    id: `${ns}.view-contact`,
    defaultMessage: 'View Contact'
  },
  blockContact: {
    id: `${ns}.block-contact`,
    defaultMessage: 'Block Contact'
  },

  unblockContact: {
    id: `${ns}.unblock-contact`,
    defaultMessage: 'Unblock Contact'
  },
  addContact: {
    id: `${ns}.add-contact`,
    defaultMessage: 'Add Contact'
  },
  editContact: {
    id: `${ns}.edit-contact`,
    defaultMessage: 'Edit Contact'
  },
  selectIdentity: {
    id: `${ns}.select-identity`,
    defaultMessage: 'Select Identity'
  },
  deleteContactButton: {
    id: `${ns}.delete-contact-button`,
    defaultMessage: 'Delete Contact'
  },
  noDeviceContactsFound: {
    id: `${ns}.no-device-contacts-found`,
    defaultMessage: 'No device contacts found'
  },
  importYourContacts: {
    id: `${ns}.import-your-contacts`,
    defaultMessage: 'Import your contacts'
  },
  integrateYourExistingContacts: {
    id: `${ns}.integrate-your-existing-contacts`,
    defaultMessage: 'Integrate your existing contacts to make secure communication with those you know.'
  },
  updateContactPermission: {
    id: `${ns}.update-contact-permission`,
    defaultMessage: 'Please update the contacts permission in device setting'
  },
  contactDeleted: {
    id: `${ns}.contact-deleted`,
    defaultMessage: 'Contact Deleted'
  },
  noEmail: {
    id: `${ns}.no-email`,
    defaultMessage: 'No Email'
  },
  noIdentitiesFound: {
    id: `${ns}.no-identities-found`,
    defaultMessage: 'No identities found'
  },
  identities: {
    id: `${ns}.identities`,
    defaultMessage: 'Identities'
  },
  clickHereToAddRecord: {
    id: `${ns}.click-here-to-add-record`,
    defaultMessage: 'Click here to add record'
  },
  getFullEmailMessage: {
    id: `${ns}.get-full-email-message`,
    defaultMessage: 'OK, your email address will be {selectedIdentityEmailUsername}@{selectedDomain}'
  },
  identityDeleted: {
    id: `${ns}.identity-deleted`,
    defaultMessage: 'Identity Deleted'
  },
  identityNotDeleted: {
    id: `${ns}.identity-not-deleted`,
    defaultMessage: 'Identity was not deleted'
  },
  couldNotDeleteIdentity: {
    id: `${ns}.could-not-delete-identity`,
    defaultMessage: 'Could not Delete the Identity'
  },
  noSameAsIdentity: {
    id: `${ns}.no-same-as-identity`,
    defaultMessage: 'Not same as the identity email, Identity was not deleted'
  },
  deleteIdentity: {
    id: `${ns}.delete-identity`,
    defaultMessage: 'Delete Identity'
  },
  identityRemovingConfirm: {
    id: `${ns}.identity-removing-confirm`,
    defaultMessage: 'Please type in {email} to confirm removing {display_name}.'
  },
  allowAnyoneToMailMe: {
    id: `${ns}.allow-anyone-to-mail-me`,
    defaultMessage: 'Allow anyone to email me'
  },
  onlyAssociated: {
    id: `${ns}.only-associated`,
    defaultMessage: 'Only associated contacts can email me'
  },
  identitySaved: {
    id: `${ns}.identity-saved`,
    defaultMessage: 'Identity saved'
  },
  identityProfile: {
    id: `${ns}.identity-profile`,
    defaultMessage: 'Identity profile'
  },
  deleteLinkedEmails: {
    id: `${ns}.delete-linked-emails`,
    defaultMessage: 'Delete all email linked to {display_name}'
  },
  deleteAllEmails: {
    id: `${ns}.delete-all-emails`,
    defaultMessage: 'Yes, delete all emails'
  },
  saveAllEmails: {
    id: `${ns}.save-all-emails`,
    defaultMessage: 'No, save all emails'
  },
  internetDomain: {
    id: `${ns}.internet-domain`,
    defaultMessage: 'Internet domain for identity email address'
  },
  emailSent: {
    id: `${ns}.email-sent`,
    defaultMessage: 'Email sent using this identity will come from'
  },
  selectRegion: {
    id: `${ns}.select-region`,
    defaultMessage: 'Select Region'
  },
  onlineStatus: {
    id: `${ns}.online-status`,
    defaultMessage: 'Online status'
  },
  available: {
    id: `${ns}.available`,
    defaultMessage: 'Available'
  },
  invisible: {
    id: `${ns}.invisible`,
    defaultMessage: 'Invisible'
  },
  delivery: {
    id: `${ns}.delivery`,
    defaultMessage: 'Delivery'
  },
  identityEmail: {
    id: `${ns}.identity-email`,
    defaultMessage: 'Identity Email'
  },
  convertToPlainText: {
    id: `${ns}.convert-to-plain-text`,
    defaultMessage: 'Convert to plain text'
  },
  forwardEmail: {
    id: `${ns}.forward-email`,
    defaultMessage: 'Forward Email'
  },
  forwardTo: {
    id: `${ns}.forward-to`,
    defaultMessage: 'Forward to'
  },
  emailForwardedTo: {
    id: `${ns}.email-forwarded-to`,
    defaultMessage: 'Email will be forwarded to'
  },
  selectLinkedEmail: {
    id: `${ns}.select-linked-email`,
    defaultMessage: 'Select linked email'
  },
  forwardingOptions: {
    id: `${ns}.forwarding-options`,
    defaultMessage: 'Forwarding options'
  },
  countryFlag: {
    id: `${ns}.country-flag`,
    defaultMessage: 'Prefix subject with country of origin flag'
  },
  useGpg: {
    id: `${ns}.use-gpg`,
    defaultMessage: 'Use GPG encryption'
  },
  useSmime: {
    id: `${ns}.use-smime`,
    defaultMessage: 'Use S/MIME encryption'
  },
  signature: {
    id: `${ns}.signature`,
    defaultMessage: 'Signature'
  },
  useComposing: {
    id: `${ns}.use-composing`,
    defaultMessage: 'Use when composing email'
  },
  useReplying: {
    id: `${ns}.use-replying`,
    defaultMessage: 'Use when replying'
  },
  yourSignatureHere: {
    id: `${ns}.your-signature-here`,
    defaultMessage: 'Your signature here...'
  },
  action: {
    id: `${ns}.action`,
    defaultMessage: 'Action'
  },

  addIdentity: {
    id: `${ns}.add-identity`,
    defaultMessage: 'Add Identity'
  },

  editIdentity: {
    id: `${ns}.edit-identity`,
    defaultMessage: 'Edit Identity'
  },
  lastActivity: {
    id: `${ns}.last-activity`,
    defaultMessage: 'Last Activity'
  },
  modified: {
    id: `${ns}.modified`,
    defaultMessage: 'Modified'
  },
  created: {
    id: `${ns}.created`,
    defaultMessage: 'Created'
  },
  received: {
    id: `${ns}.received`,
    defaultMessage: 'Received'
  },
  sent: {
    id: `${ns}.sent`,
    defaultMessage: 'Sent'
  },
  blocked: {
    id: `${ns}.blocked`,
    defaultMessage: 'Blocked'
  },
  emails: {
    id: `${ns}.emails`,
    defaultMessage: 'Emails'
  },
  associatedContacts: {
    id: `${ns}.associated-contacts`,
    defaultMessage: 'Associated Contacts'
  },
  history: {
    id: `${ns}.history`,
    defaultMessage: 'History'
  },
  identity: {
    id: `${ns}.identity`,
    defaultMessage: 'Identity'
  },
  deleteIdentityName: {
    id: `${ns}.delete-identity-name`,
    defaultMessage: 'Delete Identity {name}'
  },
  deleteAllEmailsAssociated: {
    id: `${ns}.delete-all-emails-associated`,
    defaultMessage: 'Do you want to delete all the emails associated with this identity?'
  },
  identityNotAvailable: {
    id: `${ns}.identity-not-available`,
    defaultMessage: 'The identity is not available'
  }

})

export default m
