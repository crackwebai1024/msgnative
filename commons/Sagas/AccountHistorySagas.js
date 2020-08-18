import { put, call } from 'redux-saga/effects'
import { formatMessage } from 'commons/I18n/sagas'
import { callAPI, buildApiReadPayload } from './APISagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/AccountHistoryRedux'
import { getError } from 'commons/Lib/Utils'
import m from 'commons/I18n/app/APIErrors'

export function * fetch ({ requestType: _requestType }) {
  try {
    const searchConfig = null
    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.accounthistoryClearSearchData
    )
    payload.order = 'created_on'
    if (isRequestUnnecessary) {
      return
    }
    yield put(Actions.accounthistoryRequest(requestType))
    const response = yield callAPI('AccountHistory', payload)
    yield put(Actions.accounthistorySuccess(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch-contact']))
    yield put(Actions.accounthistoryFailure(err))
  }
}
