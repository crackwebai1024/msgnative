import { call, select } from 'redux-saga/effects'
import { DeviceEventEmitter } from 'react-native'
import { path } from 'ramda'

// import { getAnEmailAvatar } from 'commons/Sagas/AvatarSagas'

import BFService from 'modules/BackgroundToForegroundService'

// const INBOUND_CALL_TIMEOUT_MS = 30000

// const isScreenLockedPromisified = () => new Promise((resolve, reject) => BFService.isScreenLocked(x => x ? resolve() : reject()))

function createColdCallAcceptChannel () {
  return new Promise((resolve, reject) => {
    let cleanUp
    const listener = (event) => {
      resolve({
        answer: event.response === 'ACCEPT_CALL_ANDROID',
        reject: event.response === 'REJECT_CALL_ANDROID',
        timeout: event.response === 'TIMEOUT_CALL_ANDROID'
      })
      cleanUp()
    }

    cleanUp = () => {
      DeviceEventEmitter.removeListener('COLD_LAUNCH_RESPONSE', listener)
    }

    DeviceEventEmitter.addListener('COLD_LAUNCH_RESPONSE', listener)
  })
}

function createCallAcceptChannel () {
  return new Promise((resolve, reject) => {
    const cleanUp = () => {
      DeviceEventEmitter.removeListener(BFService.ACCEPT_CALL_ANDROID, accept)
      DeviceEventEmitter.removeListener(BFService.REJECT_CALL_ANDROID, decline)
    }

    const accept = () => {
      cleanUp()
      resolve(true)
    }

    const decline = (resp) => {
      cleanUp()
      if (resp && resp.NO_OVERLAY_PERMISSION_CALL_ANDROID) {
        resolve('NO_OVERLAY_PERMISSION_CALL_ANDROID')
      } else {
        resolve(false)
      }
    }
    // Timeout
    setTimeout(() => {
      resolve('timeout')
    }, 60 * 1000)

    DeviceEventEmitter.addListener(BFService.ACCEPT_CALL_ANDROID, accept)
    DeviceEventEmitter.addListener(BFService.REJECT_CALL_ANDROID, decline)
  })
}

export function * showPlatformInboundCallUI (data, isVideo, isColdLaunch = false) {
  console.info('showPlatformInboundCallUI: entered')

  if (isColdLaunch) {
    console.info('showPlatformInboundCallUI: isColdLaunch - true')
    // Inbound Screen already shown
    // Check global.COLD_LAUNCH_RESPONSE
    if (global.COLD_LAUNCH_RESPONSE) {
      return {
        answer: global.COLD_LAUNCH_RESPONSE === 'ACCEPT_CALL_ANDROID',
        reject: global.COLD_LAUNCH_RESPONSE === 'REJECT_CALL_ANDROID',
        timeout: global.COLD_LAUNCH_RESPONSE === 'TIMEOUT_CALL_ANDROID',
        overlay_permission_error: global.COLD_LAUNCH_RESPONSE === 'NO_OVERLAY_PERMISSION_CALL_ANDROID'
      }
    }

    const result = yield call(createColdCallAcceptChannel)
    console.info('showPlatformInboundCallUI: createColdCallAcceptChannel result - ', result)
    return result
  }

  // ** We are no longer using base64 encoding image
  // let callerAvatar = yield call(getAnEmailAvatar, data.from_email)
  // let calleeAvatar = yield call(getAnEmailAvatar, data.to_email)
  // TODO: the last parameter must be specified - ring tone sound ( any file name in BackgroundToForegroundService/android/src/main/assets/sounds )
  // "" if you don't want to play

  const ringtone = yield select(s => path(['user', 'data', 'video_call_ringtone'], s))

  console.info('showPlatformInboundCallUI: calling BFService.showIncomingCall')
  BFService.showIncomingCall(data.from_email, '', data.to_email, '', isVideo, ringtone || 'classic.mp3')

  const result = yield call(createCallAcceptChannel)
  console.info('showPlatformInboundCallUI: BFService.showIncomingCall result - ', result)
  return {
    answer: result === true,
    reject: result === false,
    timeout: result === 'timeout',
    overlay_permission_error: result === 'NO_OVERLAY_PERMISSION_CALL_ANDROID'
  }
}

// Not in use anymore;  READ_CALL_LOG and WRITE_CALL_LOG not permitted anymore
// See https://support.google.com/googleplay/android-developer/answer/9047303

// export function * registerCallLog (data) {
//   const { localCallId, isOutboundCall, contactEmail } = data

//   if (!localCallId) {
//     console.log(`registerCallLog: trying to log invalid call - `, data)
//     return
//   }

//   const start = data.startTime
//   const end = data.endTime || new Date()

//   if (!isOutboundCall) {
//     if (start) {
//       BFService.addIncomingCallLogAt(contactEmail, (end - start) / 1000, start.getTime())
//     } else {
//       BFService.addIncomingCallLogAt(contactEmail, 0, end.getTime())
//     }
//   } else {
//     if (start) {
//       BFService.addOutgoingCallLogAt(contactEmail, (end - start) / 1000, start.getTime())
//     } else {
//       BFService.addOutgoingCallLogAt(contactEmail, 0, end.getTime())
//     }
//   }
// }
