import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'
import { updateItemSuccessReducer } from '../Lib/Redux/reducers'

import {
  BASE_STATE_API_RESPONSE,
  baseActionsReadApi, baseActionsWriteApi,
  baseApiReadReducerInit, baseApiWriteReducerInit
} from '../Lib/Redux/CRUD'

export const REDUX_CONFIG = {
  statePrefix: 'payment',
  reducerPrefix: 'PAYMENT_',
  apiDataKey: 'data',
  apiDataIndex: 'id'
}

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  ...baseActionsWriteApi(REDUX_CONFIG.statePrefix)
})

export const PaymentTypes = Types
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
const BASE_REDUCERS_WRITE_API = baseApiWriteReducerInit(REDUX_CONFIG.reducerPrefix, Types)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,
  ...BASE_REDUCERS_WRITE_API,
  [UserTypes.LOGOUT]: reset,

  // We overwrite the reducer for itemEdit because when we update the is_defualt
  // property of the card, the api returns an object only with { id, is_default }
  // without the rest of the properties. So we merge the properties, instead of replacing the
  // the whole item.
  // Also when we set one card as default, we need to make sure only it has is_defualt set to true
  [PaymentTypes.PAYMENT_EDIT_SUCCESS]: (state, { data }) => {
    // if is_default property is not updated then delegate
    if (!data.is_default) return updateItemSuccessReducer(state, { data })
    const currentDefaultId = state.dataOrder.find(id => state.data[id].is_default)
    return state.setIn(['data', currentDefaultId, 'is_default'], false).setIn(['data', data.id, 'is_default'], true)
  }
})
/* ------------- Selectors ------------- */
