import { defineMessages } from 'react-intl'

const ns = 'native.Mailbox'
const m = defineMessages({
  useEmailAddress: {
    id: `${ns}.use-email-address`,
    defaultMessage: 'Use email address {eMail}'
  },

  decryptingEmail: {
    id: `${ns}.decrypting-email`,
    defaultMessage: 'Decrypting email'
  },

  remoteImagesBlocked: {
    id: `${ns}.remote-images-blocked`,
    defaultMessage: 'Remote images blocked'
  },

  loadRemoteImages: {
    id: `${ns}.load-remote-images`,
    defaultMessage: 'Load remote images'
  },

  noEmailsFound: {
    id: `${ns}.no-emails-found`,
    defaultMessage: 'No emails found'
  },

  attachment: {
    id: `${ns}.attachment`,
    defaultMessage: 'attachment'
  },
  attachments: {
    id: `${ns}.attachments`,
    defaultMessage: 'attachments'
  },
  mailbox: {
    id: `${ns}.mailbox`,
    defaultMessage: 'Mailbox'
  },

  mailboxes: {
    id: `${ns}.mailboxes`,
    defaultMessage: 'Identities'
  },

  compose: {
    id: `${ns}.compose`,
    defaultMessage: 'Compose'
  },

  composeANewMessage: {
    id: `${ns}.compose-a-new-message`,
    defaultMessage: 'Compose a new message'
  },

  email: {
    id: `${ns}.email`,
    defaultMessage: 'Email'
  },

  to: {
    id: `${ns}.to`,
    defaultMessage: 'To'
  },

  from: {
    id: `${ns}.from`,
    defaultMessage: 'From'
  },

  inbox: {
    id: `${ns}.inbox`,
    defaultMessage: 'Inbox'
  },

  unread: {
    id: `${ns}.unread`,
    defaultMessage: 'Unread'
  },

  sent: {
    id: `${ns}.sent`,
    defaultMessage: 'Sent'
  },

  forwarded: {
    id: `${ns}.forwarded`,
    defaultMessage: 'Forwarded'
  },

  archive: {
    id: `${ns}.archive`,
    defaultMessage: 'Archive'
  },

  emailArchived: {
    id: `${ns}.emailArchived`,
    defaultMessage: 'Email Archived'
  },

  trash: {
    id: `${ns}.trash`,
    defaultMessage: 'Trash'
  },

  reply: {
    id: `${ns}.reply`,
    defaultMessage: 'Reply'
  },

  forward: {
    id: `${ns}.forward`,
    defaultMessage: 'Forward'
  },

  emailTrashed: {
    id: `${ns}.emailTrashed`,
    defaultMessage: 'Email moved to Trash'
  },

  emailMarkedUnread: {
    id: `${ns}.emailMarkedUnread`,
    defaultMessage: 'Email Marked Unread'
  },

  emailMarkedRead: {
    id: `${ns}.emailMarkedRead`,
    defaultMessage: 'Email Marked Read'
  },

  emptyTrash: {
    id: `${ns}.empty-trash`,
    defaultMessage: 'Empty trash'
  },

  queued: {
    id: `${ns}.queued`,
    defaultMessage: 'Queued'
  },

  sender: {
    id: `${ns}.sender`,
    defaultMessage: 'Sender'
  },

  subject: {
    id: `${ns}.subject`,
    defaultMessage: 'Subject'
  },

  cancel: {
    id: `${ns}.cancel`,
    defaultMessage: 'Cancel'
  },

  emptyList: {
    id: `${ns}.empty-list`,
    defaultMessage: 'Your mailbox is empty.'
  },

  selectAnEmail: {
    id: `${ns}.select-an-email`,
    defaultMessage: 'Please select an email'
  },

  filterByUnreadMessages: {
    id: `${ns}.filter-by-unread-messages`,
    defaultMessage: 'Filter by unread messages'
  },

  selectMailbox: {
    id: `${ns}.select-mailbox`,
    defaultMessage: 'Select Identity'
  },

  selectMailboxes: {
    id: `${ns}.select-mailboxes`,
    defaultMessage: 'Select Identities'
  },

  composeSubjectFieldPlaceholder: {
    id: `${ns}.compose-subject-field-placeholder`,
    defaultMessage: 'Enter subject...'
  },

  composeBodyFieldPlaceholder: {
    id: `${ns}.compose-body-field-placeholder`,
    defaultMessage: 'Type your email here...'
  },

  addAttachmentMessage: {
    id: `${ns}.add-attachment-message`,
    defaultMessage: 'Add attachments'
  },

  addAttachmentFullMessage: {
    id: `${ns}.add-attachment-full-message`,
    defaultMessage: 'Add attachments (click or drop files on this bar)'
  },

  send: {
    id: `${ns}.send`,
    defaultMessage: 'Send'
  },

  sendingEllipses: {
    id: `${ns}.sending-ellipses`,
    defaultMessage: 'Sending...'
  },

  composeBodyEditorLoading: {
    id: `${ns}.loading-editor`,
    defaultMessage: 'Loading Editor...'
  },

  sendMessage: {
    id: `${ns}.send-message`,
    defaultMessage: 'Send Message!'
  },

  moveToTrash: {
    id: `${ns}.move-to-trash`,
    defaultMessage: 'Move to trash'
  },

  emailDeletedPermanently: {
    id: `${ns}.email-deleted-permanently`,
    defaultMessage: 'Email deleted permanently'
  },

  emailPathAnalyzer: {
    id: `${ns}.email-path-analyzer`,
    defaultMessage: 'Email path analyzer'
  },

  encryptWithNeedsKeys: {
    id: `${ns}.encrypt-with-needs-keys-label`,
    defaultMessage: 'Upload keys via {contactsLink} editor to enable encryption options'
  },
  encryptWithLabel: {
    id: `${ns}.encrypt-with-label`,
    defaultMessage: 'Encrypt with'
  },
  attachPublicKeyLabel: {
    id: `${ns}.attach-public-key`,
    defaultMessage: 'Attach keys'
  },

  videoChatUserInvite: {
    id: `${ns}.video-chat-user-invite`,
    defaultMessage: 'I tried to call you with MsgSafe.io Secure Video.  Please call me back.'
  },

  videoChatGuestInvite: {
    id: `${ns}.video-chat-guest-invite`,
    defaultMessage: 'I would like to talk to you with MsgSafe.io Secure Video.  Please call me using the following link:\n {url}'
  },

  forwardedState: {
    id: `${ns}.forwarded-state`,
    defaultMessage: 'This email was forwarded.'
  },
  forwardedStateWithEmail: {
    id: `${ns}.forwarded-state-with-email`,
    defaultMessage: 'This email was forwarded to {emailAddr}.'
  },
  queuedSendState: {
    id: `${ns}.queued-state`,
    defaultMessage: 'Your email to {emailAddr} from {idenEmail} originating from {idenRegion} has not been sent and is queued for delivery.  You can now choose between delivering or deleting the selected email.'
  },
  outboundEncryptedState: {
    id: `${ns}.outbound-encrypted-state`,
    defaultMessage: 'This email is encrypted, the contents can only be read by the recipient.'
  },

  clearTrashConfirmationMessage: {
    id: `${ns}.clear-trash-confirmation-message`,
    defaultMessage: 'Are you sure you want to clear the trash?'
  },

  smimeEncrypted: {
    id: `${ns}.smime-encrypted`,
    defaultMessage: '{smime} encrypted'
  },

  gpgEncrypted: {
    id: `${ns}.gpg-encrypted`,
    defaultMessage: '{gpg} encrypted'
  },

  gpgSmimeEncrypted: {
    id: `${ns}.gpg-smime-encrypted`,
    defaultMessage: '{gpg} and {smime} encrypted'
  },

  espNotConfirmed: {
    id: `${ns}.esp-not-confirmed`,
    defaultMessage: 'Email Not Confirmed'
  },

  espRequiredToSend: {
    id: `${ns}.esp-required-to-send`,
    defaultMessage: 'Please add and confirm your email address before sending emails with MsgSafe.'
  },

  addEmailAddress: {
    id: `${ns}.add-email-address`,
    defaultMessage: 'Add Email'
  },
  originOrDestinationMap: {
    id: `${ns}.origin-or-destination-map`,
    defaultMessage: 'ORIGIN/DESTINATION MAP'
  },
  hide: {
    id: `${ns}.hide`,
    defaultMessage: 'Hide'
  },
  show: {
    id: `${ns}.show`,
    defaultMessage: 'Show'
  },

  downloadingAttachments: {
    id: `${ns}.downloading-attachments`,
    defaultMessage: 'downloading attachments'
  },

  selectContact: {
    id: `${ns}.select-contact`,
    defaultMessage: 'Select contact'
  },

  selectTo: {
    id: `${ns}.select-to`,
    defaultMessage: 'Select to'
  },
  manual: {
    id: `${ns}.manual`,
    defaultMessage: 'Manual'
  },
  sendingEmail: {
    id: `${ns}.sending-email`,
    defaultMessage: 'Sending email'
  },
  couldNotAttachFile: {
    id: `${ns}.could-not-attach-file`,
    defaultMessage: 'Could not attach the file: {filename}'
  },
  couldNotAttachImage: {
    id: `${ns}.could-not-attach-image`,
    defaultMessage: 'Could not attach the image: {filename}'
  },
  attachmentsSizeExceedsAllowedLimit: {
    id: `${ns}.could-not-exceed-file-upload-limit`,
    defaultMessage: 'The attachments size exceeds the allowable limit of {limitInMB}MB'
  },
  noLinkedEmail: {
    id: `${ns}.no-linked-email`,
    defaultMessage: 'No Linked Email'
  },
  addEmailAddressMessage: {
    id: `${ns}.add-email-address-message`,
    defaultMessage: 'You need to add and confirm an email address before sending emails'
  },
  emailNotConfirmed: {
    id: `${ns}.email-not-confirmed`,
    defaultMessage: 'Email Not Confirmed'
  },
  confirmEmailAddressMessage: {
    id: `${ns}.confirm-email-address-message`,
    defaultMessage: 'Please confirm your email address before sending emails'
  },
  dismiss: {
    id: `${ns}.dismiss`,
    defaultMessage: 'Dismiss'
  },
  resend: {
    id: `${ns}.resend`,
    defaultMessage: 'Resend'
  },
  subjectIsRequired: {
    id: `${ns}.subject-is-required`,
    defaultMessage: 'Subject is required'
  },
  bodyIsRequired: {
    id: `${ns}.body-is-required`,
    defaultMessage: 'Body is required'
  },
  typeEmailAddress: {
    id: `${ns}.type-email-address`,
    defaultMessage: 'Type email address (or click plus)'
  },
  editEmail: {
    id: `${ns}.edit-email`,
    defaultMessage: 'Edit Email'
  },
  addEmail: {
    id: `${ns}.add-email`,
    defaultMessage: 'Add Email'
  },
  noEmailsYet: {
    id: `${ns}.no-emails-yet`,
    defaultMessage: 'You have no emails yet'
  },
  clickHereToSendOne: {
    id: `${ns}.click-here-to-send-one`,
    defaultMessage: 'Click here to send one'
  },
  clearAll: {
    id: `${ns}.clear-all`,
    defaultMessage: 'Clear All'
  },
  emailDeleted: {
    id: `${ns}.email-deleted`,
    defaultMessage: 'Email deleted'
  },
  emailMovedToInbox: {
    id: `${ns}.email-moved-to-inbox`,
    defaultMessage: 'Email moved to Inbox'
  },

  emailMovedToSent: {
    id: `${ns}.email-moved-to-sent`,
    defaultMessage: 'Email moved to Sent'
  },

  moveToArchive: {
    id: `${ns}.move-to-archive`,
    defaultMessage: 'Move to Archive'
  },
  moveToInbox: {
    id: `${ns}.move-to-inbox`,
    defaultMessage: 'Move to Inbox'
  },
  moveToSent: {
    id: `${ns}.move-to-sent`,
    defaultMessage: 'Move to Sent'
  },

  failedToSendEmail: {
    id: `${ns}.failed-to-send-email`,
    defaultMessage: 'Failed to send the email, please try again.'
  },

  receivedANewMessage: {
    id: `${ns}.received-a-new-message`,
    defaultMessage: 'You have received a new message'
  },

  mailPluralToTrash: {
    id: `${ns}.mail-plural-to-trash`,
    defaultMessage: '{emailCount} emails moved to Trash.'
  },

  mailPluralArchived: {
    id: `${ns}.mail-plural-archived`,
    defaultMessage: '{emailCount} emails archived.'
  },

  mailPluralRead: {
    id: `${ns}.mail-plural-read`,
    defaultMessage: '{emailCount} emails marked as read.'
  },

  mailPluralUnread: {
    id: `${ns}.mail-plural-unread`,
    defaultMessage: '{emailCount} emails marked as unread.'
  },

  mailPluralDeleted: {
    id: `${ns}.mail-plural-deleted`,
    defaultMessage: '{emailCount} emails deleted.'
  },

  oneMailToTrash: {
    id: `${ns}.one-mail-to-trash`,
    defaultMessage: '{emailCount} email moved to Trash.'
  },

  oneMailArchived: {
    id: `${ns}.one-mail-archived`,
    defaultMessage: '{emailCount} email archived.'
  },

  oneMailRead: {
    id: `${ns}.one-mail-read`,
    defaultMessage: '{emailCount} email marked as read.'
  },

  oneMailUnread: {
    id: `${ns}.one-mail-unread`,
    defaultMessage: '{emailCount} email marked as unread.'
  },

  oneMailDeleted: {
    id: `${ns}.one-mail-deleted`,
    defaultMessage: '{emailCount} email deleted.'
  }
})

export default m
