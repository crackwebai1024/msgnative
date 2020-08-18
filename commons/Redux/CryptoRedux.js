import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'
import { merge } from 'ramda'

import {
  BASE_STATE_API_RESPONSE,
  baseActionsReadApi, baseActionsWriteApi,
  baseApiReadReducerInit, baseApiWriteReducerInit
} from '../Lib/Redux/CRUD'
import { createDataSuccessReducer } from '../Lib/Redux/reducers'
import createAPIPackage from '../Lib/Redux/createAPIPackage'

export const REDUX_CONFIG = {
  statePrefix: 'crypto',
  reducerPrefix: 'CRYPTO_',
  apiDataKey: 'keys',
  apiDataIndex: 'id'
}

export const CRYPTOAPI = {
  ENC_TYPE: {
    PGP: 10,
    SMIME: 11
  },

  ENC_TYPE_DATA: {
    10: {
      STRING: 'PGP',
      MIMETYPE: 'application/pgp-keys',
      EXT: '.asc'
    },
    11: {
      STRING: 'S/MIME',
      MIMETYPE: 'application/x-pem-file',
      EXT: '.pem'
    }
  },

  GENERATED_TYPE: {
    BY_MSGSAFE: 10,
    BY_USER: 11
  },

  OWNER_TYPE: {
    USER_EMAIL: 10,
    CONTACT_EMAIL: 11,
    CONTACT_TOKEN: 14,
    IDENTITY_EMAIL: 15
  }
}

/* ------------- Types and Action Creators ------------- */

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('crypto', [
  {
    type: 'confirm',
    endpoint: 'CryptoConfirmDecrypt',
    getTranslatedError: true
  }
])

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  ...baseActionsWriteApi(REDUX_CONFIG.statePrefix),

  cryptoGetKey: ['payload', 'resolve', 'reject'],
  cryptoGetKeySuccess: ['data'],

  cryptoResetKey: ['payload', 'resolve', 'reject'],
  cryptoResetKeySuccess: ['data'],

  cryptoUserEmailSmime: ['payload', 'resolve', 'reject'],
  cryptoUserEmailSmimeSuccess: ['data'],

  cryptoGenerateIdentity: ['payload', 'resolve', 'reject'],
  cryptoGenerateIdentitySuccess: ['data'],

  cryptoSaveKey: ['data', 'email']
})

export const CryptoTypes = merge(Types, APITypes)
export const CryptoCreators = merge(Creators, APICreators)
export const CryptoAPITypesToSagas = APITypesToSagas
export default CryptoCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  ...APIState
})

/* ------------- Reducers ------------- */

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types,
  REDUX_CONFIG.apiDataKey, REDUX_CONFIG.apiDataIndex
)
const BASE_REDUCERS_WRITE_API = baseApiWriteReducerInit(REDUX_CONFIG.reducerPrefix, Types)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,
  ...BASE_REDUCERS_WRITE_API,
  ...APIReducers,

  [`${REDUX_CONFIG.reducerPrefix}GET_KEY_SUCCESS`]: createDataSuccessReducer(REDUX_CONFIG.apiDataKey, REDUX_CONFIG.apiDataIndex),

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
