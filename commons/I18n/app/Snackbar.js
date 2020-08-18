import { defineMessages } from 'react-intl'

const ns = 'app.Snackbar'
const m = defineMessages({
  accountUpdated: {
    id: `${ns}.account-updated`,
    defaultMessage: 'Account updated'
  },

  emailMovedToArchive: {
    id: `${ns}.email-moved-to-archive`,
    defaultMessage: 'Selected email was archived'
  },
  emailMovedToTrash: {
    id: `${ns}.email-moved-to-trash`,
    defaultMessage: 'Selected email was trashed'
  },
  emailSent: {
    id: `${ns}.email-sent`,
    defaultMessage: 'Your email has been sent'
  },
  emailQueued: {
    id: `${ns}.email-queued`,
    defaultMessage: 'Your email has been queued'
  },
  emailMarkedUnread: {
    id: `${ns}.email-marked-unread`,
    defaultMessage: 'Selected email marked unread'
  },

  contactCreated: {
    id: `${ns}.contact-created`,
    defaultMessage: 'Contact created'
  },
  contactUpdated: {
    id: `${ns}.contact-updated`,
    defaultMessage: 'Contact updated'
  },
  contactDeleted: {
    id: `${ns}.contact-deleted`,
    defaultMessage: 'Contact deleted'
  },

  couldntDeleteContact: {
    id: `${ns}.couldnt-delete-contact`,
    defaultMessage: 'Could not Delete the Contact'
  },

  deletingContact: {
    id: `${ns}.deleting-contact`,
    defaultMessage: 'Deleting contact'
  },

  mailboxCreated: {
    id: `${ns}.mailbox-created`,
    defaultMessage: 'Mailbox created'
  },
  mailboxUpdated: {
    id: `${ns}.mailbox-updated`,
    defaultMessage: 'Mailbox updated'
  },
  mailboxDeleted: {
    id: `${ns}.mailbox-deleted`,
    defaultMessage: 'Malbox deleted'
  },

  forwardAddressCreated: {
    id: `${ns}.forward-address-created`,
    defaultMessage: 'Forward address created'
  },
  forwardAddressUpdated: {
    id: `${ns}.forward-address-updated`,
    defaultMessage: 'Forward address updated'
  },
  forwardAddressDeleted: {
    id: `${ns}.forward-address-deleted`,
    defaultMessage: 'Forward address deleted'
  },
  couldntDeleteForwardAddress: {
    id: `${ns}.couldnt-delete-forward-address`,
    defaultMessage: 'Couldn\'t delete forward address'
  },
  forwardAddressSmimeRequest: {
    id: `${ns}.forward-address-smime-request`,
    defaultMessage: 'Forward address S/MIME request'
  },
  forwardAddressRequestConfirmation: {
    id: `${ns}.forward-address-request-confirmation`,
    defaultMessage: 'Confirmation sent'
  },

  domainCreated: {
    id: `${ns}.domain-created`,
    defaultMessage: 'Domain created'
  },
  domainUpdated: {
    id: `${ns}.domain-updated`,
    defaultMessage: 'Domain updated'
  },
  domainDeleted: {
    id: `${ns}.domain-deleted`,
    defaultMessage: 'Domain deleted'
  },

  // when user tries to call but contact user is not available
  contactNotAvailable: {
    id: `${ns}.contact-not-available`,
    defaultMessage: 'Contact not available'
  },

  // when the call ends
  callEnded: {
    id: `${ns}.call-ended`,
    defaultMessage: 'Call ended.'
  },

  callDuration: {
    id: `${ns}.call-duration`,
    defaultMessage: 'Duration: {duration}'
  },

  inviteSentSuccessfully: {
    id: `${ns}.invite-sent-successfully`,
    defaultMessage: 'Your invite was sent successfully'
  },

  autoPopulateCryptoContact: {
    id: `${ns}.auto-populate-crypto-contact`,
    defaultMessage: 'Automatically added GPG and SMIME public keys'
  }
})

export default m
