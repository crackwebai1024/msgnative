import { put, call, select } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/ContactRedux'
import m from 'commons/I18n/app/APIErrors'
// import ax from 'commons/Services/Analytics/index'
import { callAPI, buildApiReadPayload } from '../APISagas'

export function * fetch ({ requestType: _requestType }) {
  try {
    const isRN = yield select(s => s.device.isReactNative)
    const filterIdentityIds = yield select(s => s.contact.filterIdentityIds)
    const shouldUseCache = isRN && !filterIdentityIds.length

    const searchConfig = {
      type: 'search_or',
      columns: ['contact_email', 'contact_display_name']
    }

    const filterConfig = [
      { stateKey: 'filterIdentityIds', payloadKey: 'identity_id' }
    ]

    const basePayloadOverride = { order: 'display_name', sort: 'asc' }

    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.contactClearSearchData, filterConfig, basePayloadOverride
    )
    if (isRequestUnnecessary) {
      return
    }

    yield put(Actions.contactRequest(requestType))
    const endpointName = isRN ? 'ContactsUniqueNative' : 'ContactsUnique'
    const response = yield callAPI(endpointName, payload)
    const successActionCreator = shouldUseCache ? Actions.contactSuccessForCache : Actions.contactSuccess
    yield put(successActionCreator(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch-contact']))
    yield put(Actions.contactFailure(err))
  }
}

export function * create ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('CreateContact', payload)
    // ax.form.createSuccess(ax.EVENTS.CONTACT_FORM)
    typeof resolve === 'function' && resolve()
    yield put(Actions.contactCreateSuccess(response.data))
  } catch (e) {
    // ax.form.createError(ax.EVENTS.CONTACT_FORM, e.message, e.code)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-create-contact'])) }))
  }
}

export function * edit ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('EditContact', payload)
    // ax.form.editSuccess(ax.EVENTS.CONTACT_FORM)
    typeof resolve === 'function' && resolve()
    yield put(Actions.contactEditSuccess(response.data))
  } catch (e) {
    // ax.form.editError(ax.EVENTS.CONTACT_FORM, e.message, e.code)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update-contact'])) }))
  }
}

export function * remove ({ payload, resolve, reject }) {
  // NOTE: We key by contact.email since contacts are deduped
  const id = payload.email
  try {
    yield callAPI('DeleteContactEmail', payload)
    // ax.delete(ax.EVENTS.CONTACT)
    yield put(Actions.contactRemoveSuccess(id))
    typeof resolve === 'function' && resolve()
  } catch (e) {
    yield put(Actions.contactRemoveFailure(id, payload))
    console.error('Delete contact API request failed - ', e)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-remove-contact'])) }))
  }
}
