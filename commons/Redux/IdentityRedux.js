import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'
import { merge } from 'ramda'

import createAPIPackage from '../Lib/Redux/createAPIPackage'
import { createUpdateItemSuccessReducer } from '../Lib/Redux/reducers'
import {
  BASE_STATE_API_RESPONSE,
  baseActionsReadApi, baseActionsWriteApi,
  baseApiReadReducerInit, baseApiWriteReducerInit
} from '../Lib/Redux/CRUD'

export const REDUX_CONFIG = {
  statePrefix: 'identity',
  reducerPrefix: 'IDENTITY_',
  apiDataKey: 'identities',
  apiDataIndex: 'id'
}

/* ------------- Types and Action Creators ------------- */

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('identity', [
  {
    type: 'heatmap',
    endpoint: 'GeoStats',
    successReducer: createUpdateItemSuccessReducer('identity_id')
  },

  {
    type: 'crypto',
    endpoint: 'Crypto',
    successReducer: createUpdateItemSuccessReducer('id')
  },

  {
    type: 'exportVcard',
    endpoint: 'ExportIdentityVcard',
    successReducer: createUpdateItemSuccessReducer('id')
  },

  {
    type: 'identityContact',
    endpoint: 'Contacts'
  },

  {
    type: 'identityGenerateCrypto',
    endpoint: 'IdentityGenerateCrypto'
  },

  {
    type: 'identitySendWelcome',
    endpoint: 'IdentitySendWelcome'
  },

  {
    type: 'identityMailbox',
    endpoint: 'IdentityMailbox'
  },

  {
    type: 'validateIdentity',
    endpoint: 'ValidateIdentity'
  },
  {
    type: 'getIdentity',
    endpoint: 'Identities',
    successReducer: (state, action) => {
      const identities = action.data.identities
      // handle cases when searched email is not a user identity
      if (!identities.length) {
        const search = action.requestPayload.search
        return state
          .setIn(['cache', search.identity_email], {
            email: search.identity_email
          })
      }
      return state.setIn(['cache', identities[0].email], identities[0])
    }
  }
])

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  ...baseActionsWriteApi(REDUX_CONFIG.statePrefix),

  identityHeatmapSuccess: ['data'],

  identityInsertSingle: ['data', 'requestPayload'],

  identityFetchFromCache: ['requestType', 'dataFromAPI', 'payload'],
  identityGetFromCacheOrRequest: ['payload'],
  identitySuccessForCache: ['data', 'requestType'],
  identityForceRefresh: null,

  identityFinishCreation: null
})

export const IdentityTypes = merge(Types, APITypes)
export const IdentityCreators = merge(Creators, APICreators)
export const IdentityAPITypesToSagas = APITypesToSagas
export default IdentityCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  ...APIState,
  orderBy: 'identity_last_activity_on'
})

/* ------------- Reducers ------------- */

const reset = () => INITIAL_STATE

const insertSingleIdentityReducer = (state, { data, requestPayload }) => {
  let newState = state.setIn(['api', 'getIdentity', 'data', 'search'], requestPayload.search)
  if (!data.identities.length) {
    return newState
  }

  const [identity] = data.identities

  if (newState.getIn(['data', identity.id])) {
    newState = newState.setIn(['data', identity.id], identity)
  }

  if (newState.getIn(['searchResultsData', identity.id])) {
    newState = newState.setIn(['searchResultsData', identity.id], identity)
  }

  return newState.setIn(['cache', identity.email], identity)
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

  [Types.IDENTITY_INSERT_SINGLE]: insertSingleIdentityReducer,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
