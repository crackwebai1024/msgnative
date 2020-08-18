import { eventChannel } from 'redux-saga'
import { call, take, race, put, select, spawn } from 'redux-saga/effects'
import NotificationsIOS from 'react-native-notifications'
import { path } from 'ramda'
import { NavigationActions } from 'react-navigation'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/'
import AppActions from 'commons/Redux/AppRedux'
import { ChatTypes } from 'commons/Redux/ChatRedux'
import WebrtcActions, { CALL_END_REASON } from 'commons/Redux/WebrtcRedux'
import { chatAPI } from 'commons/Sagas/ChatSagas'
import { getContactMember } from 'commons/Selectors/Messaging'
import NotificationActions from 'commons/Redux/NotificationRedux'

function * createForegroundEventListenerChannel () {
  return eventChannel((emit) => {
    NotificationsIOS.addEventListener('notificationReceivedForeground', emit)
    return () => { NotificationsIOS.removeEventListener('notificationReceivedForeground', emit) }
  })
}

function * createBackgroundEventListenerChannel () {
  return eventChannel((emit) => {
    NotificationsIOS.addEventListener('notificationReceivedBackground', emit)
    return () => { NotificationsIOS.removeEventListener('notificationReceivedBackground', emit) }
  })
}

function * createNotificationOpenedEventListenerChannel () {
  return eventChannel((emit) => {
    NotificationsIOS.addEventListener('notificationOpened', emit)
    return () => { NotificationsIOS.removeEventListener('notificationOpened', emit) }
  })
}

export function * listenToInboundActions () {}

export function * showLocalNotification () {
  const message = yield formatMessage(m.native.Mailbox.receivedANewMessage)
  NotificationsIOS.localNotification({
    alertBody: 'Tap to see',
    alertTitle: message
  })
}

function * handleNotification (event) {
  const eventData = event.background || event.foreground

  if (eventData) {
    const callId = path(['_data', 'call_id'], eventData)
    const type = path(['_data', 'type'], eventData)
    const callEndReason = path(['_data', 'call_end_reason'], eventData)
    if (type === 'WEBRTC_CALL' && callId) {
      const notif = eventData._data
      console.info('handleNotification (iOS): received VOIP notification - ', notif)

      if (global.inboundCallId === callId) {
        console.info('handleNotification (iOS): received VOIP notification but there is already an offer for same call_id -', global.inboundCallId)
        return
      }
      // Set global.inboundCallId
      global.inboundCallId = callId

      yield put(WebrtcActions.inboundVideoCallOfferReceived({
        ...notif.call_args,
        call_id: notif.call_id
      }, true))
      return
    } else if (type === 'WEBRTC_END_CALL') {
      const { localCallId, _callId } = yield select(s => ({
        localCallId: s.webrtc.localCallId,
        _callId: s.webrtc.callId
      }))
      if (localCallId === callId || _callId === callId) {
        console.log('handleNotification (iOS): calling endVideoCall - received WEBRTC_END_CALL - ', callEndReason)
        yield put(WebrtcActions.endVideoCall(callEndReason, true))
        console.info('handleNotification (iOS): end coldLaunch call -', localCallId)
        return
      } else {
        console.info('handleNotification (iOS): call not found - ', callId)
      }
    }
  }

  // Incoming chat message notification
  if (event.notification) {
    const roomId = path(['notification', '_data', 'room_id'], event)
    const type = path(['notification', '_data', 'type'], event)
    if (!roomId) return

    yield put(AppActions.setIsLaunchedFromNotificationTray(true))

    // If chat is not ready, wait for the bootstrap and room fetch
    if (!chatAPI.ready) {
      const isLaunchedFromNotificationTray = yield select(s => s.app.isLaunchedFromNotificationTray)
      if (!isLaunchedFromNotificationTray) return

      yield take(ChatTypes.CHAT_FETCH)
      yield put(NavigationActions.navigate({ routeName: 'MessagingRoomList' }))
      yield take(ChatTypes.CHAT_SUCCESS)
    }

    // Get the room object with room_id
    const room = yield select(s => path(['chat', 'data', roomId], s))
    // console.info('message notification - room - ', room)
    if (!room) {
      console.info(`Room ${roomId} not found for message notification...`)
      return
    }

    // Extract contact detail
    const contact = getContactMember(room)
    // console.info('message notification - contact - ', contact)
    if (!contact.email) return

    // Move to chat room
    if (type && type === 'EPHEMERAL_ROOM_NUDGE') {
      yield put(NavigationActions.navigate({
        routeName: 'MessagingRoom',
        params: { roomId, isEphemeral: true }
      }))
    } else {
      yield put(NavigationActions.navigate({
        routeName: 'MessagingRoom',
        params: { roomId }
      }))
    }
  }
}

export function * createNotificationChannel () {}

export function * listenToNotifications () {
  const backgroundChannel = yield call(createBackgroundEventListenerChannel)
  const foregroundChannel = yield call(createForegroundEventListenerChannel)
  const notificationOpenedChannel = yield call(createNotificationOpenedEventListenerChannel)

  NotificationsIOS.consumeBackgroundQueue()

  while (true) {
    const event = yield race({
      notification: take(notificationOpenedChannel),
      background: take(backgroundChannel),
      foreground: take(foregroundChannel)
    })
    console.info('listenToNotifications event - ', event)

    // Incoming voip call push
    yield spawn(handleNotification, event)
  }
}
