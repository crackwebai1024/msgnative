import WebSocketClient from 'reconnecting-websocket'

import { randRange } from 'commons/Lib/Utils'

const isFunction = f => typeof f === 'function'

const invokeIfExists = (f, ...args) => {
  if (isFunction(f)) {
    return f(args)
  }
}

/**
 * Websocket protocol layer for MsgSafe API.
 *
 * // todo: add sanity check, do echo call with random data, check every x seconds and update isAlive
 */
export default class MsgSafeAPIWebsocket {
  static backOffConfig = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1500,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 3000,
    maxRetries: Infinity,
    debug: false
  }

  constructor (url, protocol = 'api', reconnectCallback) {
    this.url = url
    this.protocol = protocol

    this.ws = null
    this.isAlive = false
    this.seqToRequestMap = {}
    this.handshakeToken = null
    this.registerProto = null

    this.reconnectCallback = reconnectCallback
  }

  /**
   * Initialise the websocket connection.
   *
   * @param {Function} openCb - Websocket onopen callback.
   * @param {Function} closeCb - Websocket onclose callback.
   * @param {Function} errCb - Websocket onerror callback.
   * @param {Function} messageCb - Websocket onmessage callback.
   */
  initSocket (openCb = null, closeCb = null, errCb = null, messageCb = null) {
    if (!this.url || !this.protocol) {
      console.error('missing wss configuration')
      return
    }

    this.ws = new WebSocketClient(this.url, this.protocol, MsgSafeAPIWebsocket.backOffConfig)
    console.info('created the websocket...')

    if (!this.ws) {
      console.error('failed to initiate WebSocket')
      return
    }

    // track if the open callback has already been called
    let triedOnce

    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        if (triedOnce) {
          console.info('Websocket is now re-connected...')
          typeof this.reconnectCallback === 'function' && this.reconnectCallback('protocol_api', this)
        } else {
          console.info('Websocket is now connected...')
          invokeIfExists(openCb)
          invokeIfExists(resolve)
          triedOnce = true
        }
      }

      this.ws.onclose = () => {
        console.info('Websocket is now closed...')
        this.ws.close()
        this.isAlive = false
        triedOnce = true
        invokeIfExists(closeCb)
        invokeIfExists(reject)
      }

      this.ws.onerror = (e) => {
        console.info(`Websocket just shat... ${e.message}`)
        this.isAlive = false
        triedOnce = true
        invokeIfExists(reject, e.message)
        invokeIfExists(errCb)
      }

      this.ws.onmessage = (message) => {
        this._listenToMessages(message)
        invokeIfExists(messageCb, message)
      }
    })
  }

  _registerForSeq (seq, cb) {
    if (isFunction(cb)) {
      this.seqToRequestMap[seq] = cb
    }
  }

  _getCbForSeq (seq) {
    return this.seqToRequestMap[seq]
  }

  _deregisterForSeq (seq) {
    if (this.seqToRequestMap[seq]) {
      delete this.seqToRequestMap[seq]
    }
  }

  // todo: implement timeout
  _listenToMessages (message) {
    const data = JSON.parse(message.data)
    const cb = this._getCbForSeq(data.seq)
    if (cb && isFunction(cb)) {
      cb(message.data)
      this._deregisterForSeq(data.seq)
    }
  }

  sendReq (payload) {
    return new Promise((resolve, reject) => {
      const randomSeq = randRange(1, 2147483647)
      this._registerForSeq(randomSeq, resolve)
      payload.seq = randomSeq
      this.ws.send(JSON.stringify(payload))
    })
  }
}
