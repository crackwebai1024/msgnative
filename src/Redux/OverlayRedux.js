import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  showOverlay: ['identifier'],
  closeOverlay: null
})

export const OverlayTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  identifier: null,
  open: false
})

/* ------------- Reducers ------------- */

const showOverlay = (state, { identifier }) => state.merge({
  identifier,
  open: true
})

const closeOverlay = (state, { identifier }) => state.merge({
  identifier: null,
  open: false
})

// const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SHOW_OVERLAY]: showOverlay,
  [Types.CLOSE_OVERLAY]: closeOverlay
})

export const OverlayIdentifiers = {
  EDUCATION: 'EDUCATION'
}
