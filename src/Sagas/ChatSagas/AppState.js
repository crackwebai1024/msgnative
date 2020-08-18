import { Platform, AppState } from 'react-native'
import { select, race, call, take, put } from 'redux-saga/effects'
import BackgroudTimer from 'react-native-background-timer'

import AppActions, { AppTypes } from 'commons/Redux/AppRedux'
import ChatActions from 'commons/Redux/ChatRedux'
import { chatAPI } from 'commons/Sagas/ChatSagas'
import { isLoggedIn } from 'commons/Selectors/User'
import { delay } from 'app/Lib/Device'

/**
 * iOS App States -
 *
 * - inactive (iOS only)
 *
 *  App is in foreground but not receiving events from iOS,
 *  e.g. when a call or SMS is received or user pulls up or
 *  down the screen to access system panels.
 *
 *  Javascript can execute during this state and we need not
 *  do anything.
 *
 *  Quirk: when the top iOS drawer is pulled down, then app
 *  goes through active (before interrupt) => inactive => active => inactive
 *  states.
 *
 * - background
 *
 *  App is in background and can't execute the code.
 *  From our experience, it seems that javascript can execute
 *  for a small amount of time (exact unknown).
 *
 *  We should close the websocket connection in this state,
 *  as the socket connection will stay alive but since the javascript
 *  can't be executed in response to the messages on the socket,
 *  it'd be pointless to keep the connection alive and make the
 *  chatd server think that we are online.
 *
 *  - active
 *
 *  App is in foreground and active, can receive iOS events.
 *
 *  We already have auto reconnect mechanism and `onopen` callback
 *  so don't need to do anything special here.  We just dispatch a
 *  `AppActions.readyForSync`.
 *
 *  Todo: move `AppActions.readyForSync` dispatch to the same place
 *  where we deal with socket reconnect.
 *
 */

// Handle app state change
export function * handleAppStateChange ({ newState }) {
  const loggedIn = isLoggedIn(yield select(s => s.user))
  if (!loggedIn) return

  const callInProgress = yield select(s => s.webrtc.inProgress)
  console.info('handleAppStateChange: callInProgress - ', callInProgress)
  console.info('handleAppStateChange: state - ', newState)

  // Don't do anyting if call is in progress or permission is being initiated
  const socketPresent = yield select(s => s.chat.socketConnected || s.chat.socketConnecting)
  if ((callInProgress && socketPresent) || !global.permissionsInitiated) return

  if (newState === 'inactive') {
    // setTimeout(() => console.log('Proof that I can execute even during inactive state'), 5000)
    if (Platform.OS === 'ios') {
      BackgroudTimer.start()
    }
  }

  // If app is in background, then close the websocket
  if (newState === 'background') {
    console.info('handleAppStateChange: start timer!')
    yield delay(5000)

    // Still app is background
    console.info('handleAppStateChange: end timer!')
    if (AppState.currentState === 'background') {
      console.info('handleAppStateChange: close socket after 5 senconds')
      chatAPI.close(true)
      yield put(ChatActions.resetChatSocketConnectionState())
    }

    if (Platform.OS === 'ios') {
      BackgroudTimer.stop()
    }
  }

  // There's a quirk on iOS where pulling down iOS panel causes
  // active => inactive => active => inactive states happening immediately
  // So, let's only dispatch `AppActions.readyForSync` on last state change
  // to active and if the websocket was manually closed.
  if (newState === 'active' && Platform.OS === 'ios') {
    const raceResult = yield race({
      timeout: call(delay, 500),
      stateChange: take(AppTypes.NATIVE_APP_STATE_CHANGED)
    })

    if (raceResult.stateChange) return
  }

  if (newState === 'active') {
    // Reconnect only if socket was manually closed few lines above
    if (!socketPresent && chatAPI._manuallyClosed) {
      yield put(ChatActions.chatReconnect())
      yield put(AppActions.readyForSync())
    }
  }
}

// // Not in use
// function * closeWebSocketAPI () {
//   const result = yield race({
//     timeout: call(delay, 1000),
//     stateChange: take(AppTypes.NATIVE_APP_STATE_CHANGED_ACTIVE)
//   })
//   if (result.timeout) {
//     console.info('chatAPI.close(false)')
//     chatAPI.close(false)
//   }
// }
