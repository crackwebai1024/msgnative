import { put, call, select, take } from 'redux-saga/effects'
import { isEmpty, isNil } from 'ramda'

import Actions from 'commons/Redux/ChatRedux'
import WebrtcActions from 'commons/Redux/WebrtcRedux'
import { isLoggedIn } from 'commons/Selectors/User'
import { createSignature } from 'commons/Services/API/Utils/signature'

import { getDeviceInfoWithToken } from 'app/Lib/Device'

import { EVENT_TYPE } from '../Constants'

import { chatAPI } from './index'

/**
 * Does handshake on a socket with given public key.
 */
export function * doHandShakeOnSocket (publicKey, socketChannel) {
  console.info('doHandShakeOnSocket: starting handshake on socket...')
  const user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  chatAPI.setBase64ServerPublicKey(publicKey)

  // Send payload for key handshake
  const testResponse = yield call([chatAPI, chatAPI.encryptMessageAsBase64], 'test')
  const device = yield call(getDeviceInfoWithToken)
  const handShakePayload = {
    // Client public key, towards which the server will encrypt
    public_key: chatAPI.getClientPublicKeyAsBase64(),
    // Encrypted message binary as base 64
    enc_msg: testResponse,
    push_type: EVENT_TYPE.MESSAGE_INLINE,
    jwt: createSignature(user.data.access_id, user.data.secret_token)
  }
  if (!isNil(device) && !isEmpty(device)) {
    handShakePayload.device = device
  }
  console.info('doHandShakeOnSocket: handshake payload: ', handShakePayload)
  yield call([chatAPI, chatAPI.sendHandShakePayload], handShakePayload)

  let response

  while (true) {
    response = yield take(socketChannel)
    if (!response || !response.is_handshake_response) continue

    // Return if the key handshake response isn't as expected
    if (!response.status) {
      console.info('doHandShakeOnSocket: handshake failed')
      return false
    }

    break
  }

  console.info('doHandShakeOnSocket: handshake response: ', response)

  const { turn } = response
  if (Array.isArray(turn) && turn.length > 0) {
    yield put(WebrtcActions.setIceServers(turn))
    console.info('doHandShakeOnSocket: successfully set turn servers')
  } else {
    console.info('doHandShakeOnSocket: returning empty array of turn servers')
  }

  chatAPI.isReady()

  yield put(Actions.chatSocketConnected())
  yield put(Actions.chatKeyHandshakeSuccessful())

  return true
}
