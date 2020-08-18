import { eventChannel } from 'redux-saga'
import { put, select, take, call, spawn } from 'redux-saga/effects'
import { NavigationActions } from 'react-navigation'
import FCM, { FCMEvent } from 'react-native-fcm'
import { path } from 'ramda'
import AppActions from 'commons/Redux/AppRedux'
import { ChatTypes } from '/commons/Redux/ChatRedux'
import WebrtcActions, { CALL_END_REASON } from 'commons/Redux/WebrtcRedux'
import { getCurrentRoute } from '../../Navigation/utils'
import { delay } from 'app/Lib/Device'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/'
import NotificationActions from 'commons/Redux/NotificationRedux'

export const notificationChannelId = 'msgsafe_notification_channel'

export function * listenToInboundActions () {
  console.info('listenToInboundActions entered...')
  // const channel = yield call(createGotRemoteStreamChannel)
  // while (true) {
  //   const action = yield take(channel)
  //   if (action === BFService.REJECT_CALL_ANDROID) {
  //     // Reject Call here
  //     // yield put()
  //   }
  // }
}

function createGotRemoteStreamChannel () {
  return eventChannel((emit) => {
    FCM.on(FCMEvent.Notification, n => emit(n))
    return () => {}
  })
}

export function * showLocalNotification (data) {
  const message = yield formatMessage(m.native.Mailbox.receivedANewMessage)
  // const filename = yield select(s => s.user.data.notification_sound)
  FCM.presentLocalNotification({
    id: new Date().valueOf().toString(),
    title: message,
    body: 'Tap to see',
    priority: 'high',
    show_in_foreground: true,
    my_custom_data: data,
    icon: '@drawable/icon',
    // large_icon: '@drawable/icon', // Android only
    // sound: filename,
    lights: true,
    color: '#233755',
    group: 'msgsafe',
    // picture: '@mipmap/ic_launcher',
    number: 1,
    channel: notificationChannelId
  })
}

function * navigateToRoomWithMapKey (roomId, roomType = 0) { //  room_type = 0: Regular Room, 1: Ephemeral Room
  // Get data for room to which the message belongs
  const room = yield select(s => s.chat.data && s.chat.data[roomId])
  if (!room) return
  const currentRoute = yield select(s => getCurrentRoute(s.nav))
  // Get the currently open room id
  const currentlyOpenRoomId = path(['params', 'roomId'], currentRoute)

  // Check if we are already on the room
  if (roomId === currentlyOpenRoomId && roomType === 0) {
    console.info('room already open...')
    return
  }

  const params = { roomId }
  if (roomType === 1) {
    params.isEphemeral = true
  }

  // Navigate to the room
  yield put(NavigationActions.navigate({ routeName: 'MessagingRoom', params }))
}

function * processInitialNotification (initialNoti) {
  // TODO: initial notifications are handled in Android MainActivity's onCreate
  if (initialNoti.call_id && initialNoti.type === 'WEBRTC_CALL') {
    if (global.inboundCallId === initialNoti.call_id) {
      console.info('handleNotification (android): received VOIP notification but there is already an offer for same call_id -', global.inboundCallId)
      return
    }
    // Set global.inboundCallId
    global.inboundCallId = initialNoti.call_id
    if (initialNoti.call_args && typeof initialNoti.call_args === 'object') {
      yield put(WebrtcActions.inboundVideoCallOfferReceived({
        ...initialNoti.call_args,
        call_id: initialNoti.call_id
      }, true))
    } else if (initialNoti.call_args && typeof initialNoti.call_args === 'string') {
      yield put(WebrtcActions.inboundVideoCallOfferReceived({
        ...JSON.parse(initialNoti.call_args),
        call_id: initialNoti.call_id
      }, true))
    } else {
      yield put(WebrtcActions.inboundVideoCallOfferReceived({
        call_id: initialNoti.call_id
      }, true))
    }
  }

  if (initialNoti.opened_from_tray && initialNoti.my_custom_data && initialNoti.my_custom_data.room_id) {
    yield put(AppActions.setIsLaunchedFromNotificationTray(true))

    yield take(ChatTypes.CHAT_INIT)

    const isLaunchedFromNotificationTray = yield select(s => s.app.isLaunchedFromNotificationTray)
    if (!isLaunchedFromNotificationTray) return

    yield put(NavigationActions.navigate({ routeName: 'MessagingRoomList' }))
    yield take(ChatTypes.CHAT_SUCCESS)
    if (initialNoti.my_custom_data.type && initialNoti.my_custom_data.type === 'EPHEMERAL_ROOM_NUDGE') {
      yield call(navigateToRoomWithMapKey, initialNoti.my_custom_data.room_id, 1)
    } else {
      yield call(navigateToRoomWithMapKey, initialNoti.my_custom_data.room_id)
    }
  } else if (initialNoti.opened_from_tray && initialNoti.room_id) {
    yield put(AppActions.setIsLaunchedFromNotificationTray(true))

    yield take(ChatTypes.CHAT_INIT)

    const isLaunchedFromNotificationTray = yield select(s => s.app.isLaunchedFromNotificationTray)
    if (!isLaunchedFromNotificationTray) return

    yield put(NavigationActions.navigate({ routeName: 'MessagingRoomList' }))
    yield take(ChatTypes.CHAT_SUCCESS)
    if (initialNoti.type && initialNoti.type === 'EPHEMERAL_ROOM_NUDGE') {
      yield call(navigateToRoomWithMapKey, initialNoti.room_id, 1)
    } else {
      yield call(navigateToRoomWithMapKey, initialNoti.room_id)
    }
  }
}

function * handleNotification (notif) {
  if (notif.local_notification) {
    console.info('notif.local_notification')
    // this is a local notification
  }

  if (notif.opened_from_tray) {
    console.info('notif.opened_from_tray')
    // app is open/resumed because user clicked banner

    if (notif.my_custom_data && notif.my_custom_data.room_id) {
      if (notif.my_custom_data.type && notif.my_custom_data.type === 'EPHEMERAL_ROOM_NUDGE') {
        yield call(navigateToRoomWithMapKey, notif.my_custom_data.room_id, 1)
      } else {
        yield call(navigateToRoomWithMapKey, notif.my_custom_data.room_id)
      }
    } else if (notif.room_id) {
      if (notif.type && notif.type === 'EPHEMERAL_ROOM_NUDGE') {
        yield call(navigateToRoomWithMapKey, notif.room_id, 1)
      } else {
        yield call(navigateToRoomWithMapKey, notif.room_id)
      }
    }

    return
  }

  const { type, call_end_reason: callEndReason } = notif
  if (type === 'WEBRTC_CALL') {
    if (global.inboundCallId === notif.call_id) {
      console.info('handleNotification (android): received VOIP notification but there is already an offer for same call_id -', global.inboundCallId)
      return
    }

    // Set global.inboundCallId
    global.inboundCallId = notif.call_id

    const localCallId = yield select(s => s.webrtc.localCallId)
    if (localCallId === notif.call_id) {
      console.info('Duplicated Call -', localCallId)
      return
    }

    if (notif.call_args && typeof notif.call_args === 'object') {
      yield put(WebrtcActions.inboundVideoCallOfferReceived({ ...notif.call_args, call_id: notif.call_id }, false))
    } else if (notif.call_args && typeof notif.call_args === 'string') {
      yield put(WebrtcActions.inboundVideoCallOfferReceived({ ...JSON.parse(notif.call_args), call_id: notif.call_id }, false))
    }
  } else if (type === 'WEBRTC_END_CALL') {
    const { localCallId, callId } = yield select(s => ({
      localCallId: s.webrtc.localCallId,
      callId: s.webrtc.callId
    }))
    if (localCallId === notif.call_id || callId === notif.call_id) {
      console.log('calling endVideoCall: android push notification - WEBRTC_END_CALL - ', callEndReason)
      yield put(WebrtcActions.endVideoCall(callEndReason, true))
    } else {
      console.log('handleNotification: call not found - ', notif.call_id)
    }
  }
}

export function * createNotificationChannel () {
  const filename = yield select(s => s.user.data.notification_sound)

  const channelResult = yield FCM.createNotificationChannel({
    id: notificationChannelId,
    name: 'MsgSafe Notifications',
    priority: 'max',
    sound: filename
  })

  console.info('Notification Channel:', channelResult)
}

export function * listenToNotifications () {
  yield createNotificationChannel()

  const initialNoti = yield call([FCM, FCM.getInitialNotification])
  console.info('Initial Notification:', initialNoti)
  if (initialNoti) {
    yield spawn(processInitialNotification, initialNoti)
  }

  const channel = yield call(createGotRemoteStreamChannel)

  while (true) {
    const notif = yield take(channel)
    console.info('Notification:', notif)

    // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
    yield spawn(handleNotification, notif)
  }
}
