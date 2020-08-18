import { takeLatest } from 'redux-saga/effects'

/* ------------- Types ------------- */

import { StartupTypes } from '../Redux/StartupRedux'
import { UserTypes } from '../Redux/UserRedux'
import { DashboardTypes } from '../Redux/DashboardRedux'
import { PlanAPITypesToSagas, PlanTypes } from '../Redux/PlanRedux'
import { DomainTypes, DomainAPITypesToSagas } from '../Redux/DomainRedux'
import { MailboxDomainTypes } from '../Redux/MailboxDomainRedux'
import { PaymentTypes } from '../Redux/PaymentRedux'
import { PaymentHistoryTypes } from '../Redux/PaymentHistoryRedux'

import { RegionTypes } from '../Redux/RegionRedux'
import { NotificationTypes } from '../Redux/NotificationRedux'
import { AccountHistoryTypes } from '../Redux/AccountHistoryRedux'
import { CryptoTypes, CryptoAPITypesToSagas } from '../Redux/CryptoRedux'

import ChatSagaBindings from './ChatSagas/SagaBindings'
import callHistorySagaBindings from './CallHistorySagas/SagaBindings'
import WebSocketSagaBindings from './ChatSagas/WebSocket/SagaBindings'
import ContactSagaBindings from './ContactSagas/SagaBindings'
import IdentitySagaBindings from './IdentitySagas/SagaBindings'
import UserEmailSagaBindings from './UserEmailSagas/SagaBindings'
import MailboxSagaBindings from './MailboxSagas/SagaBindings'

/* ------------- Sagas ------------- */

import { startup } from './StartupSagas'
import * as userSagas from './UserSagas'
import * as dashboardSagas from './DashboardSagas'
import * as domainSagas from './DomainSagas'
import * as mailboxDomainSagas from './MailboxDomainSagas'
import * as regionSagas from './RegionSagas'
import { handleNotificationTimeout } from './NotificationSagas'
import * as accountHistorySagas from './AccountHistorySagas'
import * as cryptoSagas from './CryptoSagas'
import * as planSagas from './PlanSagas'
import * as paymentSagas from './PaymentSagas'
import * as paymentHistorySagas from './PaymentHistorySagas'
import WebRTCSagaBindings from './WebrtcSagas/SagaBindings'

/* ------------- Connect Types To Sagas ------------- */

export default () => [
  ...PlanAPITypesToSagas,
  ...DomainAPITypesToSagas,
  ...CryptoAPITypesToSagas,

  // saga bindings
  ...UserEmailSagaBindings,
  ...MailboxSagaBindings,

  // Startup
  takeLatest(StartupTypes.STARTUP, startup),

  /* ------------- Auth ------------- */

  // Login
  takeLatest(UserTypes.LOGIN_REQUEST, userSagas.login),
  takeLatest(UserTypes.REFRESH_PROFILE_REQUEST, userSagas.refreshProfileRequest),

  // Signup
  takeLatest(UserTypes.SIGNUP_REQUEST, userSagas.signup),

  // Username & email validation
  takeLatest(UserTypes.USERNAME_CHECK_REQUEST, userSagas.checkUsername),
  takeLatest(UserTypes.EMAIL_CHECK_REQUEST, userSagas.checkEmail),
  takeLatest(UserTypes.EMAIL_CHECK_FOR_ESP_REQUEST, userSagas.checkEmailForESP),
  takeLatest(UserTypes.EMAIL_CHECK_FOR_IDENTITY, userSagas.checkEmailForIdentity),

  // Forgot username
  takeLatest(UserTypes.FORGOT_USERNAME_REQUEST, userSagas.forgotUsername),

  // Password Reset
  takeLatest(UserTypes.PASSWORD_RESET_REQUEST, userSagas.requestPasswordReset),
  takeLatest(UserTypes.PASSWORD_RESET_REQUEST_REQUEST, userSagas.requestPasswordResetRequest),

  // Logout
  takeLatest(UserTypes.LOGOUT_REQUEST, userSagas.logoutRequest),

  /* ------------- User Account ------------- */

  takeLatest(UserTypes.UPDATE_ACCOUNT_REQUEST, userSagas.updateUserAccount),

  takeLatest(UserTypes.UPDATE_IDENTITY_SETTINGS_REQUEST, userSagas.updateIdentitySettings),

  /* ------------- Dashboard ------------- */

  takeLatest(DashboardTypes.DASHBOARD_DATA_REQUEST, dashboardSagas.fetchDashboardData),

  /* ------------- Contacts ------------- */

  ...ContactSagaBindings,

  /* ------------- Payment ------------- */
  takeLatest(PaymentTypes.PAYMENT_REQUEST, paymentSagas.fetch),
  takeLatest(PaymentTypes.PAYMENT_CREATE, paymentSagas.create),
  takeLatest(PaymentTypes.PAYMENT_REMOVE, paymentSagas.remove),
  takeLatest(PaymentTypes.PAYMENT_EDIT, paymentSagas.edit),

  /* ------------- Payment History -------------- */
  takeLatest(
    [
      PaymentHistoryTypes.PAYMENT_HISTORY_FETCH,
      PaymentHistoryTypes.PAYMENT_HISTORY_SET_SEARCH_QUERY
    ],
    paymentHistorySagas.fetch
  ),

  /* ------------- Identities ------------- */

  ...IdentitySagaBindings,

  /* ------------- User owned Domains ------------- */
  takeLatest(
    [
      DomainTypes.DOMAIN_FETCH,
      DomainTypes.DOMAIN_SET_SEARCH_QUERY,
      DomainTypes.DOMAIN_SET_SORT_ORDER,
      DomainTypes.DOMAIN_SET_IS_ACTIVE_FILTER
    ],
    domainSagas.fetch
  ),
  takeLatest(DomainTypes.DOMAIN_CREATE, domainSagas.create),
  takeLatest(DomainTypes.DOMAIN_EDIT, domainSagas.edit),
  takeLatest(DomainTypes.DOMAIN_REMOVE, domainSagas.remove),
  takeLatest(DomainTypes.DOMAIN_REQUEST_WHOIS, domainSagas.requestWhois),
  takeLatest(DomainTypes.DOMAIN_VALIDATE, domainSagas.validate),

  /* --------------- Purchased domains ------------- */
  takeLatest(DomainTypes.DOMAIN_TLD, domainSagas.tlds),
  takeLatest(DomainTypes.DOMAIN_SUGGESTIONS, domainSagas.suggest),
  takeLatest(DomainTypes.DOMAIN_PURCHASE_AVAILABLE, domainSagas.purchaseAvailable),
  takeLatest(DomainTypes.DOMAIN_PURCHASE, domainSagas.purchase),

  /*
    takeLatest(DomainTypes.CREATE_DOMAIN_REQUEST, domainSagas.createDomain),
    takeLatest(DomainTypes.DOMAIN_DETAIL_REQUEST, domainSagas.fetchDomainDetail),
    takeLatest(DomainTypes.DOMAIN_VALIDATION_REQUEST, domainSagas.fetchDomainValidation),
    takeLatest(DomainTypes.DELETE_DOMAIN_REQUEST, domainSagas.deleteDomain),
    takeLatest(DomainTypes.UPDATE_DOMAIN_REQUEST, domainSagas.updateDomain),
    */

  /* ------------- Mailbox-associated Domains ------------- */
  takeLatest(
    [
      MailboxDomainTypes.MAILBOX_DOMAIN_FETCH,
      MailboxDomainTypes.MAILBOX_DOMAIN_SET_SEARCH_QUERY
    ],
    mailboxDomainSagas.fetch
  ),

  /* ------------- Misc ------------- */

  takeLatest(RegionTypes.ALL_REGIONS_REQUEST, regionSagas.fetchAllRegions),

  /* ------------- Notification ------------- */

  takeLatest(NotificationTypes.DISPLAY_NOTIFICATION, handleNotificationTimeout),

  /* ------------- Account History -------------- */
  takeLatest(
    [
      AccountHistoryTypes.ACCOUNTHISTORY_FETCH,
      AccountHistoryTypes.ACCOUNTHISTORY_SET_SEARCH_QUERY
    ],
    accountHistorySagas.fetch
  ),

  /* ------------- Plan ---------------- */
  takeLatest(PlanTypes.upgradePlanSuccess, planSagas.upgradePlanSuccess),
  takeLatest(PlanTypes.upgradePlanError, planSagas.upgradePlanError),

  /* ------------- Chat ---------------- */
  ...ChatSagaBindings,

  ...WebSocketSagaBindings,
  ...WebRTCSagaBindings,

  /* ------------- Call History ------------- */
  ...callHistorySagaBindings,

  /* ------------- Crypto ------------- */
  takeLatest(CryptoTypes.CRYPTO_GET_KEY, cryptoSagas.getKey),
  takeLatest(CryptoTypes.CRYPTO_USER_EMAIL_SMIME, cryptoSagas.userEmailSmime)
]
