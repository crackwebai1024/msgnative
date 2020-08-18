import { delay } from 'redux-saga'
import { put, call, select, spawn, take } from 'redux-saga/effects'
import { NavigationActions, StackActions } from 'react-navigation'
import RNFS from 'react-native-fs'
import { Platform } from 'react-native'

import { callAPI } from 'commons/Sagas/APISagas'
import ChatActions from 'commons/Redux/ChatRedux'
import MailboxActions from 'commons/Redux/MailboxRedux'
import PushActions from 'commons/Redux/PushRedux'
import DeviceActions from 'commons/Redux/DeviceRedux'
import UserActions, { UserTypes } from 'commons/Redux/UserRedux'

import { OverlayIdentifiers } from 'app/Redux/OverlayRedux'

import { DOCS_DIRECTORY_PATH, TEMP_DOCS_DIRECTORY_PATH } from '../Lib/FS'
import { checkPermissions } from '../Lib/Device'
import { checkOnboardingStateAndRedirect, connectionTimeout, ensureDataCleanUpOnLogout } from './UserSagas'
import { initDatabase } from './LocalDBSagas'
import { areNativePermissionsAvailable } from './ChatSagas'
import { listenAndToggleOSSpeaker } from './ChatSagas/MediaToggle'
import { trackAppStateChange, trackNetworkStateChange, trackNetworkConnectionInfoChange } from './AppSagas'
import AppActions from 'commons/Redux/AppRedux'

import { bugsnag } from '../Services/Bugsnag'
import { getKeyFromCache, USER_KEY, DRAWER_TOTALS_KEY } from './LocalDBSagas/KeyStorageSagas'

// set the environment header flag
// this makes all http requests include a `X-Msgsafe-IsNative` header
// so the server can tell if the request was made from ios/android app

export function * startup () {
  yield put(PushActions.pushInit())

  // create directories if not exists
  yield RNFS.mkdir(DOCS_DIRECTORY_PATH)
  yield RNFS.mkdir(TEMP_DOCS_DIRECTORY_PATH)

  yield spawn(permissionsInitiator)
  yield spawn(trackAppStateChange)
  yield spawn(trackNetworkStateChange)
  yield spawn(trackNetworkConnectionInfoChange)
  if (Platform.OS === 'ios') {
    yield spawn(listenAndToggleOSSpeaker)
  }
}

export function * startupSuccess () {
  console.log('startupSuccess: entered')

  yield call(initDatabase)

  // Check for cached user data
  let cachedUserData = yield call(getKeyFromCache, USER_KEY)
  console.log('startupSuccess: userData from cache - ', cachedUserData)

  // If there's no cached user data, send to auth screens
  if (!cachedUserData) {
    yield put(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Auth' })]
    }))
    yield put(AppActions.setIsLaunchedFromNotificationTray(false))
    yield spawn(ensureDataCleanUpOnLogout)
    return
  }

  const cachedDrawerTotals = yield call(getKeyFromCache, DRAWER_TOTALS_KEY)
  if (cachedDrawerTotals) {
    yield put(MailboxActions.drawerTotalsSuccess(cachedDrawerTotals))
  }
  // Update redux store with cached user data
  yield put(UserActions.updateUser(cachedUserData))

  // Check if device is online
  const isOnline = yield select(s => s.app.isNetworkOnline)
  console.log('startupSuccess: isOnline - ', isOnline)

  // If not online w/ cached user data, proceed to user screens
  if (!isOnline) {
    // Delay by 2s so that the "offline mode" splash screen is visible to user
    yield call(delay, 2000)
    yield call(checkOnboardingStateAndRedirect, cachedUserData)
    return
  }

  // If online, try to get the latest user data
  let freshUserData
  try {
    const response = yield callAPI('UserProfile')
    freshUserData = response.data
    bugsnag.setUser(freshUserData.username, freshUserData.display_name, freshUserData.default_esp || '')
    yield put(UserActions.updateUser(freshUserData))
  } catch (e) {
    if (e.status === 404 || e.status === 401) {
      // If 404, then credentials are invalid, dispatch logout action
      // and send user to auth screens
      yield put(UserActions.logoutRequest())
      yield put(StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Auth' })]
      }))
      return
    } else {
      // If non-404 response, set network to offline and send to user screens
      yield put(AppActions.setNetworkState(false))
    }
  }

  yield call(checkOnboardingStateAndRedirect, cachedUserData)

  yield spawn(connectionTimeout, { timeout: 40000 })
}

global.permissionsInitiated = false

export function * permissionsInitiator () {
  yield take(UserTypes.UPDATE_USER)
  yield put(ChatActions.chatInit())

  while (!global.permissionsInitiated) {
    const totalIdentities = yield select(s => s.user.data.total_identities || 0)
    const overlay = yield select(s => s.overlay)

    // there should be at least one identity
    if (totalIdentities < 1) {
      console.log('permissionsInitiator: no identities loaded...')
      // quirk: delay here doesn't work when connected to remote debugger
      // on android i.e. the call immediately resolves
      yield delay(1000)
      continue
    }

    // the education overlay should not be open
    if (overlay.open && overlay.identifier === OverlayIdentifiers.EDUCATION) {
      console.info('Education overlay Interrupt chatInit')
      yield delay(1000)
      continue
    }

    // all actions that trigger permissions
    // should go here
    if (Platform.OS === 'ios') {
      const audioVideoValidation = yield call(areNativePermissionsAvailable, { audio: true, video: true })
      if (!audioVideoValidation) {
        const audioValidation = yield call(areNativePermissionsAvailable, { audio: true, video: false })
        yield put(DeviceActions.updateMicVideoPermission(audioValidation, false))
      } else {
        yield put(DeviceActions.updateMicVideoPermission(true, true))
      }
      yield call(checkPermissions)
    } else {
      const micCamPermission = yield call(checkPermissions)
      if (micCamPermission) {
        yield put(DeviceActions.updateMicVideoPermission(micCamPermission.mic, micCamPermission.camera))
      }
    }
    global.permissionsInitiated = true // permissions initiated
  }
}
