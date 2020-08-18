import { put, call, select } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'

import { callAPI, buildApiReadPayload } from './APISagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/DomainRedux'
// import PaymentAction from 'commons/Redux/PaymentRedux'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

export function * fetch ({ requestType: _requestType }) {
  try {
    const searchConfig = {
      type: 'search',
      columns: ['name']
    }

    const filterConfig = [
      { stateKey: 'filterIdentityIds', payloadKey: 'identity_id' }
    ]

    const basePayload = { }

    const slice = yield select(s => s.domain)
    if (slice.searchFilters && slice.searchFilters.is_active) {
      basePayload.limit = 100
    } else {
      basePayload.filter = { is_system_domain: false }
    }
    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.domainClearSearchData, filterConfig, basePayload
    )
    if (isRequestUnnecessary) {
      return
    }
    yield put(Actions.domainRequest(requestType))
    const response = yield callAPI('Domains', payload)
    yield put(Actions.domainSuccess(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch-domains']))
    yield put(Actions.domainFailure(err))
  }
}

export function * create ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('CreateDomain', payload)
    // ax.form.createSuccess(ax.EVENTS.DOMAIN_FORM)
    typeof resolve === 'function' && resolve()
    yield put(Actions.domainCreateSuccess(response.data))
  } catch (e) {
    // ax.form.createError(ax.EVENTS.DOMAIN_FORM, e.message, e.code)
    console.error('Domain create error -', e)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-create-domains'])) }))
  }
}

export function * edit ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('UpdateDomain', payload)
    // ax.form.editSuccess(ax.EVENTS.DOMAIN_FORM)
    typeof resolve === 'function' && resolve()
    yield put(Actions.domainEditSuccess(response.data))
  } catch (e) {
    // ax.form.editError(ax.EVENTS.DOMAIN_FORM, e.message, e.code)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update-domains'])) }))
  }
}

export function * remove ({ payload, resolve, reject }) {
  try {
    const id = payload.id
    yield callAPI('DeleteDomain', payload)
    // ax.delete(ax.EVENTS.DOMAIN)
    yield put(Actions.domainRemoveSuccess(id))
    typeof resolve === 'function' && resolve()
  } catch (e) {
    console.error('Delete domain API request failed - ', e)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-delete-domains'])) }))
  }
}

export function * requestWhois ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('WhoisDomain', payload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(Actions.domainRequestWhoisSuccess(response.data))
  } catch (e) {
    // We want to handle specific cases outside of a SubmissionError.
    typeof reject === 'function' && reject(e)
  //  typeof reject === 'function' && reject(new SubmissionError({_error: getError(e, 'Domain request failed. Please try again.')}))
  }
}

export function * validate ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('ValidateDomain', payload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(Actions.domainValidateSuccess(response.data))
  } catch (e) {
    console.error('Domain Validate error -', e)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['domain-request-failed'])) }))
  }
}

export function * tlds ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('Tlds', payload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(Actions.domainTldSuccess(response.data))
  } catch (e) {
    typeof reject === 'function' && reject(e)
  }
}

export function * suggest ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('SuggestDomains', payload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(Actions.domainSuggestionsSuccess(response.data))
  } catch (e) {
    typeof reject === 'function' && reject(e)
  }
}

export function * purchaseAvailable ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('DomainPurchaseAvailable', payload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(Actions.domainPurchaseAvailableSuccess(response.data))
  } catch (e) {
    typeof reject === 'function' && reject(e)
  }
}

export function * purchase ({ payload, resolve, reject }) {
  try {
    if (payload.ccinfo) {
      const card = yield callAPI('AddCard', { ccinfo: payload.ccinfo })
      if (card.data && card.data.id) {
        payload.ccid = card.data.id
        delete payload.ccinfo
      }
    }
    const response = yield callAPI('DomainPurchase', payload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(Actions.domainPurchaseSuccess(response.data))
  } catch (e) {
    typeof reject === 'function' && reject(e.message)
  }
}
