import qs from 'qs'
import request from 'superagent'
import { clone } from 'ramda'
import { call, race, select, take } from 'redux-saga/effects'

import MsgSafeAPIEndpoints, { MethodName } from './endpoints'
import { createSignature } from './Utils/signature'
import { cfg as APIConfig } from 'commons/Sagas/APISagas'

import appConfig from 'app/Config/App'
import { isLoggedIn } from 'commons/Selectors/User'
import { UserTypes } from 'commons/Redux/UserRedux'

// Modify timeout error message
request.Request.prototype._timeoutError = function () {
  const err = new Error('The request timed out!')
  err.timeout = this._timeout
  this.callback(err)
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
function _prepPayload (payload) {
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

/**
 * Parse the API response and return.
 *
 * @param {object} data - The response from the server.
 * @returns {object|null} - Returns the parsed data or null if there's a problem
 */
function _parseAPIResponse (data) {
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

function * _sendRequest (url, data) {
  console.info('Sending HTTP request - ', data)

  const method = MethodName[data.type]
  const endpointUrl = `${url}/${data.cmd}`
  const isReactNative = yield select(s => s.device.isReactNative)

  let r = request(method, endpointUrl)
    .set('Accept', 'application/json')
    .set('X-MsgSafe-NewApp', '1')
    .timeout(appConfig.httpTimeout)

  if (isReactNative) {
    r.set('X-MsgSafe-IsNative', '1')
  }

  if (data.payload) {
    if (method === 'GET' || method === 'HEAD') {
      // Skipping uri encoding as the server doesn't like it when encoded
      // ^ turning encode back on for now (otherwise we get unicode at api
      // for certain bytes -bblack
      r = r.query(qs.stringify(_prepPayload(data.payload), { encode: true }))
    } else {
      r = r.send(data.payload)
    }
  }

  if (data.sig) {
    r = r.set('X-MsgSafe-Signed', data.sig)
  }
  let err = null
  let response = null
  let logout = null
  try {
    const raceRes = yield race({
      response: call([r, r.then]),
      logout: take(UserTypes.LOGOUT)
    })

    response = raceRes.response
    logout = raceRes.logout
    if (logout) {
      r.abort()
    }
  } catch (e) {
    err = e
    response = e ? e.response || e : e
  }

  if (err || !response || !response.ok) {
    return {
      error: response && (response.body || response.message),
      http_code: response && response.status
    }
  }
  return {
    http_code: response.status,
    data: response.body
  }
}

/**
   * Call an API endpoint.
   *
   * @param {object} data - The request payload.
   * @param {boolean} signReq - Whether to sign the request or not.
   */
function * _callAPI (data, signReq) {
  // Form the payload
  const payload = data
  if (signReq) {
    const userData = yield select(s => s.user.data)
    if (!isLoggedIn({ data: userData })) {
      return {
        error: true,
        status_code: 401
      }
    }
    payload.sig = createSignature(userData.access_id, userData.secret_token)
  }
  const response = yield call(_sendRequest, APIConfig.httpUrl, payload)
  if (response.error) {
    return response
  }
  try {
    const parsed = _parseAPIResponse(response)
    console.info('Parsed response - ', parsed)
    return parsed || { error: true }
  } catch (e) {
    console.error(`Error parsing the response - ${e.message}`)
    return { error: 'Error parsing the response' }
  }
}

export function * msgsafeAPICall (endpoint, payload) {
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
  const res = yield call(_callAPI, _params, spec.signatureRequired)
  return res
}
