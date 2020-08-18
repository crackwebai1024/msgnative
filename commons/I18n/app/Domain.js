import { defineMessages } from 'react-intl'

const ns = 'app.Domain'
const m = defineMessages({

  suggestNames: {
    id: `${ns}.suggest`,
    defaultMessage: 'Suggest names'
  },

  emptyList: {
    id: `${ns}.emptyList`,
    defaultMessage: 'There are no domains configured for your account.'
  },

  domainSearchResults: {
    id: `${ns}.domain-search-results`,
    defaultMessage: 'Domain search results'
  },
  domain: {
    id: `${ns}.domain`,
    defaultMessage: 'Domain'
  },
  domains: {
    id: `${ns}.domains`,
    defaultMessage: 'Domains'
  },
  selectDomains: {
    id: `${ns}.select-domains`,
    defaultMessage: 'Select Domains'
  },
  connectMyDomain: {
    id: `${ns}.connect-my-domain`,
    defaultMessage: 'Connect my domain'
  },
  buyADomain: {
    id: `${ns}.buy-a-domain`,
    defaultMessage: 'Buy a domain'
  },

  createLandingTitle: {
    id: `${ns}.create-landing-title`,
    defaultMessage: 'Add an Internet domain name'
  },
  purchaseLandingTitle: {
    id: `${ns}.purchase-landing-title`,
    defaultMessage: 'Search for and buy a domain'
  },

  createLandingHeader: {
    id: `${ns}.create-landing-header`,
    defaultMessage: 'Custom domains with MsgSafe.io'
  },
  createLandingDesc1: {
    id: `${ns}.create-landing-desc1`,
    defaultMessage: 'Custom domains are a free offering that let you use MsgSafe.io to host and forward email for a domain you already own or a domain you purchase through MsgSafe.io.'
  },
  createLandingDesc2: {
    id: `${ns}.create-landing-desc2`,
    defaultMessage: 'If you already own a domain and want to integrate it with MsgSafe.io to host and forward your email, select'
  },
  createLandingDesc3: {
    id: `${ns}.create-landing-desc3`,
    defaultMessage: 'If you would like to buy a new domain, select {buyADomain}. When you buy a domain, you can still point DNS records at other services.'
  },

  connectMyDomainTitle: {
    id: `${ns}.connect-domain-title`,
    defaultMessage: 'Connect my domain'
  },

  connectMyDomainHelpText: {
    id: `${ns}.connect-domain-help-text`,
    defaultMessage: 'Verify the domain name that you would like to connect'
  },

  connectDomainWhoisSuccessDesc1: {
    id: `${ns}.connect-domain-whois-success-desc1`,
    defaultMessage: 'We found the domain! If this is the domain you own, proceed with {connectMyDomain} below. If you would like to purchase a new domain, use {buyADomain}.'
  },

  confirmRemoveDesc1: {
    id: `${ns}.confirm-remove-desc-1`,
    defaultMessage: 'Are you sure you want to delete {nameStr}?'
  },

  checkDnsButton: {
    id: `${ns}.check-dns-button`,
    defaultMessage: 'Check {dnsLabel} Records'
  },

  lastTestedOn: {
    id: `${ns}.last-tested-on`,
    defaultMessage: 'Last tested {lastTest}'
  },

  pendingConfirmation: {
    id: `${ns}.pending-confirmation`,
    defaultMessage: 'pending confirmation'
  },

  notConfirmedDetail: {
    id: `${ns}.not-confirmed-detail`,
    defaultMessage: 'Go to your DNS provider that you use to manage {domainName} and add the following required DNS records.  Common providers include DnSimple, Godaddy, NameCheap, Network Solutions, Rackspace, Amazon and Digital Ocean.'
  },

  connectDomainNotConfirmed: {
    id: `${ns}.check-domain-not-confirmed`,
    defaultMessage: 'Domain is not confirmed'
  },

  recurringDomainRegistration: {
    id: `${ns}.recurring-domain-registration`,
    defaultMessage: 'Recurring domain registration'
  },

  userCreditAdjustment: {
    id: `${ns}.user-credit-adjustment`,
    defaultMessage: 'User credit adjustment'
  },

  /* Not found, or generic. */
  connectDomainGenericFailure1: {
    id: `${ns}.connect-domain-generic-failure1`,
    defaultMessage: 'Sorry, we are unable to verify the domain you requested exists. Please verify the spelling of your domain and try again.'
  },
  connectDomainGenericFailure2: {
    id: `${ns}.connect-domain-generic-failure2`,
    defaultMessage: 'If the domain is not registered and available, you can purchase it using {buyADomain}.'
  },
  /* Domain already connected but not owned */
  connectDomainNotOwnedFailure: {
    id: `${ns}.connect-domain-not-owned-failure`,
    defaultMessage: 'We found the domain, but it is already connected to MsgSafe.io! If you know who the owner is, you can ask them to add you to the domain group.'
  },

  /* Domain already connected and owned */
  connectDomainAlreadyConnectedFailure: {
    id: `${ns}.connect-domain-already-connected-failure`,
    defaultMessage: 'You have already added this domain to MsgSafe.io! You can modify its configuration from {internetDomainLink}.'
  },

  connectDomainAlreadyConnectedSystemDomain: {
    id: `${ns}.connect-domain-already-connected-system-domain`,
    defaultMessage: 'The domain you requested to connect is owned by MsgSafe.io. You can already use it from {mailboxesLink}. If the name is not available to you, please {upgradeLink}.'
  },

  domainPurchaseAvailableDesc1: {
    id: `${ns}.purchase-domain-available-desc1`,
    defaultMessage: 'The domain name {domainName} is available for ${domainPrice}!'
  },

  domainPurchaseNotAvailableDesc1: {
    id: `${ns}.purchase-domain-not-available-desc1`,
    defaultMessage: 'The domain name {domainName} is not available. Would you like to search for alternative domain names?'
  },

  domainSuggestionsFailed: {
    id: `${ns}.domain-suggestions-failed`,
    defaultMessage: 'Sorry, we were unable to suggest names. Please try again or a different domain name.'
  },
  pleaseSelectADomain: {
    id: `${ns}.please-select-a-domain`,
    defaultMessage: 'Please select a domain'
  },
  searchConnectDomain: {
    id: `${ns}.search-connect-domain`,
    defaultMessage: 'Enter the domain name you would like to connect to MsgSafe.io.'
  },

  instructionsForInternetDomains: {
    id: `${ns}.instructions-for-internet-domains`,
    defaultMessage: 'Instructions for Internet Domains'
  },

  wildcardToggleTitle: {
    id: `${ns}.wildcard-toggle-title`,
    defaultMessage: 'Automatic mailbox and email address creation'
  },

  wildcardToggleLabel: {
    id: `${ns}.wildcard-toggle-label`,
    defaultMessage: 'Create new identity email addresses when they do not exist'
  },

  wildcardToggleDesc1: {
    id: `${ns}.wildcard-toggle-desc1`,
    defaultMessage: 'We will accept all email sent to your domain and automatically create new identity email addressers for you. With this feature, you can create new email addresses on demand. Later, you can customize each mailbox from Identities settings. You can enable or disable this feature at any time.'
  },

  defaultCountryOfOrigin: {
    id: `${ns}.default-country-of-origin`,
    defaultMessage: 'Default country of origin'
  },

  youCanAddEsp: {
    id: `${ns}.you-can-add-esp`,
    defaultMessage: 'You can add alternate email service providers from {link}'
  },

  stateToggleTitleLabel: {
    id: `${ns}.state-toggle-title-label`,
    defaultMessage: 'Temporarily block or blackhole all email sent to domain'
  },

  stateAcceptMail: {
    id: `${ns}.state-accept-mail`,
    defaultMessage: 'Accept mail normally (default)'
  },
  stateBlackholeMail: {
    id: `${ns}.state-blackhole-mail`,
    defaultMessage: 'Blackhole all email sent to domain. Do not notify sender their mail was rejected'
  },
  stateBlockMail: {
    id: `${ns}.state-block-mail`,
    defaultMessage: 'Block all email sent to this domain. Notify sender their mail was rejected'
  },

  domainGroupMembershipTitleLabel: {
    id: `${ns}.domain-group-membership`,
    defaultMessage: 'Domain group membership'
  },
  domainGroupMembershipDesc1: {
    id: `${ns}.domain-group-membership-desc1`,
    defaultMessage: 'If you know other users of MsgSafe.io, you can add them as group members to your domain.  Group members are allowed to create new identities and email addresses using your domain.  You will not be able to read their email.'
  },
  addGroupMember: {
    id: `${ns}.add-group-member`,
    defaultMessage: 'Add group member'
  },
  addGroupMemberHelpText: {
    id: `${ns}.add-group-member-help-text`,
    defaultMessage: 'Please type the email address for the user you intend to add to your domain group.  The email address must be associated with an existing MsgSafe.io mailbox.'
  },
  domainGroupMembers: {
    id: `${ns}.domain-group-members`,
    defaultMessage: 'Domain group members'
  },

  dnsIsNotConfirmed: {
    id: `${ns}.dns-is-not-confirmed`,
    defaultMessage: 'DNS is not confirmed for this domain'
  },

  requiredMx: {
    id: `${ns}.required-mx`,
    defaultMessage: 'Required MX records'
  },

  requiredTxt: {
    id: `${ns}.required-txt`,
    defaultMessage: 'Required TXT record'
  },

  yourMx: {
    id: `${ns}.your-mx`,
    defaultMessage: 'Your MX results'
  },

  yourTxt: {
    id: `${ns}.your-spf`,
    defaultMessage: 'Your TXT results'
  },

  acceptTermsToPurchase: {
    id: `${ns}.accept-terms-to-purchase`,
    defaultMessage: 'Please accept terms to purchase the domain'
  },

  dnsCheckerTitle: {
    id: `${ns}.dns-checker-title`,
    defaultMessage: 'Domain {mx} & {txt} records'
  },

  dnsMxTableStatus: {
    id: `${ns}.dns-mx-table-label-status`,
    defaultMessage: 'Status'
  },

  dnsMxTableType: {
    id: `${ns}.dns-mx-table-label-type`,
    defaultMessage: 'Type'
  },

  priority: {
    id: `${ns}.priority`,
    defaultMessage: 'Priority'
  },

  dnsMxTableRequired: {
    id: `${ns}.dns-mx-table-label-required`,
    defaultMessage: 'Required value'
  },

  dnsMxTableActual: {
    id: `${ns}.dns-mx-table-label-actual`,
    defaultMessage: 'Current value'
  },

  dnsMxTableMessage: {
    id: `${ns}.dns-mx-table-mesage`,
    defaultMessage: '{mx} records are required for all domains, even if you are only sending messages.'
  },

  dnsSpfTableMessage: {
    id: `${ns}.dns-spf-table-mesage`,
    defaultMessage: '{spfTxt} recrods are required to send and recieve email with MsgSafe.io'
  },

  checkingMxRecords: {
    id: `${ns}.checking-mx-records`,
    defaultMessage: 'Checking {mx} records'
  },

  checkingSpfRecords: {
    id: `${ns}.checking-spf-records`,
    defaultMessage: 'Checking {spf} records'
  },

  summary: {
    id: `${ns}.summary`,
    defaultMessage: 'Summary'
  },

  issues: {
    id: `${ns}.issues`,
    defaultMessage: 'Issues'
  }

})

export default m
