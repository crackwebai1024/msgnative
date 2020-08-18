import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { merge, path, findIndex } from 'ramda'

import { AppTypes } from './AppRedux'
import { UserTypes } from './UserRedux'
import {
  createToggleFilterIdReducer,
  clearToggleFilterIdReducer,
  createUpdateItemSuccessReducer,
  editItemSuccessReducer
} from '../Lib/Redux/reducers'
import {
  BASE_STATE_API_RESPONSE,
  baseActionsReadApi, baseActionsWriteApi,
  baseApiReadReducerInit, baseApiWriteReducerInit
} from '../Lib/Redux/CRUD'
import createAPIPackage from '../Lib/Redux/createAPIPackage'
import { CRYPTOAPI } from './CryptoRedux'

export const REDUX_CONFIG = {
  statePrefix: 'contact',
  reducerPrefix: 'CONTACT_',
  apiDataKey: 'contacts',
  apiDataIndex: 'email'
}

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  ...baseActionsWriteApi(REDUX_CONFIG.statePrefix),

  toggleContactIdentityFilter: ['id'],
  clearContactIdentityFilter: null,

  toggleContactMsgsafeUsersFilter: null,
  clearContactMsgsafeUsersFilter: null,

  contactHeatmapSuccess: ['data'],

  contactSaveVCard: ['id'],

  contactInsertSingle: ['data', 'requestPayload'],
  contactGetFullObject: ['email', 'resolve', 'reject'],

  contactFetchFromCache: ['requestType', 'dataFromAPI', 'payload'],
  contactGetFromCacheOrRequest: ['payload'],
  contactSuccessForCache: ['data', 'requestType'],
  contactForceRefresh: null,

  cacheIsEmailPlatformUser: ['data'],
  setFocus: ['name']
})

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('contact', [
  {
    type: 'heatmap',
    endpoint: 'ContactHeatmap',
    successReducer: createUpdateItemSuccessReducer('email')
  },
  {
    type: 'delete',
    endpoint: 'DeleteContactEmail'
  },
  {
    type: 'crypto',
    endpoint: 'Crypto',
    successReducer: (state, { data, requestPayload }) => {
      let dataKey = state.searchResultsData && state.searchResultsData[requestPayload.email] ? 'searchResultsData' : 'data'
      let keysPath = [dataKey, requestPayload.email]
      let existingInCache = path(keysPath, state)
      if (existingInCache) {
        state = state.setIn([dataKey, requestPayload.email, 'keys'], data.keys)
      }
      dataKey = 'cache'
      keysPath = [dataKey, requestPayload.email]
      existingInCache = path(keysPath, state)
      if (existingInCache) {
        state = state.setIn([dataKey, requestPayload.email, 'keys'], data.keys)
      }
      return state
    }
  },
  {
    type: 'addCrypto',
    endpoint: 'CryptoAddKey',
    successReducer: (state, { data, requestPayload }) => {
      let dataKey = state.searchResultsData && state.searchResultsData[requestPayload.email] ? 'searchResultsData' : 'data'
      const keyPresenceKey = requestPayload.enc_type === CRYPTOAPI.ENC_TYPE.PGP ? 'has_contact_email_pgp' : 'has_contact_email_smime'

      state = state.setIn([dataKey, requestPayload.email, keyPresenceKey], true)
      let keysPath = [dataKey, requestPayload.email, 'keys']

      let existing = path(keysPath, state)
      if (existing) {
        state = state.setIn(keysPath, existing.concat(Immutable([data])))
      } else {
        state = state.setIn(keysPath, Immutable([data]))
      }

      // do the same thing for cached contact
      dataKey = 'cache'
      if (state[dataKey][requestPayload.email]) {
        state = state.setIn([dataKey, requestPayload.email, keyPresenceKey], true)
        keysPath = [dataKey, requestPayload.email, 'keys']

        existing = path(keysPath, state)
        if (existing) {
          state = state.setIn(keysPath, existing.concat(Immutable([data])))
        } else {
          state = state.setIn(keysPath, Immutable([data]))
        }
      }

      return state
    }
  },
  {
    type: 'deleteCrypto',
    endpoint: 'CryptoDeleteKey',
    successReducer: (state, { requestPayload }) => {
      let dataKey = state.searchResultsData && state.searchResultsData[requestPayload.email] ? 'searchResultsData' : 'data'

      let keysPath = [dataKey, requestPayload.email, 'keys']
      let existing = path(keysPath, state)
      if (existing) {
        const index = findIndex(k => k.id === requestPayload.cryptoId, path(keysPath, state))
        if (index !== -1) {
          const keyDeleted = path([...keysPath, index], state)
          const keyPresenceKey = keyDeleted.enc_type === CRYPTOAPI.ENC_TYPE.PGP ? 'has_contact_email_pgp' : 'has_contact_email_smime'
          state = state.setIn([dataKey, requestPayload.email, keyPresenceKey], false)
          state = state.setIn(keysPath, Immutable([
            ...existing.slice(0, index),
            ...existing.slice(index + 1, existing.length)
          ]))
        }
      }

      // do the same thing for cached contacts
      dataKey = 'cache'
      if (state[dataKey][requestPayload.email]) {
        keysPath = [dataKey, requestPayload.email, 'keys']
        existing = path(keysPath, state)
        if (existing) {
          const index = findIndex(k => k.id === requestPayload.cryptoId, path(keysPath, state))
          if (index !== -1) {
            const keyDeleted = path([...keysPath, index], state)
            const keyPresenceKey = keyDeleted.enc_type === CRYPTOAPI.ENC_TYPE.PGP ? 'has_contact_email_pgp' : 'has_contact_email_smime'
            state = state.setIn([dataKey, requestPayload.email, keyPresenceKey], false)
            state = state.setIn(keysPath, Immutable([
              ...existing.slice(0, index),
              ...existing.slice(index + 1, existing.length)
            ]))
          }
        }
      }

      return state
    }
  },
  {
    // TODO: review getContact usage
    type: 'getContact',
    endpoint: 'Contacts',
    successReducer: (state, action) => {
      const contacts = action.data.contacts

      // handle cases when searched email is not a user contact
      if (!contacts.length) {
        const search = action.requestPayload.search
        return state
          .setIn(['cache', search.contact_email], {
            email: search.contact_email
          })
      }
      return state.setIn(['cache', contacts[0].email], contacts[0])
    }
  },
  {
    type: 'getContactUnique',
    endpoint: 'ContactsUnique',
    successReducer: (state, { data, requestPayload }) => {
      let newState = state.setIn(['api', 'getContactUnique', 'data', 'search'], requestPayload.search)
      /* TODO: handle cases when searched email is not a user contact */
      if (!data.contacts.length) {
        return newState
      }

      const [contact] = data.contacts

      if (newState.getIn(['data', contact.email])) {
        newState = newState.setIn(['data', contact.email], contact)
      }

      if (newState.getIn(['searchResultsData', contact.email])) {
        newState = newState.setIn(['searchResultsData', contact.email], contact)
      }

      return newState.setIn(['cache', contact.email], contact)
    }
  }
])

export const ContactTypes = merge(Types, APITypes)
export const ContactCreators = merge(Creators, APICreators)
export const ContactAPITypesToSagas = APITypesToSagas
export default ContactCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  ...APIState,

  orderBy: 'display_name',
  sortBy: 'asc',

  filterIdentityIds: [],
  cache: {}
})

/* ------------- Reducers ------------- */

const reset = () => INITIAL_STATE

const toggleContactMsgsafeUsersFilter = state => state.setIn(['searchFilters', 'is_msgsafe_user'], true)
const clearContactMsgsafeUsersFilter = (state) => {
  // take the is_msgsafe_user key out
  const { is_msgsafe_user, ...newSearchFilters } = state.searchFilters
  return state.setIn(['searchFilters'], newSearchFilters)
}
const contactEditSuccessReducer = (state, { data }) => {
  // Override base editItemSuccessReducer to update cached contact
  const newState = editItemSuccessReducer('email')(state, { data })

  if (path(['cache', data.email], newState)) {
    return newState.setIn(['cache', data.email], data)
  }

  return newState
}

const insertSingleContactReducer = (state, { data, requestPayload }) => {
  let newState = state.setIn(['api', 'getContactUnique', 'data', 'search'], requestPayload.search)
  if (!data.contacts.length) {
    return newState
  }

  const [contact] = data.contacts

  if (newState.getIn(['data', contact.email])) {
    newState = newState.setIn(['data', contact.email], contact)
  }

  if (newState.getIn(['searchResultsData', contact.email])) {
    newState = newState.setIn(['searchResultsData', contact.email], contact)
  }

  return newState.setIn(['cache', contact.email], contact)
}

const setFocus = (state, { name }) => {
  return state.setIn(['focusedFieldName'], name)
}

/* ------------- Hookup Reducers To Types ------------- */

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types, REDUX_CONFIG.apiDataKey,
  REDUX_CONFIG.apiDataIndex
)

const BASE_REDUCERS_WRITE_API = baseApiWriteReducerInit(REDUX_CONFIG.reducerPrefix, Types, REDUX_CONFIG.apiDataIndex)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,
  ...BASE_REDUCERS_WRITE_API,
  ...APIReducers,

  [Types.TOGGLE_CONTACT_IDENTITY_FILTER]: createToggleFilterIdReducer('filterIdentityIds'),
  [Types.CLEAR_CONTACT_IDENTITY_FILTER]: clearToggleFilterIdReducer('filterIdentityIds'),
  [Types.CONTACT_EDIT_SUCCESS]: contactEditSuccessReducer,

  [Types.CONTACT_INSERT_SINGLE]: insertSingleContactReducer,

  [Types.TOGGLE_CONTACT_MSGSAFE_USERS_FILTER]: toggleContactMsgsafeUsersFilter,
  [Types.CLEAR_CONTACT_MSGSAFE_USERS_FILTER]: clearContactMsgsafeUsersFilter,

  [Types.SET_FOCUS]: setFocus,

  [UserTypes.LOGOUT]: reset,
  [AppTypes.ENSURE_DATA_CLEAN_UP_ON_LOGOUT]: reset
})

/* ------------- Selectors ------------- */
