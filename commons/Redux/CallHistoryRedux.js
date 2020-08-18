import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import { BASE_STATE_API_RESPONSE, baseApiReadReducerInit, baseActionsReadApi, ITEM_UPDATE_TYPES } from 'commons/Lib/Redux/CRUD'
import { createItemUpdateRequestReducer, createItemUpdateSuccessReducer, deleteItemSuccessReducer } from 'commons/Lib/Redux/reducers'

import { UserTypes } from './UserRedux'

export const REDUX_CONFIG = {
  statePrefix: 'callHistory',
  reducerPrefix: 'CALL_HISTORY_',
  apiDataKey: 'calls',
  apiDataIndex: 'call_id'
}

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  callHistoryDeleteRequest: ['id', 'resolve'],
  callHistoryDeleteSuccess: ['id'],
  callHistoryDeleteFailure: ['id', 'error'],
  callHistorySetIsMissedFilter: null,
  callHistoryClearIsMissedFilter: null,

  callHistoryFetchFromCache: ['requestType', 'dataFromAPI', 'payload'],
  callHistorySuccessForCache: ['data', 'requestType'],
  callHistoryForceRefresh: null
})

export const CallHistoryTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  orderBy: 'call_id',
  selectedUpdateInProgress: false,
  selectedIds: []
})

/* ------------- Reducers ------------- */

const callHistorySetIsMissedFilter = state => state.setIn(['searchFilters', 'is_missed'], true)

const callHistoryClearIsMissedFilter = (state) => {
  // take the is_missed key out
  const { is_missed, ...newSearchFilters } = state.searchFilters
  return state.setIn(['searchFilters'], newSearchFilters)
}

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types, REDUX_CONFIG.apiDataKey,
  REDUX_CONFIG.apiDataIndex
)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,
  [Types.CALL_HISTORY_DELETE_REQUEST]: createItemUpdateRequestReducer(ITEM_UPDATE_TYPES.REMOVE),
  [Types.CALL_HISTORY_DELETE_FAILURE]: createItemUpdateSuccessReducer([]),
  [Types.CALL_HISTORY_DELETE_SUCCESS]: createItemUpdateSuccessReducer([deleteItemSuccessReducer]),
  [Types.CALL_HISTORY_SET_IS_MISSED_FILTER]: callHistorySetIsMissedFilter,
  [Types.CALL_HISTORY_CLEAR_IS_MISSED_FILTER]: callHistoryClearIsMissedFilter,
  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
