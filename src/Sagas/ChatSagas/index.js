import { Platform, Vibration, AsyncStorage, AppState } from 'react-native'

import { put, take, call, select, spawn, race, fork, cancel, cancelled } from 'redux-saga/effects'
import RNCallKit from 'react-native-callkit'
import { NavigationActions, StackActions } from 'react-navigation'
import uuid from 'uuid'
import Sound from 'react-native-sound'
import { path, isEmpty } from 'ramda'
import SharedPreferences from 'react-native-shared-preferences'
import BackgroudTimer from 'react-native-background-timer'

import { isLoggedIn } from 'commons/Selectors/User'
import { chatAPI } from 'commons/Sagas/ChatSagas'
import { setupWebRTCForInbound } from 'commons/Sagas/WebrtcSagas/Inbound'
import { setupWebRTCForOutbound } from 'commons/Sagas/WebrtcSagas/Outbound'
import { reportCallEndToServer } from 'commons/Sagas/WebrtcSagas/Setup'
import ChatActions, { ChatTypes, MESSAGE_STATUS } from 'commons/Redux/ChatRedux'
import WebrtcActions, { WebrtcTypes, CALL_END_REASON } from 'commons/Redux/WebrtcRedux'
import { IdentityTypes } from 'commons/Redux/IdentityRedux'
import { UserTypes } from 'commons/Redux/UserRedux'
import { uuidv1ToDate } from 'commons/Lib/Utils'
import { getActiveChatRoomId } from 'app/Lib/Chat'
import { OverlayIdentifiers } from 'app/Redux/OverlayRedux'
import { getCurrentRoute, getCurrentRouteName } from 'app/Navigation/utils'
import { getNativeUserMedia, getNativeConstraints } from 'app/Lib/WebRTC'
import { checkMicCamPermissions, showNoMicCamPermissionModal, delay, alertOverlayPermission } from 'app/Lib/Device'
import { createSound, getSystemVolume } from 'app/Lib/Audio'
import { getItem } from 'app/Lib/SharedPreferences'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/'
import NotificationActions from 'commons/Redux/NotificationRedux'

import {
  showPlatformInboundCallUI,
  createDidActivateAudioSessionChannel,
  createDidReceiveStartCallActionCallKitChannel,
  listenForEndCallAction // Only for iOS
} from './Platform'

import { showLocalNotification } from 'app/Sagas/PushSagas/Notifications'

import BFService from 'modules/BackgroundToForegroundService'

import { listenAndToggleSpeaker } from './MediaToggle'
export { setupCallKit, videoChatRingerDaemon } from './Sound'

// Note -
// localCallId => only using it for outbound, so that we have a uuid to
// launch CallKit with before the server has the chance to hand us over the real uuid

export function * areNativePermissionsAvailable (media) {
  try {
    const constraints = yield call(getNativeConstraints, media)
    const stream = yield call(getNativeUserMedia, constraints)
    stream.release()
    return true
  } catch (e) {
    return false
  }
}

export function * chatInit () {
  if (Platform.OS !== 'ios') return

  const channel = yield call(createDidReceiveStartCallActionCallKitChannel)

  while (true) {
    console.info('waiting for didReceiveStartCallAction...')
    const data = yield take(channel)
    if (!data.handle) continue

    const parsed = data.handle.match(/(Outgoing|Incoming):\s(\S+@\S+\.\S+)\s=>\s(\S+@\S+\.\S+)/)
    // FIXME: magic number
    if (parsed.length !== 4) continue
    if (parsed[1] === 'Incoming') {
      yield put(WebrtcActions.makeOutboundVideoCallOffer(parsed[3], parsed[2]))
    } else if (parsed[1] === 'Outgoing') {
      yield put(WebrtcActions.makeOutboundVideoCallOffer(parsed[2], parsed[3]))
    } else {
      console.info('didReceiveStartCallAction: unable to perform any action;  data - ', data)
    }
  }
}

function * sendPlainOrEncryptedPayloadIfAuthenticated (payload) {
  if (chatAPI.handshakeStarted) {
    return yield call([chatAPI, chatAPI.sendRequest], payload)
  } else {
    if (chatAPI._socketState !== 1) {
      yield take(ChatTypes.CHAT_SOCKET_CONNECTING_STARTED)
    }
    return yield call([chatAPI, chatAPI.sendRawPayload], payload)
  }
}

export function * inboundVideoCallOfferReceived ({ data, isColdLaunch }) {
  console.log('inboundVideoCallOfferReceived - ', yield select(s => s.webrtc))
  const callAlreadyInProgress = yield select(s => s.webrtc.inProgress)
  if (callAlreadyInProgress) {
    if (!data || !data.call_id) return

    yield call(reportCallEndToServer, data.call_id, CALL_END_REASON.USER_BUSY)
    return
  }

  yield fork(sendPlainOrEncryptedPayloadIfAuthenticated, {
    cmd: '/webrtc/ack',
    args: {
      call_id: data.call_id
    }
  })

  const { call_id, to_email } = data
  // let identities = yield select(s => s.identity.data || {})

  // if (isEmpty(identities)) {
  //   const newIdentities = yield take(IdentityTypes.IDENTITY_SUCCESS)
  //   identities = newIdentities.data.identities || []
  // }

  // let isValid = false
  // // Check if valid identity
  // for (const key in identities) {
  //   if (identities[key] && identities[key].email === to_email) {
  //     isValid = true
  //     break
  //   }
  // }

  // console.info('inboundVideoCallOfferReceived: isValid - ', isValid)

  // // Invalid Call to_email is different
  // if (!isValid) {
  //   console.info('Invalid to_email Identitiy: ', to_email, 'My Identities:', identities)
  //   return
  // }

  // Check if old call
  if (Platform.OS === 'android') {
    const prevCall = yield getItem(call_id)
    if (prevCall) { // Registered in the shared pref
      return
    } else {
      SharedPreferences.setItem(call_id, '1')
    }
  } else if (Platform.OS === 'iOS') {
    const prevCall = yield AsyncStorage.getItem(call_id)
    if (prevCall) { // Registered in the shared pref
      return
    } else {
      yield AsyncStorage.setItem(call_id, '1')
    }
  }

  console.info('inboundVideoCallOfferReceived: data -', data)
  // console.info('displayIncomingCall for uuid - ', data.call_id)

  if (data.is_expired) {
    console.info('inboundVideoCallOfferReceived: expired call')
    yield put(WebrtcActions.endVideoCall(CALL_END_REASON.CALL_INVALID))
    return
  }

  const currentTime = new Date()

  // Remove local
  // // We should always inspect the callId (timeuuid)
  // // If there's a big discrepancy, it could be the local clock,
  // // but it'd be worth issuing a webrtc/peek to verify the call isnt expired.
  const callInitiatedMSAgo = currentTime - uuidv1ToDate(data.call_id)
  console.info('inboundVideoCallOfferReceived: callInitiatedMSAgo - ', callInitiatedMSAgo)
  // 3 minutes - 2 for clients, 1 for ntp offesets
  if (callInitiatedMSAgo > 120000) {
    console.info('inboundVideoCallOfferReceived: received stale call...')
    yield call(hideIncomingCallUI, { callId: data.call_id })
    return
  }

  // This call is valid
  yield put(WebrtcActions.setVideoCallLocalId(data.call_id))
  yield put(WebrtcActions.setValidInboundVideoCallOffer(data, isColdLaunch))

  let callData = data

  // Race for inbound call UI response and call end
  // as the caller can end the call before user responds
  const raceResult = yield race({
    response: call(showPlatformInboundCallUI, data, !data.is_audio_only, isColdLaunch),
    ended: take(WebrtcTypes.END_VIDEO_CALL)
  })

  if (raceResult.ended) {
    console.log('inboundVideoCallOfferReceived: call ended before callee responded')
    return
  }

  const response = raceResult.response
  console.info('inboundVideoCallOfferReceived: showPlatformInboundCallUI response - ', response)
  if (response.timeout) {
    yield call(hideIncomingCallUI, { callId: data.call_id })

    // Send webrtc reject w/out calling endCall
    //
    // We should only do this if we are the only device/last device registered to receive offer.
    yield put(WebrtcActions.endVideoCall(CALL_END_REASON.TIMEOUT))
  } else if (response.answer) {
    // When user accepts call on iOS lock screen, the app doesn't have the chance to come
    // to foreground and socket isn't opened.  The following lines makes sure that socket is
    // re-connected in this case.
    const socketPresent = yield select(s => s.chat.socketConnected || s.chat.socketConnecting)
    if (AppState.currentState === 'background' && !socketPresent && chatAPI._manuallyClosed) {
      yield put(ChatActions.chatReconnect())
    }

    console.log('showPlatformInboundCallUI: navigating to VideoChat route')
    yield put(NavigationActions.navigate({ routeName: 'VideoChat' }))

    // If sdp_offer does not exist
    if (!data.sdp_offer) {
      // Try to get WebRTC offer by socket API
      try {
        if (chatAPI.handshakeStarted) {
          callData = yield call([chatAPI, chatAPI.sendRequest], {
            cmd: '/webrtc/offer/get',
            args: {
              call_id: data.call_id
            }
          })
        } else {
          if (chatAPI._socketState !== 1) {
            yield take(ChatTypes.CHAT_SOCKET_CONNECTING_STARTED)
          }
          callData = yield call([chatAPI, chatAPI.sendRawPayload], {
            cmd: '/webrtc/offer/get',
            args: {
              call_id: data.call_id
            }
          })
        }
        yield put(WebrtcActions.setInboundVideoCallOffer(callData))
      } catch (e) {
        console.info(e)
        yield put(WebrtcActions.endVideoCall(CALL_END_REASON.REJECTED))
      }
    }

    if (Platform.OS === 'android') {
      BFService.hideIncomingCall()
    } else if (Platform.OS === 'ios') {
      yield spawn(listenForEndCallAction, data.call_id)
    }

    const permission = yield call(checkMicCamPermissions)
    if (!permission) {
      console.info('showPlatformInboundCallUI: rejecting call, no permissions')
      showNoMicCamPermissionModal(data.from_email)
      yield put(WebrtcActions.endVideoCall(CALL_END_REASON.REJECTED))
      return
    }

    if (isColdLaunch) { // In the cold launch delay 1 second more
      yield delay(1000)
    }

    yield spawn(listenAndToggleSpeaker)

    // Entry point for all local WebRTC resources setup
    yield spawn(setupWebRTCForInbound, callData)
  } else {
    yield put(WebrtcActions.endVideoCall(CALL_END_REASON.REJECTED))

    // Android cold launch reject because of no overlay permission
    if (response.overlay_permission_error) {
      yield alertOverlayPermission()
    } else { // User clicked reject button - exit app
      // BFService.exitApp()
    }
  }
}

function * _makeOutboundVideoCallOffer (
  identityEmail, contactEmail, contactDisplayName, audioOnly
) {
  // Send user to VideoChat and add a delay so that the transition is complete before
  // `WebRTCLib.getUserMedia` blocks the thread, when we call it to create the call stream
  yield put(NavigationActions.navigate({ routeName: 'VideoChat' }))
  yield delay(500)

  const permission = yield call(checkMicCamPermissions)
  if (!permission) {
    console.info('makeOutboundVideoCallOffer: cancelling call, no permissions')
    yield put(WebrtcActions.webrtcReset())
    yield put(NavigationActions.back())
    return
  }

  if (!chatAPI.ready) {
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  console.info('makeOutboundVideoCallOffer: audioOnly -', audioOnly)

  const localCallId = uuid()
  yield put(WebrtcActions.setVideoCallLocalId(localCallId))
  console.info('makeOutboundVideoCallOffer: localCallId - ', localCallId)

  if (Platform.OS === 'ios') {
    // TODO: show display name of contact instead of email when backend's ready
    RNCallKit.startCall(localCallId, `Outgoing: ${identityEmail} => ${contactEmail}`, 'generic', audioOnly, contactEmail)
    yield spawn(listenForEndCallAction, localCallId, true)
    console.info('CallKit - call started -', localCallId)
    const isAudioSetup = yield select(s => s.webrtc.iOSAudioSessionActivated)
    // TODO: should listen audio session deactivated event
    if (!isAudioSetup) {
      // Waiting for didActivateAudioSession event before we initialise WebRTC
      const channel = yield call(createDidActivateAudioSessionChannel)
      yield take(channel)
      yield put(WebrtcActions.setAudioSessionActivated(true))
    }
  }
  console.info('Audio Only:', audioOnly)
  // Set voice mode
  Sound.setMode(audioOnly ? 'VoiceChat' : 'VideoChat')
  // Turn on/off speaker
  yield put(WebrtcActions.setCallSpeakerEnabledState(!audioOnly))

  // Entry point for all local WebRTC resources setup
  yield fork(setupWebRTCForOutbound, identityEmail, contactEmail, audioOnly)

  // Start Outbound Ringer
  yield put(WebrtcActions.startRinger())

  // Watch speaker state change
  yield fork(listenAndToggleSpeaker)
}

export function * makeOutboundVideoCallOffer ({ identityEmail, contactEmail, contactDisplayName, audioOnly }) {
  const process = yield fork(_makeOutboundVideoCallOffer, identityEmail, contactEmail, contactDisplayName, audioOnly)
  yield take(WebrtcTypes.END_VIDEO_CALL)
  yield cancel(process)
}

export function * outboundVideoCallAnswerReceived () {
  const localCallId = yield select(s => s.webrtc.localCallId)

  console.info('outboundVideoCallAnswerReceived: localCallId is ', localCallId)
  if (localCallId) {
    console.info('outboundVideoCallAnswerReceived: calling reportConnectedOutgoingCallWithUUID - ', localCallId)
    RNCallKit.reportConnectedOutgoingCallWithUUID(localCallId)
  } else {
    console.error('CallKit - Invalid Outgoing call Connected!')
  }
}

// todo: clean
export function * hideIncomingCallUI ({ callId }) {
  console.info('hideIncomingCallUI: callId=', callId)

  // yield put(NavigationActions.back())
  if (Platform.OS === 'android') {
    BFService.hideIncomingCall()
  } else if (Platform.OS === 'ios') {
    yield call([RNCallKit, RNCallKit.endCall], callId)
  }
}

/*
  If user accepts the call on iOS with locked screen, the socket is connected
  even though the app is in background.  Once the call is over, the opened socket shouldub
  be disconnected as we do not want to keep sockets alive with app in background unless
  there's an active call.
*/
function * closeSocketOnCallEndIfAppInBackground () {
  console.info('closeSocketOnCallEndIfAppInBackground: entered...')
  const socketPresent = yield select(s => s.chat.socketConnected || s.chat.socketConnecting)
  console.info(`closeSocketOnCallEndIfAppInBackground: checking if socket close is needed;  socket present - ${socketPresent};  app state - ${AppState.currentState}`)
  if (Platform.OS === 'ios' && AppState.currentState === 'background' && socketPresent) {
    console.info('closeSocketOnCallEndIfAppInBackground: will close socket in 5s')
    BackgroudTimer.start()
    yield delay(5000)
    if (AppState.currentState === 'background') {
      console.info('closeSocketOnCallEndIfAppInBackground: closing socket')
      chatAPI.close(true)
    }
    BackgroudTimer.stop()
  }
}

/*
  reason: Why the call is ended
*/
export function * processCallEnd ({ callId, data }) {
  // Reset global.inboundCallId
  global.inboundCallId = null

  Sound.setMode('Default')
  console.log('src.processCallEnd: Sound Mode is set to "Default"')

  const { isColdLaunch, localCallId } = data
  console.log(`src.processCallEnd: entered callId=${callId} localCallId=${localCallId} isColdLaunch=${isColdLaunch}`)

  // Go back only if user is on VideoChat screen
  const currentRouteName = getCurrentRouteName(yield select(s => s.nav))

  // Close socket if call ends when app is in background
  yield spawn(closeSocketOnCallEndIfAppInBackground)

  if (localCallId) {
    console.log('src.processCallEnd: ending call on native with callId - ', localCallId)
    if (Platform.OS === 'android') {
      // This allows the app to go into the background by releasing wakelock
      BFService.deactivate()
      BFService.hideIncomingCall()
    } else if (Platform.OS === 'ios') {
      console.info('End CallKit call: localCallId - ', localCallId)
      yield call([RNCallKit, RNCallKit.endCall], localCallId)
    }
  }

  if (currentRouteName === 'VideoChat') {
    yield delay(2300)

    // Should check the previous route
    if (isColdLaunch) { // Android cold launch is done in the loading screen
      // Reset down to UserArea to prevent GPU munching on Android
      yield put(StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: 'UserArea' })]
      }))
    } else {
      const callInProgress = yield select(s => s.webrtc.inProgress)
      // Another call is not in progress and the current route is VideoChat
      if (!callInProgress && getCurrentRouteName(yield select(s => s.nav)) === 'VideoChat') {
        yield put(NavigationActions.back())
      }
    }
  }
}

export function * onChatMessageReceived ({ data }) {
  console.info('onChatMessageReceived:', data)
  // TODO: Temporarily using room_id instead of roomsMapKey
  const roomId = data.room_id
  // Get data for room to which the message belongs
  // const room = yield select(s => s.chat.data[data.room_id])
  // const roomsMapKey = getMapKeyForRoom(room)

  // Get currently open room map key
  const currentRoute = yield select(s => getCurrentRoute(s.nav))
  // const currentlyOpenroomsMapKey = path(['params', 'roomsMapKey'], currentRoute)
  const currentlyOpenRoomId = path(['params', 'roomId'], currentRoute)

  const roomMemberEmail = yield select(s => path(['chat', 'data', currentlyOpenRoomId, 'member_email'], s))

  if (data.status !== MESSAGE_STATUS.PENDING && roomMemberEmail === data.user_from) return

  // Get current app state
  const nativeAppState = yield select(s => s.app.nativeAppState)

  if (nativeAppState === 'background') { // app is in background
    const isOnline = yield select(s => s.app.isNetworkOnline) // online - chatd will not send a push
    if (isOnline) {
      yield call(showLocalNotification, { room_id: data.room_id })
    }
  } else { // app is in foreground
    if (roomId !== currentlyOpenRoomId) { // not in the chat room
      const message = yield formatMessage(m.native.Mailbox.receivedANewMessage)
      yield put(NotificationActions.displayNotification(message, 'info', 3000))
    }

    // Always play in app sound in foreground
    yield spawn(inAppNotificationSound)

    // vibrate notification if required
    yield spawn(inAppNotificationVibrate)
  }
}

export function * inAppNotificationSound () {
  const soundsOn = yield select(s => s.user.data.in_app_sounds_on)
  if (!soundsOn) {
    return
  }
  const filename = yield select(s => s.user.data.notification_sound)
  let volume = 1.0 // iOS default volume
  if (Platform.OS === 'android') {
    volume = yield getSystemVolume('Ambient')
  }
  const sound = yield createSound(filename, 'Ambient', 0, volume)
  sound.play()
  yield delay(10000)
  sound.release()
}

export function * inAppNotificationVibrate () {
  const vibrateOn = yield select(s => s.user.data.in_app_vibrate_on)
  if (!vibrateOn) {
    return
  }
  Vibration.vibrate()
}

/**
 * Wired to INBOUND_VIDEO_CALL_ID_RECEIVED.
 *
 * This is for Android, because the delay/setTimeout doesn't work on Android
 * when the app is behind the lock screen.
 */
export function * chatInitFromCallForAndroid () {
  // Exit if not Android
  if (Platform.OS !== 'android') return

  // Exit if chat API has already been initiated
  if (chatAPI.initiated) return

  const user = yield select(s => s.user)
  if (!isLoggedIn(user)) {
    yield take(UserTypes.UPDATE_USER)
  }
  if (!chatAPI.initiated) {
    yield put(ChatActions.chatInit())
  }
}

export function * chatSetupExistingRoomError () {
  yield put(NavigationActions.back())
}

export function * chatCreateRoomSuccess ({ data }) {
  yield delay(1000)
  yield put(StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: 'MessagingRoomList' }),
      NavigationActions.navigate({ routeName: 'MessagingRoom', params: { roomId: data.room_id } })
    ]
  }))
}

export function * chatLeaveRoomSuccess ({ data }) {
  if (!data || !data.room_id) return
  const activeRoomId = yield select(getActiveChatRoomId)
  if (data.room_id !== activeRoomId) return
  yield put(StackActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({ routeName: 'MessagingRoomList' })
    ]
  }))
}
