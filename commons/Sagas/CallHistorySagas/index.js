import { all, call, cancel, fork, select, spawn, put, take, race } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { path, isNil } from 'ramda'
// import uuidv1 from 'uuid/v1'
import { getError } from 'commons/Lib/Utils'
import CallHistoryActions from 'commons/Redux/CallHistoryRedux'
import { ChatTypes } from 'commons/Redux/ChatRedux'
import { UserTypes } from 'commons/Redux/UserRedux'
import { isLoggedIn } from 'commons/Selectors/User'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'
import { chatAPI } from '../ChatSagas'

const RESULTS_LIMIT = 10
const SYNC_INTERVAL = 30000

function * buildPayload (_requestType = {}) {
  const { isRefreshing = false, isPaginating = false } = _requestType || {}

  const args = { limit: RESULTS_LIMIT }

  const slice = yield select(s => s.callHistory)
  const isMissed = !!(slice.searchFilters && slice.searchFilters.is_missed)
  args.is_missed = isMissed
  const requestType = { isRefreshing, isPaginating, isSearching: isMissed }

  if (!isMissed && !isNil(slice.searchResultsData)) {
    yield put(CallHistoryActions.callHistoryClearSearchData())
  }

  return { args, requestType }
}
/**
 * Get call history (either all or missed).
 */
function * getCallHistoryRequest (args, requestType) {
  const { paginateNew = false, isPaginating = false } = requestType || {}

  const isRN = yield select(s => s.device.isReactNative)

  if (isPaginating || paginateNew) {
    const callIds = yield select(s => path(['callHistory', args.is_missed ? 'searchResultsDataOrder' : 'dataOrder'], s))
    if (callIds && callIds.length) {
      if (isPaginating) args.lt_call_id = callIds[callIds.length - 1]
      if (paginateNew) args.gt_call_id = callIds[0]
    }
  }

  if (!chatAPI.ready) {
    const message = yield formatMessage(m['connect-to-internet-and-retry'])
    yield put(CallHistoryActions.callHistoryFailure(message))
    return
  }

  if (paginateNew) {
    yield put(CallHistoryActions.callHistorySyncRequest())
  } else {
    yield put(CallHistoryActions.callHistoryRequest(requestType))
  }

  try {
    const res = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/webrtc/list',
      args
    })

    const successActionCreator = isRN
      ? CallHistoryActions.callHistorySuccessForCache
      : (
        paginateNew
          ? CallHistoryActions.callHistorySyncSuccess
          : CallHistoryActions.callHistorySuccess
      )
    yield put(successActionCreator(res, requestType))
  } catch (e) {
    const message = yield formatMessage(m[args.is_missed ? 'failed-to-fetch-missed-call' : 'failed-to-fetch-call-history'])
    const error = getError(e, message)
    if (paginateNew) {
      yield put(CallHistoryActions.callHistorySyncFailure(error))
    } else {
      yield put(CallHistoryActions.callHistoryFailure(error))
    }
  }
}

export function * callHistoryFetch ({ requestType: _requestType }) {
  const { args, requestType } = yield call(buildPayload, _requestType)
  yield call(getCallHistoryRequest, args, requestType)
}

/**
 * update single for call history records
 *
 * @param endpoint
 * @param args
 * @param successAction
 * @param errorAction
 */
export function * updateSelectedCallItem (endpoint, args, successAction, errorAction, { id, resolve, reject }) {
  try {
    yield call([chatAPI, chatAPI.sendRequest], {
      cmd: `/webrtc/${endpoint}`,
      args: { ...args, call_ids: [id] }
    })
    yield put(successAction(id))
    if (typeof resolve === 'function') {
      yield call(resolve, id)
    }
  } catch (e) {
    yield put(errorAction(e))
    if (typeof reject === 'function') {
      yield call(reject, e)
    }
  }
}

export function * callHistorySyncProcess () {
  while (true) {
    yield delay(SYNC_INTERVAL)

    const slice = yield select(s => s.callHistory)

    if (slice.newSyncInProgress) continue

    console.log('callHistorySyncProcess: requesting new call logs')
    const syncCalls = [call(getCallHistoryRequest, { is_missed: false, limit: RESULTS_LIMIT }, { paginateNew: true, isSearching: false })]
    if (slice.searchFilters && slice.searchFilters.is_missed) {
      syncCalls.push([call(getCallHistoryRequest, { is_missed: true, limit: RESULTS_LIMIT }, { paginateNew: true, isSearching: true })])
    }
    yield all(syncCalls)
  }
}

export function * periodicallyCallHistory () {
  if (!chatAPI.ready) {
    console.log('periodicallyCallHistory: waiting for websocket connection')
    yield take(ChatTypes.CHAT_KEY_HANDSHAKE_SUCCESSFUL)
  }

  const user = yield select(s => s.user)
  if (!isLoggedIn(user)) return

  console.log('periodicallyCallHistory: websocket connected')

  const reduxSlice = yield select(s => s.chat)
  if (reduxSlice.syncInitiated) return

  yield put(CallHistoryActions.callHistorySetSyncInitiated(true))

  const syncTask = yield fork(callHistorySyncProcess)

  const { disconnected } = yield race({
    logout: take(UserTypes.LOGOUT),
    disconnected: take(ChatTypes.CHAT_SOCKET_DISCONNECTED)
  })
  yield cancel(syncTask)
  yield put(CallHistoryActions.callHistorySetSyncInitiated(false))
  if (disconnected) {
    console.log('periodicallyCallHistory: websocket disconnected. exiting...')
    yield spawn(periodicallyCallHistory)
  }
}
