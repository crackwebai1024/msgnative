import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'
import { merge, findIndex, path } from 'ramda'

import createAPIPackage from '../Lib/Redux/createAPIPackage'
import { createItemSuccessAnyKey, createUpdateItemSuccessReducer } from '../Lib/Redux/reducers'
import {
  BASE_STATE_API_RESPONSE,
  baseActionsReadApi, baseActionsWriteApi,
  baseApiReadReducerInit, baseApiWriteReducerInit
} from '../Lib/Redux/CRUD'

export const REDUX_CONFIG = {
  statePrefix: 'domain',
  reducerPrefix: 'DOMAIN_',
  apiDataKey: 'domains',
  apiDataIndex: 'id'
}

/* ------------- Types and Action Creators ------------- */

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('domain', [
  {
    type: 'heatmap',
    endpoint: 'GeoStats',
    successReducer: createUpdateItemSuccessReducer('domain_id')
  },

  /* Domain connect */
  {
    type: 'domainValidate',
    endpoint: 'ValidateDomain',
    successReducer: createUpdateItemSuccessReducer('id')
  },

  /* Domain purchase */
  {
    type: 'suggest',
    endpoint: 'SuggestDomains'
  },
  {
    type: 'purchaseAvailable',
    endpoint: 'DomainPurchaseAvailable'
  },
  /*
    {
      type: 'purchase',
      endpoint: 'DomainPurchase',
      successReducer: createUpdateItemSuccessReducer('id')
    },
    */

  /* Domain Group membership */
  {
    type: 'ownerDomainAddGroup',
    endpoint: 'CreateDomainGroup'
  },
  {
    type: 'ownerDomainAddGroupMember',
    endpoint: 'AddDomainGroupMember',
    successReducer: (state, { data, requestPayload }) => {
      const membersPath = ['api', 'ownerDomainGroup', 'data', 'data', 0, 'members']
      const currentMembers = path(membersPath, state) || Immutable([])
      return state.setIn(membersPath, currentMembers.concat([data]))
    }
  },
  {
    type: 'ownerDomainDeleteGroupMember',
    endpoint: 'DeleteDomainGroupMember',
    successReducer: (state, { data, requestPayload }) => {
      const membersPath = ['api', 'ownerDomainGroup', 'data', 'data', 0, 'members']

      const currentMembers = path(membersPath, state)
      if (!currentMembers) return state

      const index = findIndex(m => m.id === requestPayload.id, currentMembers)
      if (index === -1) return state

      const tempCurrentMembers = currentMembers.asMutable()
      tempCurrentMembers.splice(index, 1)
      return state.setIn(membersPath, tempCurrentMembers)
    }
  },
  {
    type: 'ownerDomainGroup',
    endpoint: 'DomainGroup'
  },
  {
    type: 'getZones',
    endpoint: 'GetDomainZones',
    successReducer: (state, { data, requestPayload }) => {
      const { domainId } = requestPayload
      return state.setIn(['zones', domainId], data.zones)
    }
  },
  {
    type: 'updateZone',
    endpoint: 'UpdateDomainZone',
    successReducer: (state, { data, requestPayload }) => {
      const domainId = data.domain_id
      const zoneId = data.record_id
      const zoneIndex = findIndex(zone => zone.record_id === zoneId)(state.zones[domainId])
      if (zoneIndex === -1) return state
      const updatedZone = state.zones[domainId][zoneIndex].merge(data)
      return state.setIn(['zones', domainId, zoneIndex], updatedZone)
    }
  },
  {
    type: 'createZone',
    endpoint: 'CreateDomainZone',
    successReducer: (state, { data }) => {
      const domainId = data.domain_id
      const zoneId = data.record_id
      const zoneIndex = findIndex(zone => zone.record_id === zoneId)(state.zones[domainId])
      if (zoneIndex !== -1) return state
      return state.setIn(['zones', domainId], state.zones[domainId].concat(data))
    }
  },
  {
    type: 'deleteZone',
    endpoint: 'DeleteDomainZone',
    successReducer: (state, { data, requestPayload }) => {
      const domainId = requestPayload.domain_id
      const zoneId = requestPayload.record_id
      const zoneIndex = findIndex(zone => zone.record_id === zoneId)(state.zones[domainId])
      if (zoneIndex === -1) return state
      return state.setIn(['zones', domainId], state.zones[domainId].filter(zone => zone.record_id !== zoneId))
    }
  }
])

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  ...baseActionsWriteApi(REDUX_CONFIG.statePrefix),

  useremailHeatmapSuccess: ['data'],

  /* Note: to be deprecated: domainConnect and others will move to APIPackage... */
  domainRequestWhois: ['payload', 'resolve', 'reject'],
  domainRequestWhoisSuccess: ['data'],

  domainValidate: ['payload', 'resolve', 'reject'],
  domainValidateSuccess: ['data'],

  domainTld: ['payload', 'resolve', 'reject'],
  domainTldSuccess: ['data'],

  domainSuggestions: ['payload', 'resolve', 'reject'],
  domainSuggestionsSuccess: ['data'],

  domainPurchaseAvailable: ['payload', 'resolve', 'reject'],
  domainPurchaseAvailableSuccess: ['data'],

  domainPurchase: ['payload', 'resolve', 'reject'],
  domainPurchaseSuccess: ['data'],

  openDomainZoneEditForm: ['domainId', 'zoneId'],
  closeDomainZoneEditForm: ['domainId', 'zoneId'],

  domainSetIsActiveFilter: null,
  domainClearIsActiveFilter: null
})

export const DomainTypes = merge(Types, APITypes)
export const DomainCreators = merge(Creators, APICreators)
export const DomainAPITypesToSagas = APITypesToSagas
export default DomainCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  ...APIState,

  orderBy: 'last_activity_on',

  tld: []
})

/* ------------- Reducers ------------- */

const reset = () => INITIAL_STATE

const openDomainZoneEditForm = (state, { domainId, zoneId }) => {
  if (!state.zones) return state
  if (!state.zones[domainId]) return state
  if (!state.zones[domainId].length) return state
  const zoneIndex = findIndex(zone => zone.record_id === zoneId)(state.zones[domainId])
  if (zoneIndex === -1) return state
  return state.setIn(['zones', domainId, zoneIndex, 'editFormOpen'], true)
}

const closeDomainZoneEditForm = (state, { domainId, zoneId }) => {
  if (!state.zones) return state
  if (!state.zones[domainId]) return state
  if (!state.zones[domainId].length) return state
  const zoneIndex = findIndex(zone => zone.record_id === zoneId)(state.zones[domainId])
  if (zoneIndex === -1) return state
  return state.setIn(['zones', domainId, zoneIndex, 'editFormOpen'], false)
}

const setIsActiveFilter = state => state.setIn(['searchFilters', 'is_active'], true)

const clearIsActiveFilter = (state) => {
  // take the is_active key out
  const { is_active, ...newSearchFilters } = state.searchFilters
  return state.setIn(['searchFilters'], newSearchFilters)
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

  [`${REDUX_CONFIG.reducerPrefix}TLD_SUCCESS`]: createItemSuccessAnyKey('tlds', 'tld'),
  [`${REDUX_CONFIG.reducerPrefix}PURCHASE_SUCCESS`]: createUpdateItemSuccessReducer('id'),

  OPEN_DOMAIN_ZONE_EDIT_FORM: openDomainZoneEditForm,
  CLOSE_DOMAIN_ZONE_EDIT_FORM: closeDomainZoneEditForm,

  [Types.DOMAIN_SET_IS_ACTIVE_FILTER]: setIsActiveFilter,
  [Types.DOMAIN_CLEAR_IS_ACTIVE_FILTER]: clearIsActiveFilter,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
