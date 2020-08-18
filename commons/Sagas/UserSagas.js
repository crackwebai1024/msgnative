import { put, call, select } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'
import { callAPI } from './APISagas'
import { getError } from 'commons/Lib/Utils'
import UserActions from '../Redux/UserRedux'
import { isLoggedIn } from '../Selectors/User'
import { createSignature } from '../Services/API/Utils/signature'
import { cleanupChatSocket, chatAPI } from './ChatSagas/WebSocket'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

/**
 * A saga that acts upon the login action and makes the API call.
 * Takes resolve and reject callbacks from a promise and uses
 * them based on the API response.
 * Upon successful login, it also dispatches the loginSuccess action
 * along with the user data object.
 *
 * @param username
 * @param password
 * @param resolve
 * @param reject
 */
export function * login ({
  username, password, resolve, reject
}) {
  try {
    const response = yield callAPI('Login', { username, password })
    // ax.service.identify(response.data.mp)
    // ax.service.people.set('Last Activity', new Date())
    // const hash = yield select(s => s.app.build)
    // ax.form.success(ax.EVENTS.LOGIN, { ClientApp: 'Web', Commit: hash })

    if (typeof resolve === 'function') {
      resolve()
    }

    yield put(UserActions.updateUser(response.data))
    yield put(UserActions.loginSuccess(response.data))
  } catch (e) {
    // ax.form.error(ax.EVENTS.LOGIN, e.message, e.code)
    const err = getError(e, yield formatMessage(m['unable-to-login']))
    yield put(UserActions.loginError(err))

    if (typeof reject === 'function') {
      reject(new SubmissionError({ _error: err }))
    }
  }
}

/**
 * Updates the user data in redux store and the API credentials.
 *
 * @param data
 */
export function * updateUser ({ data }) {
  if (!data) {
    data = yield select(s => s.user.data)
  }
}

/**
 * A saga that acts upon the logoutRequest action by switching to the
 * `auth` screen.
 */
export function * logoutRequest () {
  let deviceUuid = yield select(s => s.device.device_uuid)
  if (deviceUuid && chatAPI.ready) {
    try {
      // delete the device id on server
      yield call([chatAPI, chatAPI.sendRequest], {
        cmd: '/device/delete',
        args: { device_uuid: deviceUuid }
      })
      console.info('Remove Device:', deviceUuid)
    } catch (e) {
      console.info('`/device/delete` command failed!', e)
    }
  }

  yield call(cleanupChatSocket)

  yield put(UserActions.logout())
}

/**
 * A saga that acts upon the checkUsername action and makes the API call
 * that checks for availability of the username on serverside.
 *
 * @param username
 * @param resolve
 * @param reject
 */
export function * checkUsername ({ username, resolve, reject }) {
  try {
    yield call(callAPI, 'CheckUsername', { username })
    typeof resolve === 'function' && resolve()
  } catch (e) {
    if (e && e.status && e.code) {
      const message = yield formatMessage(m[e.code])
      typeof reject === 'function' && reject({ username: message })
    } else {
      typeof resolve === 'function' && resolve()
    }
  }
}

export function * checkEmail ({ email, resolve, reject }) {
  try {
    yield callAPI('UserEmailValid', { email })
    resolve()
  } catch (e) {
    if (e && e.status && e.code) {
      const message = yield formatMessage(m[e.code])
      reject({ email: message })
    } else {
      resolve()
    }
  }
}

export function * checkEmailForIdentity ({ email, resolve, reject }) {
  try {
    yield callAPI('ValidateIdentity', { email })
    resolve()
  } catch (e) {
    if (e && e.status && e.code) {
      const message = yield formatMessage(m[e.code])
      reject({ email: message })
    } else {
      resolve()
    }
  }
}

export function * checkEmailForESP ({ email, resolve, reject }) {
  try {
    yield callAPI('CheckEmailForESP', { email })
    resolve()
  } catch (e) {
    if (e && e.status && e.code) {
      let message = '!'
      if (e.code === 'identity-email-address-not-available') {
        message = yield formatMessage(m['identity-email-not-valid-for-esp'])
      } else {
        message = yield formatMessage(m[e.code])
      }
      reject({ email: message })
    } else {
      resolve()
    }
  }
}

export function * signup ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('Signup', payload)
    // ax.service.alias(response.data.mp)
    // ax.service.people.set('Last Activity', new Date())
    // const hash = yield select(s => s.app.build)
    // ax.form.success(ax.EVENTS.SIGNUP, { ClientApp: 'Web', Commit: hash })
    // ax.track(ax.EVENTS.ONBOARDING_STARTED)
    yield put(UserActions.updateUser(response.data))
    yield put(UserActions.signupSuccess())
    resolve()
  } catch (e) {
    // ax.form.error(ax.EVENTS.SIGNUP, e.message, e.code)
    if (e.code === 'invalid-client-id' || e.code === 'invalid-captcha-id') {
      reject(new SubmissionError({ captcha: yield formatMessage(m.captchaIncorrect) }))
    } else {
      reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['unable-to-signup'])) }))
    }
  }
}

export function * forgotUsername ({ payload, resolve, reject }) {
  try {
    yield callAPI('RequestSendUsername', payload)
    // ax.form.success(ax.EVENTS.FORGOT_USERNAME)
    resolve()
  } catch (e) {
    // ax.form.error(ax.EVENTS.FORGOT_USERNAME, e.message, e.code)
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-send-username'])) }))
  }
}

export function * requestPasswordResetRequest ({ payload, resolve, reject }) {
  try {
    yield callAPI('RequestPasswordReset', payload)
    // ax.form.success(ax.EVENTS.RESET_PASSWORD_REQUEST)
    resolve()
  } catch (e) {
    // ax.form.error(ax.EVENTS.RESET_PASSWORD_REQUEST, e.message, e.code)
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-request-password-reset'])) }))
  }
}

export function * requestPasswordReset ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('PasswordReset', payload)
    // ax.form.success(ax.EVENTS.RESET_PASSWORD)
    resolve()
  } catch (e) {
    // ax.form.error(ax.EVENTS.RESET_PASSWORD, e.message, e.code)
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-reset-password'])) }))
  }
}

export function * updateUserAccount ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('UpdateUserAccount', payload)
    if (payload.username) {
      // ax.form.success(ax.EVENTS.SECURITY_PROFILE, { Action: 'Username Change' })
    } else if (payload.old_password && payload.password) {
      // ax.form.success(ax.EVENTS.SECURITY_PROFILE, { Action: 'Password Change' })
    } else if (payload.display_name) {
      // ax.form.success(ax.EVENTS.USER_PROFILE, { Region: payload.display_name, Locale: payload.locale, Timezone: payload.timezone })
    }
    typeof resolve === 'function' && resolve()
    yield put(UserActions.updateUser(response.data))
    yield put(UserActions.updateAccountSuccess(response.data))
  } catch (e) {
    if (payload.username) {
      // ax.form.error(ax.EVENTS.SECURITY_PROFILE, e.message, e.code, { Action: 'Username Change' })
    } else if (payload.old_password && payload.password) {
      // ax.form.error(ax.EVENTS.SECURITY_PROFILE, e.message, e.code, { Action: 'Password Change' })
    } else if (payload.display_name) {
      // ax.form.error(ax.EVENTS.USER_PROFILE, e.message, e.code)
    }
    typeof reject === 'function' &&
      reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update-profile'])) }))
  }
}

export function * refreshProfileRequest ({ payload, resolve, reject }) {
  try {
    const r = yield callAPI('UserProfile', payload)
    typeof resolve === 'function' && resolve()
    yield put(UserActions.refreshProfileSuccess(r.data))
  } catch (e) {
    console.log('refreshProfileRequest caught -', e)
  }
}

/**
 * Makes two api calls, one to `users` and other to `users/state`.
 *
 * @param payload
 * @param resolve
 * @param reject
 */
export function * updateIdentitySettings ({ payload, resolve, reject }) {
  try {
    const userAccountResponse = yield callAPI('UpdateUserAccount', {
      is_default_http_pickup: payload.is_default_http_pickup,
      is_default_strip_html: payload.is_default_strip_html,
      is_default_auto_create_contact: payload.is_default_auto_create_contact
    })
    yield put(UserActions.updateAccountSuccess(userAccountResponse.data))

    const userAccountStateResponse = yield callAPI('UpdateUserAccountState', {
      state: { pref_domainname: payload.pref_domainname }
    })
    yield put(UserActions.updateAccountStateSuccess(userAccountStateResponse.data))

    resolve()
  } catch (e) {
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update-identity-settings'])) }))
  }
}

export function * generateSignature () {
  const user = yield select(s => s.user)
  if (isLoggedIn(user)) {
    return createSignature(user.data.access_id, user.data.secret_token)
  }
}
