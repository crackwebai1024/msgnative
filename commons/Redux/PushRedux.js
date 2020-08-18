import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

const { Types, Creators } = createActions({
  pushInit: null
})

export const PushTypes = Types
export default Creators

export const INITIAL_STATE = Immutable({
  pushAlert: null,
  pushAlertType: null
})

const reset = () => INITIAL_STATE

export const reducer = createReducer(INITIAL_STATE, {
  [Types.PUSH_INIT]: reset
})
