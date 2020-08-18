import qs from 'qs'
import request from 'superagent'
import { clone } from 'ramda'

import { MethodName } from './endpoints'
import appConfig from 'app/Config/App'

// Modify timeout error message
request.Request.prototype._timeoutError = function () {
  const err = new Error('The request timed out!')
  err.timeout = this._timeout
  this.callback(err)
}

/**
 * HTTP protocol layer for MsgSafe API.
 */
export default class MsgSafeAPIHTTP {
  constructor (url) {
    this.url = url
    this.isReactNative = false
  }

  /**
   * Allows you to include the `X-Msgsafe-IsNative` header into each request
   * so that server can distinguish requests from ios/android app from browser
   * ones
   * @param {boolean} flag Weather or not the environment is a react-native
   */
  isNative (flag = true) {
    this.isReactNative = flag
  }

  /**
   * Iterates over the payload object and stringifies any nested objects.
   *
   * This is done so that superagent or qs doesn't serializes the nested objects
   * into query param arrays.
   *
   * @param payload
   * @returns {*}
   * @private
   */
  _prepPayload (payload) {
    const _payload = clone(payload)
    for (const key in _payload) {
      // If the value for the key is an object, replace it with
      // the stringified value
      if (_payload.hasOwnProperty(key) && typeof _payload[key] === 'object') {
        _payload[key] = JSON.stringify(_payload[key])
      }
    }

    // Replacing the `include_group` key with the `include_only_group` key
    // as the former seems to only work for WSS and the  latter works
    // for HTTP requests.
    if (_payload.include_group) {
      _payload.include_only_group = _payload.include_group
      delete _payload.include_group
    }

    return _payload
  }

  sendReq (data) {
    console.info('Sending HTTP request - ', data)

    return new Promise((resolve, reject) => {
      const method = MethodName[data.type]
      const endpointUrl = `${this.url}/${data.cmd}`

      let r = request(method, endpointUrl)
        .set('Accept', 'application/json')
        .set('X-MsgSafe-NewApp', '1')
        .timeout(appConfig.httpTimeout)

      if (this.isReactNative) {
        r.set('X-MsgSafe-IsNative', '1')
      }

      if (data.payload) {
        if (method === 'GET' || method === 'HEAD') {
          // Skipping uri encoding as the server doesn't like it when encoded
          // ^ turning encode back on for now (otherwise we get unicode at api
          // for certain bytes -bblack
          r = r.query(qs.stringify(this._prepPayload(data.payload), { encode: true }))
        } else {
          r = r.send(data.payload)
        }
      }

      if (data.sig) {
        r = r.set('X-MsgSafe-Signed', data.sig)
      }

      r.end((err, res) => {
        console.info('Complete res - ', res)
        if (err || !res || !res.ok) {
          reject(res && res.body)
        } else {
          resolve({
            http_code: res.status,
            data: res.body
          })
        }
      })
    })
  }
}
