import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import { UserTypes } from './UserRedux'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  displayNotification: ['message', 'messageType', 'timeout'],
  hideNotification: null
})

export const NotificationTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  message: null,
  messageType: null
})

/* ------------- Reducers ------------- */

export const dataRequest = (state, { message, messageType }) => state.merge({ message, messageType })

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.DISPLAY_NOTIFICATION]: dataRequest,
  [Types.HIDE_NOTIFICATION]: reset,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
