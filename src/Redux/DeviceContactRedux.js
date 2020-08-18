import { createActions, createReducer } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { path, findIndex } from 'ramda'

import { BASE_STATE_API_RESPONSE, baseApiReadReducerInit, baseActionsReadApi } from 'commons/Lib/Redux/CRUD'
import { UserTypes } from 'commons/Redux/UserRedux'

export const REDUX_CONFIG = {
  statePrefix: 'deviceContact',
  reducerPrefix: 'DEVICE_CONTACT_',
  apiDataKey: 'contacts',
  apiDataIndex: 'id'
}

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),

  contactsPermissionRequest: null,
  contactsPermissionSuccess: ['permission'],

  contactsImportRequest: null,
  contactsImportSuccess: null,

  showContactsPermissionAlert: null,
  hideContactsPermissionAlert: null,

  // Should be dispatched when an email address's is_msgsafe_user state is known
  deviceContactEmailIsMsgsafeUser: ['id', 'email', 'isUser'],

  enablePlatformUserFilter: null,
  clearPlatformUserFilter: null,
  selectIdentityForWebrtcAction: ['identity']
})

export const DeviceContactTypes = Types

export default Creators

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,

  permission: 'undefined',
  imported: false,
  alert: false
})

const contactsPermissionSuccess = (state, { permission }) =>
  state.setIn(['permission'], permission)

const contactsImportSuccess = state => state.setIn(['imported'], true)
const showContactsPermissionAlert = state => state.setIn(['alert'], true)
const hideContactsPermissionAlert = state => state.setIn(['alert'], false)

const deviceContactEmailIsMsgsafeUser = (state, { id, email, isUser }) => {
  const emailAddresses = path(['data', id, 'emailAddresses'], state)
  if (!emailAddresses) return state

  const emailIndex = findIndex(x => x.email === email, emailAddresses)
  const _state = state.setIn(['data', id, 'emailAddresses', emailIndex, 'is_msgsafe_user'], isUser)

  if (!isUser) return _state

  return _state.setIn(['data', id, 'is_msgsafe_user'], isUser)
}

const enablePlatformUserFilter = (state) => {
  if (!state.data) return state

  const platformContactsOrder = []
  const platformContacts = {}
  state.dataOrder.map((id) => {
    if (state.data[id].is_msgsafe_user) {
      platformContactsOrder.push(id)
      platformContacts[id] = state.data[id]
    }
  })

  return state
    .set('searchResultsData', platformContacts)
    .set('searchResultsDataOrder', platformContactsOrder)
    .set('searchResultsDataTotalCount', platformContactsOrder.length)
}

const clearPlatformUserFilter = state => state
  .set('searchResultsData', null)
  .set('searchResultsDataOrder', null)
  .set('searchResultsDataTotalCount', 0)

const reset = () => INITIAL_STATE

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types, REDUX_CONFIG.apiDataKey,
  REDUX_CONFIG.apiDataIndex
)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,

  [Types.CONTACTS_PERMISSION_SUCCESS]: contactsPermissionSuccess,
  [Types.CONTACTS_IMPORT_SUCCESS]: contactsImportSuccess,
  [Types.SHOW_CONTACTS_PERMISSION_ALERT]: showContactsPermissionAlert,
  [Types.HIDE_CONTACTS_PERMISSION_ALERT]: hideContactsPermissionAlert,
  [Types.DEVICE_CONTACT_EMAIL_IS_MSGSAFE_USER]: deviceContactEmailIsMsgsafeUser,
  [Types.ENABLE_PLATFORM_USER_FILTER]: enablePlatformUserFilter,
  [Types.CLEAR_PLATFORM_USER_FILTER]: clearPlatformUserFilter,

  [UserTypes.LOGOUT]: reset
})
