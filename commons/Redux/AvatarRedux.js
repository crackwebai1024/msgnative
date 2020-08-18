import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import { UserTypes } from './UserRedux'

/* ------------- Types and Action Creators ------------- */

export const AVATAR_EXISTENCE_STATES = {
  'UNKNOWN': 0,
  'YES': 1,
  'NO': 2
}

const { Types, Creators } = createActions({
  cacheEmailAvatarExistence: ['email', 'exists']
})

export const AvatarTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  exists: {}
})

/* ------------- Reducers ------------- */

export const cacheEmailAvatarExistence = (state, { email, exists }) => state.setIn(['exists', email], exists)

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.CACHE_EMAIL_AVATAR_EXISTENCE]: cacheEmailAvatarExistence,
  [UserTypes.LOGOUT]: reset
})
