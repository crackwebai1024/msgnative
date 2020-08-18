import uuidv1 from 'uuid/v1'
// import WebSocketClient from 'reconnecting-websocket'

import * as Sodium from 'app/Services/Encryption'

import {
  convertUint8ArrayToStr,
  convertUint8ArrayToBase64Str,
  convertBase64StrToUint8Array,
  concatenateUint8Array
} from 'commons/Lib/Encoding'

const ReconnectingWebsocket = require('reconnecting-websocket')
// const DEVKIT_WSS_URL = 'wss://devkit-us.msgsafe.io:443'
// const STAGE_WSS_URL = 'wss://stage-us.msgsafe.io:443'
const STAGE_WSS_URL = 'wss://stage-1-us.msgsafe.io:443'
const PROD_WSS_URL = 'wss://chat.msgsafe.io:443'

const WSS_URL = process.env.NODE_ENV === 'production' ? PROD_WSS_URL : STAGE_WSS_URL

export default class MsgSafeChatAPI {
  static backOffConfig = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1500,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 6000,
    maxRetries: Infinity,
    debug: false
  }

  constructor (url) {
    this._url = url || WSS_URL

    // Local keypair for chat
    this._keyPair = null

    // Server public key as base64 and binary
    this._serverPublicKeyBase64 = null
    this._serverPublicKeyBinary = null

    this._externalMessageHandler = null
    this._externalDisconnectHandler = null

    // Sequence to requests map
    this._seqToRequestMap = {}

    // Track if socket has been manually closed
    this._manuallyClosed = false

    // Track if socket is currently opened
    this._socketState = 0 // 0: closed, 1: active, 2: connecting, 3: disconnecting

    this.initiated = false
    this.handshakeStarted = false

    // Track whether key handshake has been done
    this.ready = false

    // Track if the socket has been in use for a user
    // This will stay true as soon as the first handshake
    // is successful and won't change even on socket disconnects
    // Helps in distinguishing between logged in and out states.
    this.userSessionStarted = false

    // Create the websocket connection
    this.socket = null

    this._mainMessageHandler = this._mainMessageHandler.bind(this)
    this.setMessageHandler = this.setMessageHandler.bind(this)
    this.removeMessageHandler = this.removeMessageHandler.bind(this)
    this.setDisconnectHandler = this.setDisconnectHandler.bind(this)
    this.resendMessagesInSeq = this.resendMessagesInSeq.bind(this)
    this.close = this.close.bind(this)

    this.instanceCount = 0
  }

  bootstrapKeyPair () {
    if (this._keyPair) return Promise.resolve()

    console.log('this._keyPair empty', this._keyPair)

    return new Promise((resolve, reject) => {
      Sodium.crypto_box_keypair().then((keyPair) => {
        this._keyPair = keyPair
        resolve()
      })
    })
  }

  connectSocket () {
    console.info('MsgSafeChatAPI.connectSocket: entered')

    // Exit if there's already a socket
    this.initiated = true

    if (this._socketState === 1 || this._socketState === 2) {
      console.info('MsgSafeChatAPI.connectSocket: not creating new socket')
      return
    } else {
      console.info('MsgSafeChatAPI.connectSocket: creating new socket')
    }
    this._socketState = 2
    this._manuallyClosed = false

    console.info('MsgSafeChatAPI: instance count - ', ++this.instanceCount)

    return new Promise((resolve, reject) => {
      // Create the websocket connection
      this.socket = new ReconnectingWebsocket(this._url, [], MsgSafeChatAPI.backOffConfig)

      this.socket.addEventListener('message', this._mainMessageHandler)
      this.socket.onopen = (e) => {
        console.info('MsgSafeChatAPI: socket open')
        // Set ready to false since the handshake is still pending
        this.ready = false
        this._socketState = 1
        this._cleanUpSeq()
        resolve()
      }

      this.socket.onclose = (e) => {
        console.info('MsgSafeChatAPI: socket closed')
        this._socketState = 0
        this.ready = false

        if (typeof this._externalDisconnectHandler === 'function') {
          this._externalDisconnectHandler()
        }

        if (this._manuallyClosed) {
          this._cleanUpSeq() // initialize request queue
        }
        this.handshakeStarted = false
      }

      this.socket.onerror = (e) => {
        console.info('MsgSafeChatAPI: socket error')

        // Connection timeout error causes app crash when ws reconnecting, so added below
        this._socketState = 0
        this.ready = false
        this.handshakeStarted = false

        if (typeof this._externalDisconnectHandler === 'function') {
          this._externalDisconnectHandler()
        }
      }
    })
  }

  async _mainMessageHandler (event) {
    // If manually closed, ignore all the events
    if (this._manuallyClosed) return

    let data

    if (event.data === 'PONG') {
      data = event.data
    }

    if (!data) {
      try {
        data = JSON.parse(event.data)
      } catch (e) {}
    }

    if (!data) {
      try {
        data = await this.decryptBase64Message(event.data)
      } catch (e) {
        console.info('MsgSafeChatAPI._mainMessageHandler: failed to decrypt message', e, event.data)
      }
    }

    if (data) {
      // console.info('MsgSafeChatAPI._mainMessageHandler: received data - ', data)
    } else {
      console.info('MsgSafeChatAPI._mainMessageHandler: failed to make sense of data - ', event.data)
      return
    }

    if (data.seq_id) {
      const cbs = this._getCbForSeq(data.seq_id)
      if (cbs && typeof cbs[0] === 'function') {
        this._deRegisterForSeq(data.seq_id)
        delete data.seq_id
        // console.info('MsgSafeChatAPI._mainMessageHandler: call callback func with this data - ', data)
        cbs[0](data)
        return
      }
      console.info('MsgSafeChatAPI: seq_id doesnt exist - ', data.seq_id)
    }

    if (typeof this._externalMessageHandler === 'function') {
      this._externalMessageHandler(data)
    }
  }

  resendMessagesInSeq () {
    if (this._manuallyClosed || this._socketState !== 1 || !this._seqToRequestMap) {
      return
    }

    for (const seq in this._seqToRequestMap) {
      if (this._seqToRequestMap.hasOwnProperty(seq)) {
        if (this._seqToRequestMap[seq][1] && this._seqToRequestMap[seq][1].cmd && (this._seqToRequestMap[seq][1].cmd === '/message/add' || this._seqToRequestMap[seq][1].cmd === '/message/add/e2ee')) {
          this.encryptMessageAsBase64(this._seqToRequestMap[seq][1]).then((p) => {
            this.socket.send(p)
          })
        }
      }
    }
  }

  _cleanUpSeq () {
    this._seqToRequestMap = {}
  }

  _registerForSeq (seq, cb) {
    if (typeof cb === 'object' && typeof cb[0] === 'function') {
      this._seqToRequestMap[seq] = cb
    }
  }

  _getCbForSeq (seq) {
    return this._seqToRequestMap[seq]
  }

  _deRegisterForSeq (seq) {
    if (this._seqToRequestMap[seq]) {
      delete this._seqToRequestMap[seq]
    }
  }

  /**
   * Set server's public, given as base 64 encoded string.
   *
   * @param key
   */
  setBase64ServerPublicKey (key) {
    this._serverPublicKeyBase64 = key
    this._serverPublicKeyBinary = convertBase64StrToUint8Array(key)
  }

  /**
   * Set an external message handler.
   *
   * @param handler
   */
  setMessageHandler (handler) {
    this._externalMessageHandler = handler
  }

  /**
   * Remove the external message handler.
   */
  removeMessageHandler () {
    this._externalMessageHandler = null
  }

  /**
   * Set the disconnect handler.
   */
  setDisconnectHandler (handler) {
    this._externalDisconnectHandler = handler
  }

  /**
   * Call when key handshake is successful.
   */
  isReady () {
    this.ready = true
  }

  /**
   * Get client's public key as base 64 encoded string.
   *
   * @returns {string}
   */
  getClientPublicKeyAsBase64 () {
    return convertUint8ArrayToBase64Str(this._keyPair.publicKey)
  }

  /**
   * Encrypt message and return binary (Uint8Array).
   *
   * Prepends the nonce with the encrypted message binary.
   *
   * @param message
   * @param customBase64PublicKey
   */
  async encryptMessageAsBinary (message, customBase64PublicKey) {
    let publicKey = this._serverPublicKeyBinary
    if (customBase64PublicKey) {
      publicKey = convertBase64StrToUint8Array(customBase64PublicKey)
    }

    const nonceBinary = await Sodium.randombytes_buf(Sodium.crypto_box_NONCEBYTES)
    const encryptedBinary = await Sodium.crypto_box_easy(message, nonceBinary, publicKey, this._keyPair ? this._keyPair.privateKey : '')

    return concatenateUint8Array(nonceBinary, encryptedBinary)
  }

  /**
   * Encrypt message and return as base 64 encoded.
   *
   * Uses `encryptMessageAsBinary` under the hood.
   *
   * @param message
   * @param customBase64PublicKey
   * @returns {string}
   */
  async encryptMessageAsBase64 (message, customBase64PublicKey) {
    try {
      if (typeof message === 'object') {
        message = JSON.stringify(message)
      }
    } catch (e) {}
    const binary = await this.encryptMessageAsBinary(message, customBase64PublicKey)
    return convertUint8ArrayToBase64Str(binary)
  }

  async decryptBinaryMessage (encryptedBinary, customBase64PublicKey, decodeBinaryToBase64) {
    let publicKey = this._serverPublicKeyBinary
    if (customBase64PublicKey) {
      publicKey = convertBase64StrToUint8Array(customBase64PublicKey)
    }

    const responseNonce = encryptedBinary.subarray(0, Sodium.crypto_box_NONCEBYTES)
    const encryptedMessageBinary = encryptedBinary.subarray(Sodium.crypto_box_NONCEBYTES)
    const decryptedBinary = await Sodium.crypto_box_open_easy(encryptedMessageBinary, responseNonce, publicKey, this._keyPair ? this._keyPair.privateKey : '')
    const decryptedStr = decodeBinaryToBase64
      ? convertUint8ArrayToBase64Str(decryptedBinary)
      : convertUint8ArrayToStr(decryptedBinary)

    try {
      if (typeof decryptedStr === 'string') {
        return JSON.parse(decryptedStr)
      }
    } catch (e) {}

    return decryptedStr
  }

  /**
   * Decrypt an encrypted message, as base 64 encoded.
   *
   * Returns decrypted object/string.
   *
   * @param encryptedBase64
   * @param customBase64PublicKey
   */
  async decryptBase64Message (encryptedBase64, customBase64PublicKey) {
    let result = null
    try {
      const encryptedBinary = convertBase64StrToUint8Array(encryptedBase64)
      result = this.decryptBinaryMessage(encryptedBinary, customBase64PublicKey)
    } catch (e) {
      console.info('MsgSafeChatAPI.decryptBase64Message: decrypt binary message error - ', e, encryptedBase64)
    }
    return result
  }

  /**
   * Send json of handshake payload over the websocket.
   *
   * Message is serialised as JSON, if possible.
   *
   * @param message
   */
  sendHandShakePayload (message) {
    if (this._manuallyClosed || this._socketState !== 1) return

    try {
      if (typeof message === 'object') {
        message = JSON.stringify(message)
      }
    } catch (e) {}

    if (this._manuallyClosed || this._socketState !== 1) return

    this.socket.send(message)
    this.handshakeStarted = true
  }

  /**
   * Send json of raw payload(not encrypted) over the websocket.
   *
   * Message is serialised as JSON, if possible.
   *
   * @param payload
   */
  sendRawPayload (payload, trackSequence = true) {
    if (this._manuallyClosed || this._socketState !== 1) return

    return new Promise((resolve, reject) => {
      const seq = payload.seq_id || uuidv1()
      if (trackSequence) {
        payload.seq_id = seq

        console.info('MsgSafeChatAPI: sending raw payload - ', payload)
      }

      try {
        if (typeof payload === 'object') {
          payload = JSON.stringify(payload)
        }
      } catch (e) {}

      if (this._manuallyClosed || this._socketState !== 1) {
        // reject()
        return
      }

      this.socket.send(payload)

      if (trackSequence) {
        this._registerForSeq(seq, [resolve, payload])
      } else {
        resolve()
      }
    })
  }

  /**
   * Returns a promise that resolves when the response for the sent
   * payload is received on socket.
   *
   * @param payload
   * @returns {Promise}
   */
  sendRequest (payload) {
    if (this._manuallyClosed || this._socketState !== 1) {
      console.info('MsgSafeChatAPI: manually closed, refuse to send - ', payload)
      return
    }

    return new Promise((resolve, reject) => {
      payload.seq_id = payload.seq_id || uuidv1()

      // console.info('MsgSafeChatAPI: sending payload - ', payload)
      this.encryptMessageAsBase64(payload).then((p) => {
        this._registerForSeq(payload.seq_id, [resolve, payload])
        if (this._manuallyClosed || this._socketState !== 1) {
          console.info('MsgSafeChatAPI: manually closed, refuse to send - ', payload)
          // reject()
          return
        }
        this.socket.send(p)
      })
    })
  }

  /**
   * Returns a promise that resolves just after send request. to make clean queue of cb
   *
   * @param payload
   * @returns {Promise}
   */
  sendRequestWithoutResponse (payload) {
    if (this._manuallyClosed || this._socketState !== 1) {
      console.info('MsgSafeChatAPI: manually closed, refuse to send - ', payload)
      return
    }

    return new Promise((resolve, reject) => {
      payload.seq_id = payload.seq_id || uuidv1()

      console.info('MsgSafeChatAPI: sending payload without waiting for response - ', payload)
      this.encryptMessageAsBase64(payload).then((p) => {
        if (this._manuallyClosed || this._socketState !== 1) {
          console.info('MsgSafeChatAPI: manually closed, refuse to send - ', payload)
          this._registerForSeq(payload.seq_id, [resolve, payload])
          // reject()
          return
        }
        resolve(this.socket.send(p))
      })
    })
  }

  close (isManuallyClosed = true) {
    if (!this.socket) return
    this._manuallyClosed = isManuallyClosed
    this._socketState = 3

    if (isManuallyClosed) {
      this.socket.onopen = null
      this.socket.removeEventListener('message', this._mainMessageHandler)
    }
    this.socket.close(1000, '', { keepClosed: isManuallyClosed, fastClose: true })
  }
}
