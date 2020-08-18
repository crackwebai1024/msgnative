import { takeLatest } from 'redux-saga/effects'

import { AppTypes } from 'commons/Redux/AppRedux'
import { StartupTypes } from 'commons/Redux/StartupRedux'
import { UserTypes } from 'commons/Redux/UserRedux'
import { PushTypes } from 'commons/Redux/PushRedux'
import { MailboxTypes } from 'commons/Redux/MailboxRedux'
import { IdentityTypes } from 'commons/Redux/IdentityRedux'
import { ContactTypes } from 'commons/Redux/ContactRedux'
import { UserEmailTypes } from 'commons/Redux/UserEmailRedux'
import { refreshProfileRequest } from 'commons/Sagas/UserSagas'
import { DeviceContactTypes } from '../Redux/DeviceContactRedux'
import { FileTypes } from '../Redux/FileRedux'
// import { NavigationTypes } from '../Navigation'
import * as userSagas from './UserSagas'
import { pushInit } from './PushSagas'

import { startup, startupSuccess } from './StartupSagas'
import { mailboxTotalsUpdate, userTotalsUpdate } from './CounterSagas.js'
import { applyLocale, applyLocaleWithUserData, onBoardingComplete, checkNetworkState } from './AppSagas'
// import { clearFiltersSaga } from './FiltersSagas'
import { initKeyboard } from './KeyboardSagas'
import { shareFile } from './FileSagas'
import * as deviceContactSagas from './DeviceContactSagas'

import CallHistorySagaBindings from './CallHistorySagas/SagaBindings'
import ChatSagaBindings from './ChatSagas/SagaBindings'
import ContactSagaBindings from './ContactSagas/SagaBindings'
import CacheDBSagaBindings from './LocalDBSagas/SagaBindings'
import IdentitySagaBindings from './IdentitySagas/SagaBindings'
import UserEmailSagaBindings from './UserEmailSagas/SagaBindings'
import MailboxSagaBindings from './MailboxSagas/SagaBindings'

export default () => [
  takeLatest(AppTypes.APPLY_LOCALE, applyLocale),
  takeLatest([UserTypes.UPDATE_USER, UserTypes.UPDATE_ACCOUNT_SUCCESS], applyLocaleWithUserData),
  takeLatest([UserTypes.UPDATE_USER, UserTypes.UPDATE_ACCOUNT_SUCCESS], userSagas.updateUser),

  takeLatest(AppTypes.ON_BOARDING_COMPLETE, onBoardingComplete),
  takeLatest(AppTypes.CHECK_NETWORK_STATE, checkNetworkState),

  takeLatest(StartupTypes.STARTUP, startup),
  takeLatest(StartupTypes.STARTUP, initKeyboard),
  takeLatest(StartupTypes.STARTUP, startupSuccess),
  // takeLatest(StartupTypes.STARTUP_SUCCESS, startupSuccess),
  // TODO: callkit should be setup in the native side to process VOIP push in the native level
  //    takeLatest(UserTypes.UPDATE_USER, setupCallKit),
  takeLatest(UserTypes.LOGIN_SUCCESS, userSagas.loginSuccess),
  takeLatest(UserTypes.LOGIN_ERROR, userSagas.loginError),
  takeLatest(UserTypes.LOGOUT, userSagas.logout),

  takeLatest(UserTypes.SIGNUP_SUCCESS, userSagas.signupSuccess),

  takeLatest(PushTypes.PUSH_INIT, pushInit),

  // Update user.data.totals
  takeLatest([
    MailboxTypes.MAILBOX_SUCCESS,
    MailboxTypes.SEND_MAIL_SUCCESS,
    MailboxTypes.SEND_QUEUED_MAIL_SUCCESS,
    MailboxTypes.MAILBOX_READ_SUCCESS,
    MailboxTypes.MAILBOX_UNREAD_SUCCESS,
    MailboxTypes.MAILBOX_ARCHIVE_SUCCESS,
    MailboxTypes.MAILBOX_TRASH_SUCCESS,
    MailboxTypes.MAILBOX_DELETE_SUCCESS,
    MailboxTypes.MAILBOX_CLEAR_TRASH_SUCCESS,
    MailboxTypes.MAILBOX_SEND_QUEUED_SUCCESS
  ], mailboxTotalsUpdate),

  takeLatest([
    MailboxTypes.MAILBOX_SUCCESS,
    MailboxTypes.SEND_MAIL_SUCCESS,
    MailboxTypes.SEND_QUEUED_MAIL_SUCCESS,
    MailboxTypes.MAILBOX_DELETE_SUCCESS,
    MailboxTypes.MAILBOX_DELETE_SELECTED_SUCCESS,
    MailboxTypes.MAILBOX_CLEAR_TRASH_SUCCESS,
    MailboxTypes.MAILBOX_SEND_QUEUED_SUCCESS,
    IdentityTypes.IDENTITY_CREATE_SUCCESS,
    IdentityTypes.IDENTITY_REMOVE_SUCCESS,
    ContactTypes.CONTACT_CREATE_SUCCESS,
    ContactTypes.CONTACT_REMOVE_SUCCESS,
    UserEmailTypes.USEREMAIL_CREATE_SUCCESS,
    UserEmailTypes.USEREMAIL_REMOVE_SUCCESS
  ], userTotalsUpdate),

  // Account current totals
  takeLatest([
    IdentityTypes.IDENTITY_CREATE_SUCCESS,
    IdentityTypes.IDENTITY_REMOVE_SUCCESS,
    ContactTypes.CONTACT_CREATE_SUCCESS,
    ContactTypes.CONTACT_REMOVE_SUCCESS,
    UserEmailTypes.USEREMAIL_CREATE_SUCCESS,
    UserEmailTypes.USEREMAIL_REMOVE_SUCCESS
  ], refreshProfileRequest),

  // clear the filter texts when user navigates
  // out of the list screens
  // takeLatest([NavigationTypes.NAVIGATE, NavigationTypes.BACK], clearFiltersSaga),

  takeLatest(FileTypes.SHARE_FILE, shareFile),

  takeLatest([
    DeviceContactTypes.DEVICE_CONTACT_FETCH,
    DeviceContactTypes.DEVICE_CONTACT_SET_SEARCH_QUERY
  ], deviceContactSagas.fetch),

  ...CallHistorySagaBindings,
  ...ChatSagaBindings,
  ...ContactSagaBindings,
  ...IdentitySagaBindings,
  ...UserEmailSagaBindings,
  ...MailboxSagaBindings,
  ...CacheDBSagaBindings
]
