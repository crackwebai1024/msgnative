import FCM from 'react-native-fcm'
import { PermissionsAndroid, Alert } from 'react-native'
import BFService from 'modules/BackgroundToForegroundService'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/native/Snackbar'
/**
 * Registers for push notification and resolves with token.
 *
 * @returns {Promise}
 */
export function registerForNotification () {
  return FCM.getFCMToken()
}

/**
 * Registers for push kit token and resolves with token.
 *
 * @returns {Promise}
 */
export function registerForPushKit () {

}

export function * checkPermission (permission, title, message) {
  try {
    const granted = yield PermissionsAndroid.request(
      permission,
      {
        title,
        message
      }
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
  } catch (err) {
    console.warn(err)
  }
}

export function * alertOverlayPermission () {
  const title = yield formatMessage(m.incomingCalls)
  const message = yield formatMessage(m.drawOverAppsPermission)
  const text = yield formatMessage(m.goToSettings)
  Alert.alert(
    title, message,
    [
      { text,
        onPress: () => {
          BFService.requestOverlayPermission()
        }
      }
    ],
    { cancelable: false }
  )
}

export function * checkPermissions () {
  const title = yield formatMessage(m.permissionPromptTitle)
  const recordPermissionText = yield formatMessage(m.recordPermissionText)
  const cameraPermissionText = yield formatMessage(m.cameraPermissionText)
  const readContactsPermissionText = yield formatMessage(m.readContactsPermissionText)
  const readExtStoragePermissionText = yield formatMessage(m.readExtStoragePermissionText)
  const writeExtStoragePermissionText = yield formatMessage(m.writeExtStoragePermissionText)
  // const readCallLogPermissionText = yield formatMessage(m.readCallLogPermissionText)
  // const writeCallLogPermissionText = yield formatMessage(m.writeCallLogPermissionText)

  const micPermission = yield checkPermission(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, title, recordPermissionText)
  const cameraPermission = yield checkPermission(PermissionsAndroid.PERMISSIONS.CAMERA, title, cameraPermissionText)
  yield checkPermission(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, title, readContactsPermissionText)
  yield checkPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, title, readExtStoragePermissionText)
  yield checkPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, title, writeExtStoragePermissionText)
  // yield checkPermission(PermissionsAndroid.PERMISSIONS.READ_CALL_LOG, title, readCallLogPermissionText)
  // yield checkPermission(PermissionsAndroid.PERMISSIONS.WRITE_CALL_LOG, title, writeCallLogPermissionText)
  const isOverlayAvailable = yield BFService.isOverlayAvailable()
  if (!isOverlayAvailable) {
    yield alertOverlayPermission()
  }
  return { mic: micPermission, camera: cameraPermission }
}
