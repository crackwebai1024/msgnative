import { put, call } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'

import { callAPI, buildApiReadPayload } from './APISagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/CryptoRedux'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

import { getError } from 'commons/Lib/Utils'

export function * fetch ({ requestType: _requestType }) {
  try {
    const searchConfig = {
      type: 'search',
      columns: ['fingerprint']
    }
    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.cryptoClearSearchData
    )
    if (isRequestUnnecessary) {
      return
    }
    yield put(Actions.cryptoRequest(requestType))
    const response = yield callAPI('Crypto', payload)
    yield put(Actions.cryptoSuccess(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch']))
    yield put(Actions.cryptoFailure(err))
  }
}

export function * getKey ({ payload, resolve, reject }) {
  try {
    const newPayload = {
      filter: payload
    }
    const response = yield callAPI('Crypto', newPayload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(Actions.cryptoGetKeySuccess(response.data))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['request-failed']))
    yield put(Actions.cryptoFailure(err))
  }
}

export function * userEmailSmime ({ payload, resolve, reject }) {
  try {
    const r = yield callAPI('CryptoGenerateSmime', payload)
    // ax.action(ax.EVENTS.FORWARD_ADDRESS, 'SMIME Request')
    resolve(r.data)
    yield put(Actions.cryptoUserEmailSmimeSuccess(r.data))

    // refresh useremail cache
    const upayload = { filter: { id: r.data.useremail_id } }
    const uresponse = yield callAPI('UserEmail', upayload)
    yield put(UserEmailActions.useremailSuccess(uresponse.data))
  } catch (e) {
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['request-failed'])) }))
  }
}

/*
export function * create ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('CreateTemplate', payload)
    resolve()
    yield put(Actions.templateCreateSuccess(response.data))
  } catch (e) {
    reject(new SubmissionError({_error: getError(e, 'Failed to create. Please try again.')}))
  }
}

export function * edit ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('EditTemplate', payload)
    resolve()
    yield put(Actions.templateEditSuccess(response.data))
  } catch (e) {
    reject(new SubmissionError({_error: getError(e, 'Failed to update. Please try again.')}))
  }
}

export function * remove ({ payload }) {
  try {
    yield callAPI('DeleteTemplate', payload)
  } catch (e) {
    console.error('Delete contact API request failed - ', e)
  }
}
*/
