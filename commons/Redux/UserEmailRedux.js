import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'
import { merge, path } from 'ramda'

import { CRYPTOAPI } from './CryptoRedux'

import createAPIPackage from '../Lib/Redux/createAPIPackage'

import { updateItemSuccessReducer, createUpdateItemSuccessReducer } from '../Lib/Redux/reducers'
import {
  BASE_STATE_API_RESPONSE,
  baseActionsReadApi, baseActionsWriteApi,
  baseApiReadReducerInit, baseApiWriteReducerInit
} from '../Lib/Redux/CRUD'

export const REDUX_CONFIG = {
  statePrefix: 'useremail',
  reducerPrefix: 'USEREMAIL_',
  apiDataKey: 'useremails',
  apiDataIndex: 'id'
}

/* ------------- Types and Action Creators ------------- */

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('useremail', [
  {
    type: 'heatmap',
    endpoint: 'GeoStats',
    successReducer: createUpdateItemSuccessReducer('useremail_id')
  },
  {
    type: 'confirm',
    endpoint: 'ConfirmUserEmailNoAuth',
    getTranslatedError: true
  },
  {
    type: 'addCrypto',
    endpoint: 'CryptoAddKey',
    successReducer: (state, { data, requestPayload }) => {
      const stateKey = requestPayload.useremail_id
      const dataKey = state.searchResultsData && state.searchResultsData[stateKey] ? 'searchResultsData' : 'data'
      const keyPresenceKey = requestPayload.enc_type === CRYPTOAPI.ENC_TYPE.PGP ? 'pgp' : 'smime'
      state = state.setIn([dataKey, stateKey, 'crypto', keyPresenceKey], data)
      const keysPath = [dataKey, stateKey, 'crypto']
      const existing = path(keysPath, state, keyPresenceKey)
      if (existing) {
        return state.setIn([keysPath, keyPresenceKey], data)
      }
    }
  },
  {
    type: 'getUserEmail',
    endpoint: 'UserEmail',
    successReducer: (state, action) => {
      const useremails = action.data[REDUX_CONFIG.apiDataKey]
      // handle cases when searched email is not a user identity
      if (!useremails.length) {
        const search = action.requestPayload.search
        return state
          .setIn(['cache', search.email], {
            email: search.email
          })
      }
      return state.setIn(['cache', useremails[0].email], useremails[0])
    }
  }
])

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  ...baseActionsWriteApi(REDUX_CONFIG.statePrefix),

  useremailSetDefault: ['id'],
  useremailSetDefaultSuccess: ['id'],

  useremailHeatmapSuccess: ['data'],

  useremailRequestConfirmation: ['payload', 'resolve', 'reject'],
  useremailRequestConfirmationSuccess: ['data'],

  useremailInsertSingle: ['data', 'requestPayload'],

  useremailFetchFromCache: ['requestType', 'dataFromAPI', 'payload'],
  useremailSuccessForCache: ['data', 'requestType'],
  useremailGetFromCacheOrRequest: ['payload'],
  useremailForceRefresh: null,

  useremailSetIsConfirmedFilter: null,
  useremailClearIsConfirmedFilter: null
})

export const UserEmailTypes = merge(Types, APITypes)
export const UserEmailCreators = merge(Creators, APICreators)
export const UserEmailAPITypesToSagas = APITypesToSagas
export default UserEmailCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  ...APIState,
  orderBy: 'last_activity_on'
})

/* ------------- Reducers ------------- */

const useremailSetDefaultSuccess = (state, { id }) => {
  let _state = state
  state.dataOrder.map((_id) => {
    if (_id === id) {
      _state = _state.setIn(['data', _id, 'is_default'], true)
    } else if (path(['data', _id, 'is_default'], state)) {
      _state = _state.setIn(['data', _id, 'is_default'], false)
    }
  })
  return _state
}

const reset = () => INITIAL_STATE

const setUserEmailConfirmedFilter = state => state.setIn(['searchFilters', 'is_confirmed'], true)

const clearUserEmailConfirmedFilter = (state) => {
  // take the is_confirmed key out
  const { is_confirmed, ...newSearchFilters } = state.searchFilters
  return state.setIn(['searchFilters'], newSearchFilters)
}

const insertSingleUserEmailReducer = (state, { data, requestPayload }) => {
  let newState = state.setIn(['api', 'getUserEmail', 'data', 'search'], requestPayload.search)
  if (!data[REDUX_CONFIG.apiDataKey].length) {
    return newState
  }

  const [useremail] = data[REDUX_CONFIG.apiDataKey]

  if (newState.getIn(['data', useremail.id])) {
    newState = newState.setIn(['data', useremail.id], useremail)
  }

  if (newState.getIn(['searchResultsData', useremail.id])) {
    newState = newState.setIn(['searchResultsData', useremail.id], useremail)
  }

  return newState.setIn(['cache', useremail.email], useremail)
}

/* ------------- Hookup Reducers To Types ------------- */

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types, REDUX_CONFIG.apiDataKey,
  REDUX_CONFIG.apiDataIndex
)
const BASE_REDUCERS_WRITE_API = baseApiWriteReducerInit(REDUX_CONFIG.reducerPrefix, Types)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,
  ...BASE_REDUCERS_WRITE_API,
  ...APIReducers,

  [UserEmailTypes.USEREMAIL_REQUEST_CONFIRMATION_SUCCESS]: updateItemSuccessReducer,
  [UserEmailTypes.USEREMAIL_SET_DEFAULT_SUCCESS]: useremailSetDefaultSuccess,

  [Types.USEREMAIL_INSERT_SINGLE]: insertSingleUserEmailReducer,

  [Types.USEREMAIL_SET_IS_CONFIRMED_FILTER]: setUserEmailConfirmedFilter,
  [Types.USEREMAIL_CLEAR_IS_CONFIRMED_FILTER]: clearUserEmailConfirmedFilter,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
