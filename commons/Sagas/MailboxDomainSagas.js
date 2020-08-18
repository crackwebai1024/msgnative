import { put, call } from 'redux-saga/effects'
// import { SubmissionError } from 'redux-form'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

import { callAPI, buildApiReadPayload } from './APISagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/MailboxDomainRedux'
import { getError } from 'commons/Lib/Utils'

export function * fetch ({ requestType: _requestType }) {
  try {
    const searchConfig = {
      type: 'search',
      columns: ['name']
    }

    const filterConfig = [
      { stateKey: 'filterIdentityIds', payloadKey: 'identity_id' }
    ]

    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.mailboxDomainClearSearchData, filterConfig
    )
    if (isRequestUnnecessary) {
      return
    }
    yield put(Actions.mailboxDomainRequest(requestType))
    const response = yield callAPI('MailboxDomains', payload)
    yield put(Actions.mailboxDomainSuccess(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch-domains']))
    yield put(Actions.mailboxDomainFailure(err))
  }
}
