import { put, call, select } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'

import { callAPI, buildApiReadPayload } from '../APISagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/IdentityRedux'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

export function * fetch ({ requestType: _requestType }) {
  const isRN = yield select(s => s.device.isReactNative)
  const shouldUseCache = isRN
  try {
    const searchConfig = {
      type: 'search_or',
      columns: ['identity_email', 'identity_display_name']
    }
    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.identityClearSearchData, [], { order: 'identity_last_activity_on' }
    )
    if (isRequestUnnecessary) {
      return
    }
    yield put(Actions.identityRequest(requestType))
    const response = yield callAPI('Identities', payload)
    const successActionCreator = shouldUseCache ? Actions.identitySuccessForCache : Actions.identitySuccess
    yield put(successActionCreator(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch']))
    yield put(Actions.identityFailure(err))
  }
}

export function * create ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('CreateIdentity', payload)
    // ax.form.createSuccess(ax.EVENTS.IDENTITY_FORM, { Region: payload.region })
    if (typeof resolve === 'function') {
      resolve(response.data)
    }
    yield put(Actions.identityCreateSuccess(response.data))
  } catch (e) {
    // ax.form.createError(ax.EVENTS.IDENTITY_FORM, e.message, e.code)
    if (typeof reject === 'function') {
      reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-create'])) }))
    }
  }
}

export function * edit ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('EditIdentity', payload)
    // ax.form.editSuccess(ax.EVENTS.IDENTITY_FORM, { Region: payload.region, ID: payload.id, 'Strip HTML': payload.strip_html, 'Allow New Contacts': payload.auto_create_contact, Forward: payload.http_pickup, 'Encrypt ESP PGP': payload.encrypt_esp_pgp, 'Encrypt ESP SMIME': payload.encrypt_esp_smime, 'Forward Prefix Origin Flag': payload.country_flag_emoji, 'Signature Reply': payload.include_signature_reply, 'Signature Compose': payload.include_signature_compose })
    if (typeof resolve === 'function') {
      resolve()
    }
    yield put(Actions.identityEditSuccess(response.data))
  } catch (e) {
    // ax.form.editError(ax.EVENTS.IDENTITY_FORM, e.message, e.code)
    if (typeof reject === 'function') {
      reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update'])) }))
    }
  }
}

export function * remove ({ payload, resolve, reject }) {
  const id = payload.id
  try {
    yield callAPI('DeleteIdentity', payload)
    // ax.delete(ax.EVENTS.IDENTITY)
    yield put(Actions.identityRemoveSuccess(id, payload))
    if (typeof resolve === 'function') {
      resolve()
    }
  } catch (e) {
    console.error('Delete API request failed - ', e)
    yield put(Actions.identityRemoveFailure(id, payload))
    if (typeof reject === 'function') {
      reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-remove'])) }))
    }
  }
}
