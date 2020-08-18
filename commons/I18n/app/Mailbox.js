import { defineMessages } from 'react-intl'

const ns = 'app.Mailbox'
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

  attachment: {
    id: `${ns}.attachment`,
    defaultMessage: 'Attachment'
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
  }

})

export default m
