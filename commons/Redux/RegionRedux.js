import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import { UserTypes } from './UserRedux'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  allRegionsRequest: ['resolve', 'reject'],
  allRegionsSuccess: ['data'],
  allRegionsFailure: ['error']
})

export const RegionTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  dataRequestInProgress: false,
  dataRequestSuccessful: false,
  dataRequestError: null,

  data: null
})

/* ------------- Reducers ------------- */

export const dataRequest = state =>
  state.merge({ dataRequestInProgress: true, dataRequestSuccessful: false, dataRequestError: null })

export const dataSuccess = (state, { data }) =>
  state.merge({
    dataRequestInProgress: false,
    dataRequestSuccessful: true,
    dataRequestError: null,
    data
  })

export const dataFailure = (state, { error }) =>
  state.merge({ dataRequestInProgress: false, dataRequestSuccessful: false, dataRequestError: error })

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.ALL_REGIONS_REQUEST]: dataRequest,
  [Types.ALL_REGIONS_SUCCESS]: dataSuccess,
  [Types.ALL_REGIONS_FAILURE]: dataFailure,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
