import NotificationsIOS from 'react-native-notifications'
import DeviceContactActions from 'app/Redux/DeviceContactRedux'
import { call, put } from 'redux-saga/effects'
import { contactsPermissionRequest } from 'app/Sagas/DeviceContactSagas/Permission'

/**
 * Registers for push notification and resolves with token.
 *
 * @returns {Promise}
 */
export function registerForNotification () {
  return new Promise((resolve, reject) => {
    NotificationsIOS.addEventListener('remoteNotificationsRegistered', token => resolve(token))
    NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', e => reject(e))
    if (global.permissionsInitiated) {
      NotificationsIOS.requestPermissions()
    }
    // Clear IOS badge count
    NotificationsIOS.setBadgesCount(0)
  })
}

/**
 * Registers for push kit token and resolves with token.
 *
 * @returns {Promise}
 */
export function registerForPushKit () {
  return new Promise((resolve, reject) => {
    const callback = (token) => {
      console.info('pushKitRegistered - token:', token)
      // Remove callback
      NotificationsIOS.removeEventListener('pushKitRegistered', callback)
      resolve(token)
    }
    NotificationsIOS.addEventListener('pushKitRegistered', callback)
    NotificationsIOS.registerPushKit()
  })
}

export function * checkPermissions () {
  yield call(contactsPermissionRequest)
  yield put(DeviceContactActions.deviceContactFetch('startup'))

  yield call([NotificationsIOS, NotificationsIOS.requestPermissions])
  return true
}

export function * alertOverlayPermission () {}
