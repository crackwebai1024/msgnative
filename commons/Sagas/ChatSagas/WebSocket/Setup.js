import { put, call, select, take, spawn, race } from 'redux-saga/effects'
import { eventChannel, buffers, delay } from 'redux-saga'
import AppAction, { AppTypes } from 'commons/Redux/AppRedux'
import Actions, { ChatTypes } from 'commons/Redux/ChatRedux'
import { isLoggedIn } from 'commons/Selectors/User'

import { chatAPI } from './'
import { doHandShakeOnSocket } from './HandShake'
import { listenForMessages } from './MessageHandler'
import { DISCONNECT_MESSAGE } from '../Constants'

/**
 * Create a websocket channel for listening on messages from,
 * and passing it into saga pipeline.
 *
 * @param setMessageHandler
 * @param removeMessageHandler
 * @param setDisconnectHandler
 * @returns {Channel<T>}
 */
function createSocketChannel (setMessageHandler, removeMessageHandler, setDisconnectHandler) {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel((emit) => {
    // puts event payload into the channel
    // this allows a Saga to take this payload from the returned channel
    const messageHandler = data => emit(data)

    // setup the subscription
    setMessageHandler(messageHandler)

    // Set a disconnect handler that emits disconnect message
    setDisconnectHandler(() => emit(DISCONNECT_MESSAGE))

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    return removeMessageHandler
  }, buffers.sliding())
}

/**
 * Create socket and listen for messages.
 *
 * Wired with following redux actions –
 * - StartupTypes.STARTUP_SUCCESS
 * - ChatTypes.CHAT_SOCKET_DISCONNECTED
 */
export function * bootstrapChatSocket () {
  console.info('bootstrapChatSocket: entered')

  yield put(Actions.chatSocketConnecting())

  try {
    // Create a channel for listening on messages
    const socketChannel = yield call(
      createSocketChannel,
      chatAPI.setMessageHandler,
      chatAPI.removeMessageHandler,
      chatAPI.setDisconnectHandler
    )

    console.info('bootstrapChatSocket: generating key pair')
    // Bootstrap key pair
    yield call([chatAPI, chatAPI.bootstrapKeyPair])

    // Reconnect the socket
    yield spawn(chatSocketConnectingStateTimeout)

    console.info('bootstrapChatSocket: connecting socket')
    // Connect the socket
    yield call([chatAPI, chatAPI.connectSocket])
    yield put(Actions.chatSocketConnectingStarted())
    console.info('bootstrapChatSocket: started socket connect')

    const user = yield select(s => s.user)
    if (!isLoggedIn(user)) return

    let firstMessage
    let serverPublicKey

    // Keep pulling in messages until server's public_key has been received
    while (true) {
      console.info('bootstrapChatSocket: waiting for first message')
      firstMessage = yield take(socketChannel)
      console.info('bootstrapChatSocket: first message - ', firstMessage)
      if (firstMessage.public_key) {
        // Set the server's public key on chatAPI instance
        if (firstMessage.system_status) {
          if (firstMessage.system_status.status_mode === 1) {
            yield put(AppAction.setMaintenanceMode())
          }
        }
        serverPublicKey = firstMessage.public_key

        break
      }
    }

    const handshakeSuccessful = yield call(doHandShakeOnSocket, serverPublicKey, socketChannel)
    console.info('bootstrapChatSocket: handshake successful - ', handshakeSuccessful)
    if (!handshakeSuccessful) {
      yield put(Actions.chatSocketDisconnected())
      return
    }

    chatAPI.userSessionStarted = true
    // yield put(Actions.chatSocketConnected())

    yield put(Actions.chatFetch())

    // Mark key handshake as successful on chatAPI
    // yield put(Actions.chatKeyHandshakeSuccessful())

    yield spawn(listenForMessages, socketChannel)
  } catch (e) {
    console.info('Chat Socket Setup Error:', e)
    yield put(Actions.chatSocketDisconnected())
  }
}

/**
 * Set 'socket connecting' state only after waiting some time
 * as we don't want to render the connecting UI immediately...
 */
function * chatSocketConnectingStateTimeout () {
  console.info('chatSocketConnectingStateTimeout: entered')
  const appState = yield select(s => s.app.nativeAppState)
  if (appState === 'background' || appState === 'inactive') {
    const { newState } = yield take(AppTypes.NATIVE_APP_STATE_CHANGED)
    if (newState !== 'active') return
  }

  // Do nothing if socket is already connected
  const isAlreadyConnected = yield select(s => s.chat.socketConnected)
  console.info('chatSocketConnectingStateTimeout: isAlreadyConnected - ', isAlreadyConnected)
  if (isAlreadyConnected) return

  // Wait for socket connected action with 8s timeout
  console.info('chatSocketConnectingStateTimeout: waiting on CHAT_SOCKET_CONNECTED with 8s timeout')
  const result = yield race({
    timeout: delay(8000),
    connected: take(ChatTypes.CHAT_SOCKET_CONNECTED)
  })

  if (result.timeout) {
    console.info('chatSocketConnectingStateTimeout: socket connecting Timed out! waiting on reconnecting')
    yield put(Actions.chatSocketConnecting())
  }
}
