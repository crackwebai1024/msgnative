import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import { UserTypes } from 'commons/Redux/UserRedux'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  shareFile: ['filename', 'data', 'encoding']
})

export const FileTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({})

/* ------------- Reducers ------------- */
const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [UserTypes.LOGOUT]: reset
})
