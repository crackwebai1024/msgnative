import { takeLatest } from 'redux-saga/effects'

import CallHistoryActions, { CallHistoryTypes } from 'commons/Redux/CallHistoryRedux'

import * as callHistorySagas from './index'

export default [
  /* ------------- All Call History ------------- */

  // takeLatest(
  //   [
  //     CallHistoryTypes.CALL_HISTORY_FETCH,
  //     CallHistoryTypes.CALL_HISTORY_SET_SEARCH_QUERY,
  //     CallHistoryTypes.CALL_HISTORY_CLEAR_SEARCH_DATA,
  //     CallHistoryTypes.CALL_HISTORY_SET_IS_MISSED_FILTER
  //   ],
  //   callHistorySagas.callHistoryFetch
  // ),
  takeLatest(
    CallHistoryTypes.CALL_HISTORY_DELETE_REQUEST,
    callHistorySagas.updateSelectedCallItem,
    'delete',
    {},
    CallHistoryActions.callHistoryDeleteSuccess,
    CallHistoryActions.callHistoryDeleteFailure
  )
]
