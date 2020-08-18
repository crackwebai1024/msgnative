import { put } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'

import { callAPI } from './APISagas'
import Actions from 'commons/Redux/PaymentRedux'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

export function * fetch () {
  try {
    const response = yield callAPI('Cards')
    yield put(Actions.paymentSuccess(response.data))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch-payment-methods']))
    yield put(Actions.paymentFailure(err))
  }
}

export function * create ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('AddCard', payload)
    // ax.form.createSuccess(ax.EVENTS.PAYMENT_CREDIT_CARD)
    typeof resolve === 'function' && resolve()
    yield put(Actions.paymentCreateSuccess(response.data))
  } catch (e) {
    // ax.form.createError(ax.EVENTS.PAYMENT_CREDIT_CARD, e.message, e.code)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-create-payment-method'])) }))
  }
}

export function * remove ({ payload, resolve, reject }) {
  try {
    yield callAPI('DeleteCard', payload)
    // ax.delete(ax.EVENTS.PAYMENT_CREDIT_CARD)
    yield put(Actions.paymentRemoveSuccess(payload.id))
    typeof resolve === 'function' && resolve()
  } catch (e) {
    console.error('Delete payment API request failed - ', e)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update-payment-method'])) }))
  }
}

/**
 * Used to set the default payment method.
 */
export function * edit ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('UpdateCard', { id: payload.id, is_default: true })
    // ax.form.editSuccess(ax.EVENTS.PAYMENT_CREDIT_CARD)
    typeof resolve === 'function' && resolve()
    // The api returns string "True" instead of a boolean
    if (response.data.is_default === 'True') {
      yield put(Actions.paymentEditSuccess({ id: response.data.id, is_default: true }))
    } else {
      // ax.form.editError(ax.EVENTS.PAYMENT_CREDIT_CARD, 'Could not set the default card.')
    }
  } catch (e) {
    // ax.form.editError(ax.EVENTS.PAYMENT_CREDIT_CARD, e.message, e.code)
    typeof reject === 'function' && reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update-contact'])) }))
  }
}
