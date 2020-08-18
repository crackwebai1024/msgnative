import { put, call } from 'redux-saga/effects'

import { callAPI, buildApiReadPayload } from './APISagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/PaymentHistoryRedux'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

export function * fetch ({ requestType: _requestType }) {
  try {
    const searchConfig = null
    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.paymentHistoryClearSearchData, [], { order: 'created_on' }
    )

    if (isRequestUnnecessary) {
      return
    }
    yield put(Actions.paymentHistoryRequest(requestType))
    const response = yield callAPI('PaymentHistory', payload)
    yield put(Actions.paymentHistorySuccess(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch-payment-history']))
    yield put(Actions.paymentHistoryFailure(err))
  }
}
