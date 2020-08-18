import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'
import { dataRequestReducer, dataFailureReducer } from '../Lib/Redux/reducers'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  dashboardDataRequest: null,

  metricsRequest: null,
  metricsSuccess: ['data'],
  metricsFailure: ['error'],

  emailsReceivedCountRequest: null,
  emailsReceivedCountSuccess: ['data'],
  emailsReceivedCountFailure: ['error'],

  geoStatsRequest: null,
  geoStatsSuccess: ['data'],
  geoStatsFailure: ['error'],

  statsByDateRequest: null,
  statsByDateSuccess: ['data'],
  statsByDateFailure: ['error']
})

export const DashboardTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  metrics: null,
  metricsInProgress: false,
  metricsError: null,

  emailsReceivedCount: null,
  emailsReceivedCountInProgress: false,
  emailsReceivedCountError: null,

  geoStats: null,
  geoStatsInProgress: false,
  geoStatsError: null,

  statsByDate: null,
  statsByDateInProgress: false,
  statsByDateError: false
})

/* ------------- Reducers ------------- */

const metricsRequest = state => state.merge({ metricsInProgress: true, metricsError: null })
const metricsFailure = (state, { error }) => state.merge({ metricsInProgress: false, metricsError: error })
const metricsSuccess = (state, { data }) =>
  state.merge({ metrics: data, metricsInProgress: false, metricsError: null })

const geoStatsRequest = state =>
  state.merge({ geoStatsInProgress: true, geoStatsError: null })
const geoStatsFailure = (state, { error }) =>
  state.merge({ geoStatsInProgress: false, geoStatsError: error })
const geoStatsSuccess = (state, { data }) =>
  state.merge({ geoStats: data.data.geostats, geoStatsInProgress: false, geoStatsError: null })

// hack because createDataSuccessReducer() failing on this result
// possible initial_state issue/not current with other redux
const statsByDateSuccess = (state, { data }) =>
  state.merge({ statsByDate: data.data.result, statsByDateInProgress: false, statsByDateError: null })

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.METRICS_REQUEST]: metricsRequest,
  [Types.METRICS_SUCCESS]: metricsSuccess,
  [Types.METRICS_FAILURE]: metricsFailure,

  [Types.GEO_STATS_REQUEST]: geoStatsRequest,
  [Types.GEO_STATS_FAILURE]: geoStatsFailure,
  [Types.GEO_STATS_SUCCESS]: geoStatsSuccess,

  [Types.STATS_BY_DATE_REQUEST]: dataRequestReducer,
  [Types.STATS_BY_DATE_SUCCESS]: statsByDateSuccess,
  [Types.STATS_BY_DATE_FAILURE]: dataFailureReducer,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
