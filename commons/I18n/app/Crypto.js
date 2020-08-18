import { defineMessages } from 'react-intl'

const ns = 'app.Crypto'
const m = defineMessages({

  encryptionSetupFormTitle: {
    id: `${ns}.encryption-setup-form-title`,
    defaultMessage: 'S/MIME public certificate and GPG public key encryption setup'
  },

  gpgPublicKey: {
    id: `${ns}.gpg-public-key`,
    defaultMessage: 'GPG public key'
  },
  noGpgPublicKeySaved: {
    id: `${ns}.no-gpg-public-key-saved`,
    defaultMessage: 'You do not have a public key saved.'
  },
  smimePublicCertificate: {
    id: `${ns}.smime-public-certificate`,
    defaultMessage: 'S/MIME public certificate'
  },
  noSmimePublicCertificateSaved: {
    id: `${ns}.no-smime-public-certificate`,
    defaultMessage: 'You do not have a public certificate saved.'
  },

  uploadPublicCertificate: {
    id: `${ns}.upload-public-certificate`,
    defaultMessage: 'Upload public certificate'
  },

  uploadPublicKey: {
    id: `${ns}.upload-public-key`,
    defaultMessage: 'Upload public key'
  },

  requestFreeSmimeCertificate: {
    id: `${ns}.request-free-smime-certificate`,
    defaultMessage: 'Request free S/MIME certificate'
  },
  requestCertificate: {
    id: `${ns}.request-certificate`,
    defaultMessage: 'Request certificate'
  },
  generateFreeSmimeCertificateUsing: {
    id: `${ns}.generate-free-smime-cert-using`,
    defaultMessage: 'Generate Free S/MIME certificate using TrustCor\'s Certificate Authority'
  },

  encryptionRequestSmimeTitle: {
    id: `${ns}.encryption-request-smime-title`,
    defaultMessage: 'Request free S/MIME certificate from TrustCor\'s Certificate Authority'
  },

  passphrase: {
    id: `${ns}.passphrase`,
    defaultMessage: 'Create passphrase'
  },
  passphraseAgain: {
    id: `${ns}.reenter-passphrase`,
    defaultMessage: 'Re-enter passphrase'
  },

  p12TextLabel: {
    id: `${ns}.p12-text-label`,
    defaultMessage: 'p12 password'
  },
  p12TextLabelAgain: {
    id: `${ns}.p12-text-label-again`,
    defaultMessage: 'p12 password again'
  },
  p12HelpText: {
    id: `${ns}.p12-help-text`,
    defaultMessage: 'We will encrypt your certificate keypair with this password.'
  },
  p12HelpTextAgain: {
    id: `${ns}.p12-help-text-again`,
    defaultMessage: 'Type the same password again.'
  },

  encryptionRequestSmimeDesc1: {
    id: `${ns}.encryption-request-smime-desc-1`,
    defaultMessage: 'MsgSafe.io believes that private and secure messaging should be freely available to everyone. We will provide one free S/MIME certificate for each forwarding email address you confirm you own. The certificate will allow you to use the digial sign and encrypt features built into many local email clients, including Microsoft Mail, Outlook, Entourage and Express, Apple Mail, Mozilla Thunderbird, or any S/MIME compliant software.'
  },

  pkcs12ArchiveTitle: {
    id: `${ns}.pkcs12-archive-title`,
    defaultMessage: 'PKCS 12 certificate archive passphrase'
  },

  smimeCertificateTitle: {
    id: `${ns}.smime-cert-title`,
    defaultMessage: 'S/MIME certificate passphrase'
  },

  pkcs12ArchiveDesc1: {
    id: `${ns}.pkcs12-archive-desc1`,
    defaultMessage: 'PKCS 12 is a file format for storing multiple cryptography objects.   We will email you a PKCS 12 file (using the extension ".p12") that contains your new S/MIME public and private certificates.  If you lose this passphrase, you will not be able to install your certificates.'
  },

  smimePassphraseDesc1: {
    id: `${ns}.smime-passphrase-desc-1`,
    defaultMessage: 'You will use your S/MIME certificate passphrase every time you unlock encrypted emails using S/MIME compliant software.  If you lose this passphrase, you will not be able to decrypt email.  We do not store your PKCS 12 or S/MIME passphrases and will not be able to help you.'
  },

  smimeCertRequestForEmail: {
    id: `${ns}.smime-cert-request-for-email`,
    defaultMessage: 'S/MIME certificate request for {eMail}'
  },

  identitySmimeAndGpgTitle: {
    id: `${ns}.identity-smime-and-gpg-title`,
    defaultMessage: 'Email encryption: public key/cert'
  },

  contactSmimeAndGpgTitle: {
    id: `${ns}.contact-smime-and-gpg-title`,
    defaultMessage: 'Email encryption: public key/cert'
  }

})

export default m
