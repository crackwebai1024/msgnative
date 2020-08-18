import { filter, path } from 'ramda'
import { select, take, fork, spawn, race } from 'redux-saga/effects'

import { ChatTypes } from 'commons/Redux/ChatRedux'
import { WebrtcTypes } from 'commons/Redux/WebrtcRedux'
import { isLoggedIn } from 'commons/Selectors/User'
import { AppTypes } from 'commons/Redux/AppRedux'

import { joinRoomRequest } from '../Room'

import { bootstrapChatSocket } from './Setup'

/**
 * Reconnect the chat websocket, wait until key handshake is successful
 * and then join back all the previously joined rooms.
 *
 * This is bound to CHAT_SOCKET_DISCONNECTED event, so it is immediately
 * called upon socket disconnect.
 *
 * When app goes to background, the socket is closed and this is immediately
 * executed, so we wait until app status goes to active or there's an inbound
 * call offer before calling `bootstrapChatSocket`
 */
export function * reconnectChatSocket () {
  console.info('reconnectChatSocket: entered')
  const user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  const appState = yield select(s => s.app.nativeAppState)
  if (appState === 'background') {
    while (true) {
      console.info('reconnectChatSocket: waiting for app to go active or inbound call offer')
      const result = yield race({
        inboundCall: take(WebrtcTypes.INBOUND_VIDEO_CALL_OFFER_RECEIVED),
        appStateChange: take(AppTypes.NATIVE_APP_STATE_CHANGED)
      })
      if (result.inboundCall || path(['appStateChange', 'newState'], result) === 'active') break
    }
  }

  // Spawn a bootstrapChatSocket
  yield spawn(bootstrapChatSocket)

  // Wait until the key handshake is successful
  yield take(ChatTypes.CHAT_SUCCESS)

  // Extract chat slice
  const chatSlice = yield select(s => s.chat)

  // Extract ids of previously joined rooms
  // and join back all of the rooms
  if (chatSlice.dataOrder) {
    const previouslyJoinedRoomIds = filter(id => chatSlice.data[id].joined, chatSlice.dataOrder)
    for (const id of previouslyJoinedRoomIds) {
      yield fork(joinRoomRequest, { roomId: id })
    }
  }
}
