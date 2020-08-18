import { delay } from 'redux-saga'
import { Platform, AsyncStorage } from 'react-native'
import { put, call, select, spawn, fork, take, race, cancel } from 'redux-saga/effects'
import { NavigationActions, StackActions } from 'react-navigation'
import * as Keychain from 'react-native-keychain'
import { path } from 'ramda'
import SharedPreferences from 'react-native-shared-preferences'
import BackgroundTimer from 'react-native-background-timer'
import AppActions from 'commons/Redux/AppRedux'
import UserActions, { UserTypes } from 'commons/Redux/UserRedux'
import DeviceContactActions from 'app/Redux/DeviceContactRedux'
import { isLoggedIn } from 'commons/Selectors/User'
import { callAPI } from 'commons/Sagas/APISagas'
import { bugsnag } from '../Services/Bugsnag'
import { getCurrentRouteName } from 'app/Navigation/utils'
import OverlayActions, { OverlayIdentifiers } from 'app/Redux/OverlayRedux'
import { permissionsInitiator } from './StartupSagas'
// import { createNotificationChannel } from './PushSagas'
/**
 * Refreshes user by calling /users endpoint
 * and updating it in redux store
 */
export function * refreshUser () {
  try {
    const user = yield select(s => s.user)
    if (!isLoggedIn(user)) return
    const response = yield callAPI('UserProfile')

    yield put(UserActions.updateUser(response.data))
    return response.data
  } catch (e) {
    if (e.status === 404 || e.status === 401) {
      yield put(UserActions.logoutRequest())
    } else {
      yield put(AppActions.setNetworkState(false))
    }
  }
}

const resetKeychain = function () {
  return Keychain.resetGenericPassword()
    .then(() => console.info('Keychain: resetGenericPassword complete'))
    .catch(e => console.info('Keychain: resetGenericPassword error - ', e))
}

const setKeychain = function (username, data) {
  if (!username || !data) return

  if (typeof data === 'object') {
    data = JSON.stringify(data)
  }

  return Keychain.setGenericPassword(username, data)
    .then(() => console.info('Keychain: setGenericPassword complete'))
    .catch(e => console.info(`Keychain: setGenericPassword failed err=${e}`))
}

export function * checkOnboardingStateAndRedirect (userData) {
  // const espCount = path(['totals', 'num_esp'], userData)
  // if (!espCount) {
  //   yield put(NavigationActions.navigate({ routeName: 'SignupESPImported'}))
  //   return
  // }

  const identityCount = path(['totals', 'num_identity'], userData)
  if (!identityCount) {
    yield put(NavigationActions.navigate({ routeName: 'SignupIdentity' }))
    return
  }

  const isLaunchedFromNotificationTray = yield select(s => s.app.isLaunchedFromNotificationTray)
  if (isLaunchedFromNotificationTray) return

  const currentRouteName = yield select(s => getCurrentRouteName(s.nav))
  // If logging in from the Login screen, just navigate to UserArea
  if (currentRouteName === 'Login') {
    yield put(NavigationActions.navigate({ routeName: 'UserArea' }))
  // Else if already logged in, start with stack reset to prevent GPU munching on Android
  } else if (currentRouteName !== 'VideoChat') {
    yield put(StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({ routeName: 'UserArea' })]
    }))
  }

  const hasLoggedInOnNative = Platform.OS === 'ios' ? userData.has_logged_in_ios : userData.has_logged_in_android
  // if (!hasLoggedInOnNative && userData.total_identities > 0) {
  if (!hasLoggedInOnNative) {
    yield put(OverlayActions.showOverlay(OverlayIdentifiers.EDUCATION))
  }

  yield put(AppActions.readyForSync())

  // fetch device contacts if:
  // the platform is `android`, or
  // `global.permissionsInitiate` is set to true. This condition is only for ios in the scenario when user logs in / out more than once in a single app launch.
  if (Platform.OS === 'android' || global.permissionsInitiated) {
    yield put(DeviceContactActions.deviceContactFetch())
  }
}

export function * connectionTimeout ({ timeout }) {
  yield put(AppActions.setConnectionTimeout(false))
  yield delay(timeout)
  yield put(AppActions.setConnectionTimeout(true))
}

export function * signupSuccess ({ sync = true }) {
  if (Platform.OS === 'android') {
    // Set logged_in state so that native java code can know about user's logged in state
    SharedPreferences.setItem('logged_in', '1')
  }

  yield put(AppActions.setIsLaunchedFromNotificationTray(false))

  const data = yield select(s => s.user.data)
  // yield call(setKeychain, data.username, {
  //   access_id: data.access_id,
  //   secret_token: data.secret_token
  // })
  if (sync) {
    yield put(AppActions.readyForSync())
  }
  bugsnag.setUser(data.username, data.display_name, data.default_esp || '')
  yield spawn(connectionTimeout, { timeout: 40000 })
}

export function * loginSuccess ({ data }) {
  if (Platform.OS === 'android') {
    // Set logged_in state so that native java code can know about user's logged in state
    SharedPreferences.setItem('logged_in', '1')
  }

  if (Platform.OS === 'ios') {
    BackgroundTimer.start()
  }
  yield signupSuccess({ sync: false })
  yield checkOnboardingStateAndRedirect(data)
}

export function * loginError () {
  // yield call(resetKeychain)
}

/**
 * periodically dispatches `ensureDataCleanUpOnLogout` action. Various redux can listen for it and do data cleanup after logout.//#endregion
 * USE CASE – synced data is saved in redux after `UserTypes.LOGOUT` action – which might case inconsistency in next session
 * dispatches `ensureDataCleanUpOnLogout` four times – at interval of – 5secs, 10secs, 20secs and 40secs respectively
 */
export function * ensureDataCleanUpOnLogout () {
  let currentDelay = 5000
  while (true) {
    const { d } = yield race({
      d: delay(currentDelay),
      login: take(UserTypes.LOGIN_SUCCESS),
      signup: take(UserTypes.SIGNUP_SUCCESS)
    })
    if (!d) break
    yield put(AppActions.ensureDataCleanUpOnLogout())
    currentDelay *= 2

    if (currentDelay > 40000) break
  }
}

export function * logout () {
  try {
    if (Platform.OS === 'android') {
      SharedPreferences.clear()
    } else if (Platform.OS === 'ios') {
      // BackgroundTimer.stop()
      yield call(AsyncStorage.clear)
    }
  } catch (e) {}

  // yield call(resetKeychain)
  bugsnag.setUser('-1', '', '')
  yield put(NavigationActions.navigate({ routeName: 'Launch' }))
  yield delay(1500)
  yield put(StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Auth' })]
  }))
  yield put(AppActions.setConnectionTimeout(false))

  yield put(AppActions.setIsLaunchedFromNotificationTray(false))
  // spawn permissionsInitiator to dispatch `chatInit` action
  // after user again logins in/ signs up in the same app session
  yield spawn(permissionsInitiator)

  // swapn a process to ensure that data is cleaned up on logout
  yield fork(ensureDataCleanUpOnLogout)
}

// Used to save ringtone locally
export function * updateUser (action) {
  console.info('User profile updated:', action)

  const { video_call_ringtone: videoCallRingtone } = action.data
  if (Platform.OS === 'android') {
    SharedPreferences.setItem('video_call_ringtone', videoCallRingtone)
    // TODO: to change the notification sound
    // From Android 8.0, notification channels should be created again to change the notification sound
    // But sometimes notification is not working after creating it again, - needs to be fixed later
    // yield createNotificationChannel() // Create Notification Channel Again with the file name
  }
}
