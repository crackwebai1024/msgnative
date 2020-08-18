import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'

import { BASE_STATE_API_RESPONSE, baseActionsReadApi, baseApiReadReducerInit } from '../Lib/Redux/CRUD'

export const REDUX_CONFIG = {
  statePrefix: 'mailboxDomain',
  reducerPrefix: 'MAILBOX_DOMAIN_',
  apiDataKey: 'domains',
  apiDataIndex: 'id'
}

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix)
})

export const MailboxDomainTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE
})

/* ------------- Reducers ------------- */

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types, REDUX_CONFIG.apiDataKey,
  REDUX_CONFIG.apiDataIndex
)
export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
