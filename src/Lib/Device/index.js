import { Dimensions, AlertIOS, Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import OpenSettings from 'react-native-open-settings'
import Permissions from 'react-native-permissions'
import BackgroundTimer from 'react-native-background-timer'

import { registerForNotification, registerForPushKit } from './Platform'

const SystemNameToDeviceType = {
  iOS: 1,
  Android: 2
}

const NO_CAMERA_MIC_TITLE = '"MsgSafe.io" does not have access to your camera or mic'
const NO_CAMERA_MIC_SUBTITLE = 'To make and receive calls, enable camera and mic access in device settings'

/**
 * Returns device info object.
 *
 * @returns {Object}
 */
export function getDeviceInfo () {
  const { width, height } = Dimensions.get('window')
  return {
    device_uuid: DeviceInfo.getUniqueID().toLowerCase(),
    device_type: SystemNameToDeviceType[DeviceInfo.getSystemName()],
    os_ver: DeviceInfo.getSystemVersion(),
    raw_agent: DeviceInfo.getUserAgent(),
    is_webrtc_supported: true,
    has_microphone: true,
    has_camera: true,
    display_height: parseInt(height),
    display_width: parseInt(width)
  }
}

export function getDeviceInfoForRedux () {
  const device = getDeviceInfo()

  return {
    ...device,
    isReactNative: true,
    os: Platform.OS,
    uuid: device.device_uuid,
    type: device.device_type
  }
}

/**
 * Extends getDeviceInfo and adds push and voip tokens.
 *
 * @returns {Promise}
 */
export async function getDeviceInfoWithToken () {
  let pushToken = ''
  let voipToken = ''

  try {
    pushToken = await registerForNotification()
    voipToken = await registerForPushKit()
  } catch (e) {
    console.error('getDeviceInfoWithToken - ', e)
  }

  return {
    ...getDeviceInfo(),
    push_token: pushToken,
    voip_token: voipToken
  }
}

export async function checkMicCamPermissions (micOnly = false) {
  const microphonePermission = await Permissions.check('microphone')
  if (micOnly) {
    return microphonePermission === 'authorized'
  }

  const cameraPermission = await Permissions.check('camera')
  return (cameraPermission === 'authorized' && microphonePermission === 'authorized')
}

export function showNoMicCamPermissionModal (missedCallEmail) {
  const subtitle = missedCallEmail ? `You just missed a call from ${missedCallEmail}. ${NO_CAMERA_MIC_SUBTITLE}` : NO_CAMERA_MIC_SUBTITLE

  AlertIOS.alert(
    NO_CAMERA_MIC_TITLE,
    subtitle,
    [
      { text: 'Cancel' },
      { text: 'Settings', onPress: () => OpenSettings.openSettings(), style: 'cancel' }
    ]
  )
}

export function delay (ms) {
  return new Promise(resolve => {
    // Start a timer that runs once after X milliseconds
    BackgroundTimer.setTimeout(() => {
      resolve(ms)
    }, ms)
  })
}

export { checkPermissions, alertOverlayPermission } from './Platform'
