export const Method = {
  GET: 0,
  POST: 1,
  PUT: 2,
  DELETE: 3
}

export const MethodName = {
  0: 'GET',
  1: 'POST',
  2: 'PUT',
  3: 'DELETE'
}

/**
 * Object containing information about various operations
 * that can be done with the MsgSafe API.
 *
 * `<id>` can be used in route string, which will be replaced by the
 * API client with the id in payload before sending the request.
 *
 * signatureRequired: Force the request to an endpoint to be signed
 *                    Use case - Most of the endpoints that serves user account
 *                               related data required signature.
 *
 * forceHTTP: Force the request to an endpoint to use HTTP.
 *            User case - initial auth over HTTP and also the pickup
 *                        endpoint which is too slow over WS.
 */
export default {
  /**
   * Public - all will be forced over HTTP
   */

  CheckUsername: {
    route: 'signup/username/available',
    type: Method.POST,
    forceHTTP: true
  },

  CheckEmailForESP: {
    route: '/signup/user/email/valid',
    type: Method.POST,
    forceHTTP: true
  },

  RequestSendUsername: {
    route: 'users/recover/username',
    type: Method.POST,
    forceHTTP: true
  },

  Signup: {
    route: 'signup',
    type: Method.POST,
    forceHTTP: true
  },

  Login: {
    route: 'login',
    type: Method.POST,
    forceHTTP: true
  },

  Captcha: {
    route: 'captcha',
    type: Method.GET,
    forceHTTP: true
  },

  Logout: {
    route: 'logout',
    type: Method.POST,
    forceHTTP: true,
    signatureRequired: true
  },

  RequestPasswordReset: {
    route: 'users/recover/password',
    type: Method.POST,
    forceHTTP: true
  },

  PasswordReset: {
    route: 'users/recover/password',
    type: Method.PUT,
    forceHTTP: true
  },

  /**
   * User Area
   */

  CreateUserEmail: {
    route: 'user/email',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  UpdateUserEmail: {
    route: 'user/email/<id>',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteUserEmail: {
    route: 'user/email/<id>',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  UserEmailValid: {
    route: 'user/email/valid',
    type: Method.POST,
    forceHTTP: true
  },

  RequestConfirmationEmail: {
    route: 'user/email/<id>/confirm/reset',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  UpdateUserAccount: {
    route: 'users',
    type: Method.PUT,
    forceHTTP: true,
    signatureRequired: true
  },

  UpdateUserAccountState: {
    route: 'users/state',
    type: Method.PUT,
    forceHTTP: true,
    signatureRequired: true
  },

  UserProfile: {
    route: 'profile',
    type: Method.GET,
    forceHTTP: true,
    signatureRequired: true
  },

  // Account History

  AccountHistory: {
    route: 'user/history',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Stats

  Stats: {
    route: 'users/stats',
    type: Method.GET,
    signatureRequired: true
  },

  StatsByDate: {
    route: 'users/mobile/stats/date',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  GeoStats: {
    route: 'analytics/geo/stats',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // User Deletion History
  UserDeletionHistory: {
    route: 'user/deletion/history',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Mailbox

  Mailbox: {
    route: 'next/mailbox',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  UpdateMailbox: {
    route: 'mailbox',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  MailboxAnalytics: {
    route: 'analytics/uuid/<id>',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  UserEmail: {
    route: 'user/email',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  ConfirmUserEmail: {
    route: 'user/email/confirm',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  ConfirmUserEmailNoAuth: {
    route: 'confirm/email',
    type: Method.POST,
    signatureRequired: false,
    forceHTTP: true
  },

  Pickup: {
    route: 'next/pickup/<id>',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  SendEmail: {
    route: 'mailbox/send',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  MailboxDomains: {
    route: 'mailbox/domains',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  MailboxDrawerTotals: {
    route: 'mailbox/drawer/totals',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Contacts
  ContactsUnique: {
    route: 'contacts/unique',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Slimmed down result set
  ContactsUniqueNative: {
    route: 'contacts/unique/native',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  Contacts: {
    route: 'contacts',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  CreateContact: {
    route: 'contacts/add/email',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  EditContact: {
    route: 'contacts/update/email',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteContact: {
    route: '/contacts/delete/email',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteContactEmail: {
    route: 'contacts/delete/email',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  ContactHeatmap: {
    route: 'contacts/unique/geo',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Identities

  Identities: {
    route: 'identities',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  ValidateIdentity: {
    route: 'identities/validate',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  CreateIdentity: {
    route: 'identities',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  EditIdentity: {
    route: 'identities/<id>',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteIdentity: {
    route: 'identities/<id>',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  IdentityGenerateCrypto: {
    route: 'crypto/identity/<id>/generate',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  IdentitySendWelcome: {
    route: 'identities/<id>/welcome',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  IdentityMailbox: {
    route: 'next/mailbox',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Misc

  Region: {
    route: 'regions',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  /**
   * Domains
   */
  Domains: {
    route: 'domains',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  Tlds: {
    route: 'domains/tlds',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  WhoisDomain: {
    route: 'domain/whois',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  SuggestDomains: {
    route: 'domains/suggestions/available',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  DomainPurchaseAvailable: {
    route: 'domains/purchase/available',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  DomainPurchase: {
    route: 'domains/purchase',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  CreateDomain: {
    route: 'domains',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  ValidateDomain: {
    route: 'domains/<id>/validate',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteDomain: {
    route: 'domains/<id>',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  UpdateDomain: {
    route: 'domains/<id>',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  /**
   * Domain Zones
   */
  GetDomainZones: {
    route: 'domains/<id>/zones',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  CreateDomainZone: {
    route: 'domains/<id>/zones',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  UpdateDomainZone: {
    route: 'domains/<id>/zones',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteDomainZone: {
    route: 'domains/<id>/zones',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  /**
   * Chat
   */
  ChatHistory: {
    route: 'chat/history',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  ChatUserRequest: {
    route: 'chat/user/request',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  ChatSendInvite: {
    route: 'chat/send/invite',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  ChatMember: {
    route: 'chat/member',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  ChatMemberBatch: {
    route: 'chat/member/batch',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  Crypto: {
    route: 'crypto',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  CryptoGenerateSmime: {
    route: 'crypto/generate/smime',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  CryptoAddKey: {
    route: 'crypto',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  CryptoDeleteKey: {
    route: 'crypto/<id>',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  CryptoConfirmDecrypt: {
    route: 'crypto/confirm/decrypt',
    type: Method.POST,
    signatureRequired: false,
    forceHTTP: true
  },

  /* Domain Groups - Owner */
  CreateDomainGroup: {
    route: 'domain/group',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  AddDomainGroupMember: {
    route: 'domain/group/owner/member',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteDomainGroupMember: {
    route: 'domain/group/owner/member',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  DomainGroup: {
    route: 'domain/group',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  /* Domain Groups - Member */
  AcceptDomainGroupMembership: {
    route: 'domain/group/member',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  SwapDomainGroupMembership: {
    route: 'domain/group/member/swap',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteDomainGroupMembership: {
    route: 'domain/group/member',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DomainGroupMembership: {
    route: 'domain/group/member',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Payment

  Cards: {
    route: 'payment/cards',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  AddCard: {
    route: 'payment/cards',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  UpdateCard: {
    route: 'payment/cards',
    type: Method.PUT,
    signatureRequired: true,
    forceHTTP: true
  },

  DeleteCard: {
    route: 'payment/cards',
    type: Method.DELETE,
    signatureRequired: true,
    forceHTTP: true
  },

  // Payment History

  PaymentHistory: {
    route: '/user/payment/history',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  // Misc

  Plans: {
    route: 'plans',
    type: Method.GET,
    forceHTTP: true
  },

  CheckCoupon: {
    route: 'coupons',
    type: Method.POST,
    signatureRequired: true,
    forceHTTP: true
  },

  GetUpgradePrice: {
    route: 'users/upgrade/price',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  ExportContactVcard: {
    route: 'contacts/<id>/vcard',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  },

  ExportIdentityVcard: {
    route: 'identities/<id>/vcard',
    type: Method.GET,
    signatureRequired: true,
    forceHTTP: true
  }
}
