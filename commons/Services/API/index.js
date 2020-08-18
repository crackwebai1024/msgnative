import { createSignature } from './Utils/signature'
import MsgSafeAPIHTTP from './_http'
import MsgSafeAPIWebsocket from './_websocket'
import MsgSafeAPIEndpoints from './endpoints'

const DEFAULT_PROTOCOL = 'api'

// const DEFAULT_HTTP_URL = 'https://api-devkit.msgsafe.io/api/v3.0.1'
const DEFAULT_HTTP_URL = 'https://api-stage.msgsafe.io/api/v3.0.1'
// const DEFAULT_HTTP_URL = 'wss://stage-3-us.msgsafe.io:443'
// const DEFAULT_HTTP_URL = 'https://api.msgsafe.io/api/v3.0.1'

/*
 * WARNING: ALL WSS FUNCTIONS DEPRECATED AND MOVED TO CHAT
 *
 * */
class MsgSafeAPI {
  /**
   * Constructor for MsgSafeAPI.
   *
   * @constructor
   * @param {number} poolSize - Pool size.
   * @param {object|null} config - The config object containing `url` and `protocol` values.
   *
   *
   * todo: see why wss isn't used after dc and rc
   */
  constructor (poolSize = 1, config = null) {
    this.config = config || { httpUrl: DEFAULT_HTTP_URL, protocol: DEFAULT_PROTOCOL }
    this.poolSize = poolSize

    this.userAccessId = null
    this.userAccessToken = null
    this.device = null

    this._httpAPI = null

    this._isWSSPoolReady = false
    this._shutdownState = false

    this._wssAPIPoolConnections = []

    this.reconnectCallback = this.bootstrapWSSConnection.bind(this)

    console.info('MsgSafeAPI initalised...')
  }

  shutdown () {
    this._shutdownState = true
    if (!this._wssAPIPoolConnections || !this._wssAPIPoolConnections.length) { return }
    try {
      const numpool = this._wssAPIPoolConnections.length
      for (let i = 0; i < numpool; i++) {
        const ptr = this._wssAPIPoolConnections[i]
        if (ptr.ws !== undefined) {
          console.info(`*shutdown* wss index=${i}`)
          ptr.ws.close()
        }
      }
    } catch (e) {
      console.info('*shutdown caught -', e)
    }
  }

  setCredentials (userAccessId, userAccessToken) {
    this.userAccessId = userAccessId
    this.userAccessToken = userAccessToken
  }

  setDevice (device) {
    this.device = device
  }

  clearCredentials () {
    console.info('Clearing credentials...')
    this.userAccessId = null
    this.userAccessToken = null

    this._wssAPIPoolConnections = []
    this._isWSSPoolReady = false
  }

  wssPoolInit (protocol = 'protocol_api') {
    this._wssAPIPoolConnections = []
    this._shutdownState = false
    this._setupWSSPool(protocol)
  }

  setupWSSPool (wssProto) {
    if (!wssProto) {
      return
    }
    const msDelay = 1000
    for (let i = 0; i < this.poolSize; i++) {
      setTimeout(this.bootstrapWSSConnection.bind(this), i * msDelay)
    }
  }

  bootstrapWSSConnection (wssProto = 'protocol_api', existingWSS) {
    if (this._shutdownState) {
      return
    }
    if (!wssProto) {
      return
    }
    // Check to see if we have this device in API
    // If API had cleared all devices and sessions, we need to recreate it.
    this.UserDeviceExist({ device_uuid: this.device.device_uuid })
      .then((res) => {
        console.info('UserDeviceExist res=', res)
        this._bootstrapWSSConnection(wssProto, existingWSS)
      })
      .catch((e) => {
        this.CreateUserDevice(this.device)
          .then((res) => {
            console.info('CreateUserDevice success res=', res)
            this._bootstrapWSSConnection(wssProto, existingWSS)
          })
          .catch((e) => {
            console.info('CreateUserDevice caught -', e)
          })
      })
  }

  _bootstrapWSSConnection (wssProto = 'protocol_api', existingWSS) {
    let handShakeToken, newWSS
    if (this._shutdownState) {
      return
    }
    if (!wssProto) {
      return
    }
    // Check to see if we have this device in API
    this.UserDeviceSession({ device_uuid: this.device.device_uuid, wss_proto: wssProto })
      .then((res) => {
        handShakeToken = res.data.handshake_token
        if (!existingWSS) {
          const url = `wss://${res.data.url}:${res.data.port}`
          newWSS = new MsgSafeAPIWebsocket(url, this.config.protocol, this.reconnectCallback)
          console.info('returning newWSS initSocket..')
          return newWSS.initSocket()
        }
      })
      .then(() => {
        console.info('calling UserDeviceSessionConfirm')

        const endpoint = MsgSafeAPIEndpoints.UserDeviceSessionConfirm
        return this.callAPI({
          type: endpoint.type,
          cmd: endpoint.route,
          payload: { handshake_token: handShakeToken }
        }, true, false, existingWSS || newWSS)
      })
      .then(() => {
        if (newWSS) {
          console.info('newWSS is true..')
          newWSS.handshakeToken = handShakeToken
          newWSS.registerProto = wssProto
          newWSS.isAlive = true
          this._wssAPIPoolConnections.push(newWSS)
          this._isWSSPoolReady = true
          console.info(`Websocket #${this._wssAPIPoolConnections.length} bootstrapped and ready to use...`)
        } else {
          existingWSS.isAlive = true
          console.info('Websocket just reconnected and re-authed')
        }
      })
      .catch((e) => {
        console.info('bootstrapWSSConnection error=', e)
      })
  }

  /**
   * Returns the cached instance of MsgSafeAPIWebsocket; creates one if doesn't exist.
   * @return {MsgSafeAPIWebsocket}
   */
  get wssAPI () {
    const randomIndex = Math.floor(Math.random() * this._wssAPIPoolConnections.length)
    console.info(`Using #${randomIndex + 1} WSS connection from the pool...`)
    return this._wssAPIPoolConnections[randomIndex]
  }

  /**
   * Returns the cached instance of MsgSafeAPIHTTP; creates one if doesn't exist.
   * @return {MsgSafeAPIHTTP}
   */
  get httpAPI () {
    if (!this._httpAPI) {
      this._httpAPI = new MsgSafeAPIHTTP(this.config.httpUrl)
    }

    return this._httpAPI
  }

  getActiveProtocol () {
    // If pool is not ready, return http
    if (!this._isWSSPoolReady) return this.httpAPI

    // Pick out a wssAPI instance
    const wssAPI = this.wssAPI
    console.info('getActiveProtocol - picked out a wss - isAlive', wssAPI.isAlive)

    // Return wss if alive, otherwise http
    return wssAPI.isAlive ? wssAPI : this.httpAPI
  }

  /**
   * Call an API endpoint.
   *
   * @param {object} data - The request payload.
   * @param {boolean} signReq - Whether to sign the request or not.
   * @param {boolean} forceHTTP - Force usage of HTTP request.
   * @param {object} protocol - Pass a protocol to use
   * @returns {Promise} - A promise for the request.
   */
  callAPI (data, signReq, forceHTTP = false, protocol = null) {
    // Form the payload
    const payload = data
    if (signReq) {
      payload.sig = createSignature(this.userAccessId, this.userAccessToken)
    }

    protocol = protocol || (forceHTTP ? this.httpAPI : this.getActiveProtocol())

    return new Promise((resolve, reject) => {
      // Send the request
      // console.info('Sending request with payload - ', payload)
      protocol.sendReq(payload).then(
        // Parse the response and resolve/reject based on the result
        (res) => {
          try {
            const parsed = this.parseAPIResponse(res)
            console.info('Parsed response - ', parsed)
            parsed ? resolve(parsed) : reject()
          } catch (e) {
            console.error(`Error parsing the response - ${e.message}`)
            reject({ error: 'Error parsing the response' })
          }
        },
        (err) => {
          console.info('error response - ', err)
          reject(err)
        }
      )
    })
  }

  /**
   * Parse the API response and return.
   *
   * @param {object} data - The response from the server.
   * @returns {object|null} - Returns the parsed data or null if there's a problem
   */
  parseAPIResponse (data) {
    if (!data) return

    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      if (!parsed || !parsed.http_code) return
      return parsed
    } catch (e) {
      console.error(`Error parsing the response - ${e.message}`)
      throw e
    }
  }
}

/**
 * Iterate over the available API endpoints and create methods
 * for each on the MsgSafeAPI class.
 */
(function addEndpointMethods () {
  for (const endpoint in MsgSafeAPIEndpoints) {
    MsgSafeAPI.prototype[endpoint] = function (payload) {
      const spec = MsgSafeAPIEndpoints[endpoint]
      let route = spec.route
      // If the request type is PUT and there's an id on the payload
      // then modify the request path to have the id
      if (payload && payload.id && route.match(/<id>/)) {
        route = route.replace(/<id>/, payload.id)
        delete payload.id
      }
      const _params = {
        cmd: route,
        type: spec.type,
        payload
      }
      return this.callAPI(_params, spec.signatureRequired, spec.forceHTTP)
    }
  }
})()

export default MsgSafeAPI
