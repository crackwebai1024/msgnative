import { defineMessages } from 'react-intl'

const ns = 'app.Identity'
const m = defineMessages({
  listTitle: {
    id: `${ns}.list-title`,
    defaultMessage: 'Identities'
  },

  editTitle: {
    id: `${ns}.edit-title`,
    defaultMessage: 'Edit mailbox'
  },

  emptyList: {
    id: `${ns}.empty-list`,
    defaultMessage: 'There are no identities configured for your account.'
  },

  creationPageTitle: {
    id: `${ns}.creation-page-title`,
    defaultMessage: 'New identity and email address'
  },

  displayNameHelp: {
    id: `${ns}.display-name-help`,
    defaultMessage: 'The name to display when you communicate from this mailbox and signed on the emails you send.'
  },

  newMailboxFormGeneration: {
    id: `${ns}.new-mailbox-form-generation`,
    defaultMessage: 'We can randomly generate a name, email address and country of origin.'
  },

  emailHelp: {
    id: `${ns}.email-domain-help`,
    defaultMessage: 'The part before the @ symbol identifies the name of a mailbox. The part after the @ symbol is a domain name that represents the realm for the mailbox.  After you create your first mailbox, you can opt to purchase or bring your own domain.'
  },

  countryOfOrigin: {
    id: `${ns}.country-of-origin`,
    defaultMessage: 'Country of origin'
  },

  countryOfOriginHelp: {
    id: `${ns}.country-of-origin-help`,
    defaultMessage: 'When you send email from this address, it will originate on the Internet from this country.'
  },

  emailAddressWillBe: {
    id: `${ns}.email-address-will-be`,
    defaultMessage: 'Your email address will be'
  },

  outgoingEmailWillBeFrom: {
    id: `${ns}.outgoing-email-will-be-from`,
    defaultMessage: 'Outgoing email will be sent from'
  },

  certGenerationDesc1: {
    id: `${ns}.cert-generation-desc-1`,
    defaultMessage: 'In addition to creating your new address, we are generating your encryption keys.  You can start using {labelGPG} and {labelSMIME} immediately.  When you are ready, you can customize when and how encryption is used.'
  },

  certGenerationLabel1: {
    id: `${ns}.cert-generation-label-1`,
    defaultMessage: 'We are setting up your new identity and email address, please be patient.'
  },

  creatingMailbox: {
    id: `${ns}.cert-generation-creating-mailbox`,
    defaultMessage: 'Creating a mailbox'
  },

  generatingCerts: {
    id: `${ns}.cert-generation-generating-certs`,
    defaultMessage: 'Generating certificates'
  },

  verifyingMailbox: {
    id: `${ns}.cert-generation-verifying-mailbox`,
    defaultMessage: 'Verifying mailbox'
  },

  wrappingUp: {
    id: `${ns}.cert-generation-wrap-up`,
    defaultMessage: 'Wrapping up'
  },

  emailTaken: {
    id: `${ns}.identity-email-taken`,
    defaultMessage: '{email} not available'
  },

  newMailbox: {
    id: `${ns}.new-mailbox`,
    defaultMessage: 'New Mailbox'
  },

  emailSignature: {
    id: `${ns}.email-signature`,
    defaultMessage: 'Email signature'
  },

  includeSignatureCompose: {
    id: `${ns}.include-signature-compose`,
    defaultMessage: 'Automatically include my signature on emails I compose'
  },

  includeSignatureReplyForward: {
    id: `${ns}.include-signature-reply-forward`,
    defaultMessage: 'Automatically include my signature on emails I reply-to or forward'
  },

  defaultEncryptionStandardTitle: {
    id: `${ns}.default-encryption-standard-title`,
    defaultMessage: 'Default encryption standard for the email you send'
  },

  defaultEncryptionStandardHelp: {
    id: `${ns}.default-encryption-standard-help`,
    defaultMessage: 'You can enable both GPG and S/MIME,.  We will deliver emails using both encryption standards.'
  },

  defaultEncryptionGPG: {
    id: `${ns}.default-encryption-gpg`,
    defaultMessage: 'If email recipient’s GPG public key is available, use GPG encryption'
  },

  defaultEncryptionSMIME: {
    id: `${ns}.default-encryption-smime`,
    defaultMessage: 'If email recipient’s S/MIME certificate is available, use S/MIME encryption'
  },

  emailBlockingPostProcessingTitle: {
    id: `${ns}.email-blocking-post-processing-title`,
    defaultMessage: 'Email blocking and post-processing'
  },

  stripHTML: {
    id: `${ns}.strip-rich-text`,
    defaultMessage: 'Strip ‘rich text’, images and HTML - protect from pixel and content trackers'
  },

  stripHTMLHelp: {
    id: `${ns}.strip-rich-text-help`,
    defaultMessage: 'We strip all of the ‘rich text’, images and HTML and convert it to unrendered markdown ‘plain text’.'
  },

  blockNewContacts: {
    id: `${ns}.block-new-contacts`,
    defaultMessage: 'Block new/unauthorized contacts from emailing this address.'
  },

  blockNewContactsHelp: {
    id: `${ns}.block-new-contacts-help`,
    defaultMessage: 'Allow only contacts in this mailbox’s address book.  Block email sent from unknown contacts.'
  },

  twoFactorSend: {
    id: `${ns}.two-factor-send`,
    defaultMessage: 'Email sent from this address must be approved before it is delivered'
  },
  twoFactorSendHelp: {
    id: `${ns}.two-factor-send-help`,
    defaultMessage: 'The email you send from this address is queued for delivery, visible in your QUEUED folder.  It is not sent to the recipient until you release it.'
  },

  emailForwardingTitle: {
    id: `${ns}.email-forwarding-title`,
    defaultMessage: 'Email forwarding to alternative email service provider'
  },

  forwardEmail: {
    id: `${ns}.forward-email`,
    defaultMessage: 'Forward email sent to this mailbox to an alternate service provider'
  },

  forwardEmailHelp: {
    id: `${ns}.forward-email-help`,
    defaultMessage: 'We can deliver your email to alternate service providers, like Gmail, Outlook and private email servers.  When forwarding, we still provide valuable analytics and protection for your private email addresses — and can optionally encrypt the mail we forward, so your other service providers cannot read it   Forwarded email will still show up in your Forwards folder.'
  },

  confirmESPToEnableForwarding: {
    id: `${ns}.confirm-esp-to-enable-forwarding`,
    defaultMessage: 'Please confirm your email address to enable forwarding'
  },

  forwardToDestination: {
    id: `${ns}.forward-to-destination`,
    defaultMessage: 'Forward-To destination'
  },

  forwardToDestinationHelp: {
    id: `${ns}.forward-to-destination-help`,
    defaultMessage: 'If you would like to add a new alternate service provider, you will need to confirm that you can receive it.'
  },

  forwardOptionPrefixOrigin: {
    id: `${ns}.forward-option-prefix-origin`,
    defaultMessage: 'Prefix email subject with Country of origin'
  },

  forwardOptionIncludeGPG: {
    id: `${ns}.forward-option-include-gpg`,
    defaultMessage: 'If email  GPG public key is available for destination, include GPG encryption'
  },

  forwardOptionIncludeSMIME: {
    id: `${ns}.forward-option-include-smime`,
    defaultMessage: 'If email S/MIME certificate is available for destination, include S/MIME encryption'
  },

  pleaseSelectAMailbox: {
    id: `${ns}.please-select-a-mailbox`,
    defaultMessage: 'Please select a mailbox'
  },

  importVCardTitle: {
    id: `${ns}.import-vcard-title`,
    defaultMessage: "Import vCard(s) to mailbox's contacts list"
  },

  importVCardHelp: {
    id: `${ns}.import-vcard-help`,
    defaultMessage: 'vCard is a file format standard for electronic contact cards.  They can contain name and address information, telephone numbers, e-mail addresses and logos.   You can automatically populate your address book by uploading a single or multiple contacts in a single vCard file.'
  },

  clickToImportVCard: {
    id: `${ns}.click-to-import-vcard`,
    defaultMessage: 'Click to import vCards'
  },

  vCardsUploaded: {
    id: `${ns}.vcards-uploaded`,
    defaultMessage: '{nCount} vCards were successfully uploaded'
  },

  intro1: {
    id: `${ns}.intro-1`,
    defaultMessage: 'MsgSafe.io protects your identity online, immediately, by providing as many email addresses as you need.  This allows you to stop giving out your private email and keep it private — making it difficult for others to intercept, track you down, market to you or steal your identity.'
  },

  intro2: {
    id: `${ns}.intro-2`,
    defaultMessage: 'We highly recommend registering or connecting your own domain.   If you registered with a paid plan, you have up to $20 USD credit towards registering your own domain name.   Personalizing your email experience with MsgSafe.io is the fastest way to make your communications more private and secure.'
  },

  intro3: {
    id: `${ns}.intro-3`,
    defaultMessage: 'We hope you will like our email application, but remember we also offer advanced forwarding features, like no other provider.  We can encrypt forwarded mail, even when when the sender didn’t use encryption.  We can also combine encryption standards, providing you with more options to read encrypted mail when “the other” standard isn’t supported on your device.'
  },

  yourMailboxIsReady: {
    id: `${ns}.your-mailbox-is-ready`,
    defaultMessage: 'Your mailbox is ready!'
  },

  identityNotFound: {
    id: `${ns}.identit-not-found`,
    defaultMessage: 'No matching mailbox found'
  }
})

export default m
