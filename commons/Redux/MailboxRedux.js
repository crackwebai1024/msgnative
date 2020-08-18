import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { merge, compose, uniq, without } from 'ramda'
import { UserTypes } from './UserRedux'

import {
  deleteItemSuccessReducer,
  createToggleFilterIdReducer,
  clearToggleFilterIdReducer,
  bulkDeleteSuccessReducer,
  mergeWithExistingData,
  createItemUpdateRequestReducer,
  createItemUpdateSuccessReducer,
  deleteItemSuccessReducerKeppingData
} from '../Lib/Redux/reducers'
import { BASE_STATE_API_RESPONSE, baseActionsReadApi, baseApiReadReducerInit } from '../Lib/Redux/CRUD'
import createAPIPackage from '../Lib/Redux/createAPIPackage'

export const REDUX_CONFIG = {
  statePrefix: 'mailbox',
  reducerPrefix: 'MAILBOX_',
  apiDataKey: 'emailevents',
  apiDataIndex: 'id'
}

export const MSG_STATE = {
  SEND_QUEUED: 36
}

export const MAIL_ITEM_UPDATE_TYPES = {
  TRASH: 'TRASH',
  UNTRASH: 'UNTRASH',
  READ: 'READ',
  UNREAD: 'UNREAD',
  ARCHIVE: 'ARCHIVE',
  UNARCHIVE: 'UNARCHIVE',
  MOVE_TO_INBOX: 'MOVE_TO_INBOX',
  DELETE: 'DELETE'
}

export const FILTER_PARAMS = {
  all: {
    is_archive: false, is_trash: false, direction: 2, treatment: 0, is_msgsafe_store: true
  },
  sent: {
    is_archive: false, is_trash: false, direction: 1, treatment: 0, is_msgsafe_store: true
  },
  forwarded: {
    direction: 2, is_trash: false, is_archive: false, treatment: 0, is_msgsafe_store: false
  },
  unread: {
    is_archive: false, is_trash: false, direction: 2, is_read: false, is_msgsafe_store: true
  },
  archive: { is_archive: true, is_trash: false, is_msgsafe_store: true },
  trash: { is_trash: true, is_msgsafe_store: true },
  queued: { msg_state: MSG_STATE.SEND_QUEUED, is_trash: false }
}

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  ...baseActionsReadApi(REDUX_CONFIG.statePrefix),
  mailboxWelcomeEmailsRequest: null, // action used to request new emails on singup-education complete

  mailboxSyncRequest: null,
  mailboxSyncSuccess: ['data'],
  mailboxSyncFailure: ['error'],

  // Fetch details of an email
  mailboxDetailRequest: ['id'],
  mailboxDetailSuccess: ['data'],
  mailboxDetailFailure: ['error', 'id'],

  // Fetch analytics data of an email
  mailboxAnalyticsRequest: ['id'],
  mailboxAnalyticsSuccess: ['data', 'id'],
  mailboxAnalyticsFailure: ['error', 'id'],

  // Send mail
  sendMailRequest: ['payload', 'resolve', 'reject'],
  sendMailSuccess: null,
  sendMailError: ['error'],
  sendQueuedMailSuccess: null,

  // Actions for mailbox events
  // In success action, we want the id so that the redux store can be updated

  mailboxReadRequest: ['id', 'resolve', 'reject'],
  mailboxReadSuccess: ['id'],

  mailboxUnreadRequest: ['id', 'resolve', 'reject'],
  mailboxUnreadSuccess: ['id'],

  mailboxArchiveRequest: ['id', 'resolve', 'reject'],
  mailboxArchiveSuccess: ['id'],

  mailboxUnarchiveRequest: ['id', 'resolve', 'reject'],
  mailboxUnarchiveSuccess: ['id'],

  mailboxMoveToInboxRequest: ['id', 'resolve', 'reject'],
  mailboxMoveToInboxSuccess: ['id'],

  mailboxTrashRequest: ['id', 'resolve', 'reject'],
  mailboxTrashSuccess: ['id'],

  mailboxUntrashRequest: ['id', 'resolve', 'reject'],
  mailboxUntrashSuccess: ['id'],

  mailboxDeleteRequest: ['id', 'resolve', 'reject'],
  mailboxDeleteSuccess: ['id'],

  mailboxClearTrashRequest: null,
  mailboxClearTrashSuccess: null,

  mailboxSendQueuedRequest: ['id'],
  mailboxSendQueuedSuccess: ['id'],

  mailboxSaveAttachment: ['id', 'attachmentIndex'],

  // multi-select functionality
  mailboxSelectEmail: ['id'],
  mailboxUnselectEmail: ['id'],
  mailboxClearSelection: null,

  mailboxTrashSelectedRequest: ['resolve', 'reject'],
  mailboxTrashSelectedSuccess: ['selectedIds'],

  mailboxArchiveSelectedRequest: ['resolve', 'reject'],
  mailboxArchiveSelectedSuccess: ['selectedIds'],

  mailboxReadSelectedRequest: ['resolve', 'reject'],
  mailboxReadSelectedSuccess: ['selectedIds'],

  mailboxUnreadSelectedRequest: ['resolve', 'reject'],
  mailboxUnreadSelectedSuccess: ['selectedIds'],

  mailboxDeleteSelectedRequest: ['resolve', 'reject'],
  mailboxDeleteSelectedSuccess: ['selectedIds', 'showNotification'],

  // A common action for all mailbox update errors
  mailboxUpdateError: ['error'],

  setMailboxFilter: ['filter'],
  clearMailboxFilter: null,

  toggleMailboxIdentityFilter: ['id'],
  clearMailboxIdentityFilter: null,

  toggleMailboxDomainFilter: ['id'],
  clearMailboxDomainFilter: null,

  clearAllMailboxRelationFilters: null,

  toggleUnreadFilter: null,

  setCustomComposeContactEmail: ['email'],
  clearCustomComposeContactEmail: null,

  drawerTotalsOptimisticUpdate: ['originalAction'],

  mailboxFetchFromCache: ['requestType', 'dataFromAPI', 'payload'],
  mailboxGetFromCacheOrRequest: ['payload'],
  mailboxSuccessForCache: ['data', 'requestType'],
  mailboxForceRefresh: null
})

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('mailbox', [
  {
    type: 'drawerTotals',
    endpoint: 'MailboxDrawerTotals',
    successReducer: (state, action) => state.setIn(['drawerTotals'], action.data)
  }
])

export const MailboxTypes = merge(Types, APITypes)
export const MailboxCreators = merge(Creators, APICreators)
export const MailboxAPITypesToSagas = APITypesToSagas
export default MailboxCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...BASE_STATE_API_RESPONSE,
  ...APIState,

  orderBy: 'id',

  filterName: null,
  filterIdentityIds: [],
  filterDomainIds: [],
  unreadOnlyFilter: false,
  searchQuery: null,

  customComposeContactEmail: null,
  numQueuedOutbound: null,

  selectedIds: [],
  selectedUpdateInProgress: false,
  actionTypeInProgress: null,

  // flags for auto-update mailbox
  newSyncRequestInProgress: false,
  newSyncRequestSuccessful: false,
  newSyncRequestError: null
})

/* ------------- Reducers ------------- */

export const mailboxSyncRequest = state => state.merge({
  newSyncRequestInProgress: true,
  newSyncRequestSuccessful: false,
  newSyncRequestError: null
})

export const mailboxSyncFailure = (state, { error }) => state.merge({
  newSyncRequestInProgress: false,
  newSyncRequestSuccessful: false,
  newSyncRequestError: error
})

export const mailboxSyncSuccess = (state, { data }) => {
  const _data = {}
  let _dataOrder = []

  data.emailevents.map((e) => {
    _data[e.id] = e
    _dataOrder.push(e.id)
  })

  _dataOrder = _dataOrder.reverse()

  const numQueuedOutbound = data.num_queued_outbound
  const dataTotalCount = state.dataTotalCount + Math.min(data.total, 30)
  const syncDataPendingCount = Math.max(0, data.total - 30)

  return state.merge({
    newSyncRequestInProgress: false,
    newSyncRequestSuccessful: true,
    newSyncRequestError: null,
    numQueuedOutbound,
    dataTotalCount,
    syncDataPendingCount,
    data: mergeWithExistingData(state.data, _data, true, true),
    dataOrder: Immutable(uniq((_dataOrder || []).concat(state.dataOrder || [])))
  })
}

// Reducers - mailbox detail

export const detailRequest = (state, { id }) => {
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  let _state = state.setIn([key, id, 'detailStatus'], { inProgress: true, error: null })
  if (_state.cache && _state.cache[id]) {
    _state = _state.setIn(['cache', id, 'detailStatus'], { inProgress: false, error: null })
  }
  return _state
}

export const detailSuccess = (state, { data }) => {
  const key = (state.searchResultsData && state.searchResultsData[data.msg_id]) ? 'searchResultsData' : 'data'

  let _state = state
    .setIn([key, data.msg_id, 'detailStatus'], { inProgress: false, error: null })
    .setIn([key, data.msg_id, 'detail'], data)

  if (_state.cache && _state.cache[data.msg_id]) {
    _state = _state
      .setIn(['cache', data.msg_id, 'detailStatus'], { inProgress: false, error: null })
      .setIn(['cache', data.msg_id, 'detail'], data)
  }
  return _state
}

export const detailError = (state, { error, id }) => {
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  let _state = state.setIn([key, id, 'detailStatus'], { inProgress: false, error })
  if (_state.cache && _state.cache[id]) {
    _state = _state.setIn(['cache', id, 'detailStatus'], { inProgress: false, error })
  }
  return _state
}

// Reducers - mailbox analytics

export const analyticsRequest = (state, { id }) => {
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  let _state = state.setIn([key, id, 'analyticsStatus'], { inProgress: true, error: null })
  if (_state.cache && _state.cache[id]) {
    _state = _state.setIn(['cache', id, 'analyticsStatus'], { inProgress: true, error: null })
  }
  return _state
}

export const analyticsSuccess = (state, { data, id }) => {
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'

  let _state = state
    .setIn([key, id, 'analyticsStatus'], { inProgress: false, error: null })
    .setIn([key, id, 'analytics'], data.analytics)

  if (_state.cache && _state.cache[id]) {
    _state = _state
      .setIn(['cache', id, 'analyticsStatus'], { inProgress: false, error: null })
      .setIn(['cache', id, 'analytics'], data.analytics)
  }
  return _state
}

export const analyticsError = (state, { error, id }) => {
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  let _state = state.setIn([key, id, 'analyticsStatus'], { inProgress: false, error })
  if (_state.cache && _state.cache[id]) {
    _state = _state.setIn(['cache', id, 'analyticsStatus'], { inProgress: false, error })
  }
  return _state
}

// Reducers - Mailbox update

export const mailboxReadSuccess = (state, { id }) => {
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  let _state = state.setIn([key, id, 'is_read'], true)
  if (state.currentId === id && state.filterName === 'unread') {
    _state = _state.setIn(['cache', id], _state[key][id])
  }
  if (_state.unreadOnlyFilter) {
    _state = deleteItemSuccessReducerKeppingData(_state, { id })
  }

  return _state
}

export const mailboxUnreadSuccess = (state, { id }) => {
  const key = (state.searchResultsData && state.searchResultsData[id]) ? 'searchResultsData' : 'data'
  return state.setIn([key, id, 'is_read'], false)
}

// multi-select functionality
export const mailboxSelectEmail = (state, { id }) => {
  const idIndex = state.selectedIds.indexOf(id)
  if (idIndex !== -1) {
    return state
  }
  return state.setIn(['selectedIds'], state.selectedIds.concat([id]))
}

export const mailboxUnselectEmail = (state, { id }) =>
  state.setIn(['selectedIds'], Immutable(without([id], state.selectedIds)))

export const mailboxClearSelection = state =>
  state
    .setIn(['selectedIds'], Immutable([]))
    .setIn(['selectedUpdateInProgress'], false)

export const selectedUpdateRequest = state =>
  state.setIn(['selectedUpdateInProgress'], true)

// Reducers - mailbox folder filters

export const setMailboxFilter = (state, { filter }) => state.set('filterName', filter === 'inbox' ? null : filter)
export const clearMailboxFilter = state => state.set('filterName', null)

export const toggleMailboxIdentityFilter = createToggleFilterIdReducer('filterIdentityIds')
export const clearMailboxIdentityFilter = clearToggleFilterIdReducer('filterIdentityIds')

export const toggleMailboxDomainFilter = createToggleFilterIdReducer('filterDomainIds')
export const clearMailboxDomainFilter = clearToggleFilterIdReducer('filterDomainIds')

const clearAllMailboxRelationFilters = compose(clearMailboxIdentityFilter, clearMailboxDomainFilter)

export const toggleUnreadFilter = state => state.set('unreadOnlyFilter', !state.unreadOnlyFilter)

export const setCustomComposeContactEmail = (state, { email }) => state.set('customComposeContactEmail', email)
export const clearCustomComposeContactEmail = state => state.set('customComposeContactEmail', null)

const clearTrashSuccess = (state) => {
  if (state.filterName !== 'trash') return state
  mailboxClearSelection(state)
  return state.merge({
    searchResultsData: {},
    searchResultsDataOrder: [],
    searchResultsDataTotalCount: 0
  })
}

const incrementTotal = (state, totalKey) => {
  if (!state.drawerTotals) return state
  const total = state.drawerTotals[totalKey] + 1
  return state.setIn(['drawerTotals', totalKey], total)
}

const decrementTotal = (state, totalKey) => {
  if (!state.drawerTotals) return state
  let total = state.drawerTotals[totalKey] - 1
  total = total > 0 ? total : 0
  return state.setIn(['drawerTotals', totalKey], total)
}

const drawerTotalsOptimisticUpdate = (state, { originalAction }) => {
  const keys = {
    sent: 'total_is_sent',
    trash: 'total_is_trash',
    unread: 'total_is_unread',
    queued: 'total_is_2factor',
    forwarded: 'total_is_forward',
    archive: 'total_is_archive'
  }

  if (!originalAction) return state

  const { type } = originalAction

  if (type === Types.SEND_MAIL_REQUEST) {
    if (state.filterName === 'queued') {
      return incrementTotal(decrementTotal(state, keys.sent), keys.queued)
    }
    return incrementTotal(state, keys.sent)
  }

  if (type === Types.MAILBOX_READ_SUCCESS && state.data[originalAction.id]) {
    return decrementTotal(state, keys.unread)
  }

  if (type === Types.MAILBOX_UNREAD_SUCCESS && state.data[originalAction.id]) {
    return incrementTotal(state, keys.unread)
  }

  if (type === Types.MAILBOX_ARCHIVE_SUCCESS) {
    const filterKey = state.filterName
    if (filterKey) {
      return incrementTotal(decrementTotal(state, keys[filterKey]), keys.archive)
    }
    return incrementTotal(state, keys.archive)
  }

  if (type === Types.MAILBOX_TRASH_SUCCESS) {
    const filterKey = state.filterName
    if (filterKey) {
      return incrementTotal(decrementTotal(state, keys[filterKey]), keys.trash)
    }
    return incrementTotal(state, keys.trash)
  }

  if (type === Types.MAILBOX_DELETE_SUCCESS) {
    return decrementTotal(state, keys[state.filterName])
  }

  if (type === Types.MAILBOX_SEND_QUEUED_REQUEST) {
    return incrementTotal(decrementTotal(state, keys.queued), keys.sent)
  }

  if (type === Types.MAILBOX_CLEAR_TRASH_SUCCESS) {
    return state.setIn(['drawerTotals', 'total_is_trash'], 0)
  }

  return state
}

// Reducer - mailbox reset

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

const extraTopLevelMap = {
  num_queued_outbound: 'numQueuedOutbound'
}

const BASE_REDUCERS_READ_API = baseApiReadReducerInit(
  REDUX_CONFIG.reducerPrefix, Types, REDUX_CONFIG.apiDataKey,
  REDUX_CONFIG.apiDataIndex, extraTopLevelMap
)

export const reducer = createReducer(INITIAL_STATE, {
  ...BASE_REDUCERS_READ_API,
  ...APIReducers,

  [Types.MAILBOX_SYNC_REQUEST]: mailboxSyncRequest,
  [Types.MAILBOX_SYNC_SUCCESS]: mailboxSyncSuccess,
  [Types.MAILBOX_SYNC_FAILURE]: mailboxSyncFailure,

  [Types.MAILBOX_DETAIL_REQUEST]: detailRequest,
  [Types.MAILBOX_DETAIL_SUCCESS]: detailSuccess,
  [Types.MAILBOX_DETAIL_FAILURE]: detailError,

  [Types.MAILBOX_ANALYTICS_REQUEST]: analyticsRequest,
  [Types.MAILBOX_ANALYTICS_SUCCESS]: analyticsSuccess,
  [Types.MAILBOX_ANALYTICS_FAILURE]: analyticsError,

  [Types.MAILBOX_READ_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.READ),
  [Types.MAILBOX_READ_SUCCESS]: createItemUpdateSuccessReducer([mailboxReadSuccess]),

  [Types.MAILBOX_UNREAD_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.UNREAD),
  [Types.MAILBOX_UNREAD_SUCCESS]: createItemUpdateSuccessReducer([mailboxUnreadSuccess]),

  [Types.MAILBOX_ARCHIVE_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.ARCHIVE),
  [Types.MAILBOX_ARCHIVE_SUCCESS]: createItemUpdateSuccessReducer([deleteItemSuccessReducer, mailboxUnselectEmail]),

  [Types.MAILBOX_UNARCHIVE_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.UNARCHIVE),
  [Types.MAILBOX_UNARCHIVE_SUCCESS]: createItemUpdateSuccessReducer([deleteItemSuccessReducer, mailboxUnselectEmail]),

  [Types.MAILBOX_MOVE_TO_INBOX_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.MOVE_TO_INBOX),
  [Types.MAILBOX_MOVE_TO_INBOX_SUCCESS]: createItemUpdateSuccessReducer([deleteItemSuccessReducer]),

  [Types.MAILBOX_TRASH_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.TRASH),
  [Types.MAILBOX_TRASH_SUCCESS]: createItemUpdateSuccessReducer([deleteItemSuccessReducer, mailboxUnselectEmail]),

  [Types.MAILBOX_UNTRASH_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.UNTRASH),
  [Types.MAILBOX_UNTRASH_SUCCESS]: createItemUpdateSuccessReducer([deleteItemSuccessReducer, mailboxUnselectEmail]),

  [Types.MAILBOX_DELETE_REQUEST]: createItemUpdateRequestReducer(MAIL_ITEM_UPDATE_TYPES.DELETE),
  [Types.MAILBOX_DELETE_SUCCESS]: createItemUpdateSuccessReducer([deleteItemSuccessReducer]),

  [Types.MAILBOX_UPDATE_ERROR]: createItemUpdateSuccessReducer([]),

  [Types.MAILBOX_SEND_QUEUED_REQUEST]: deleteItemSuccessReducer,
  [Types.MAILBOX_CLEAR_TRASH_SUCCESS]: clearTrashSuccess,

  [Types.MAILBOX_SELECT_EMAIL]: mailboxSelectEmail,
  [Types.MAILBOX_UNSELECT_EMAIL]: mailboxUnselectEmail,
  [Types.MAILBOX_CLEAR_SELECTION]: mailboxClearSelection,

  [Types.MAILBOX_TRASH_SELECTED_REQUEST]: selectedUpdateRequest,
  [Types.MAILBOX_TRASH_SELECTED_SUCCESS]: bulkDeleteSuccessReducer,

  [Types.MAILBOX_ARCHIVE_SELECTED_REQUEST]: selectedUpdateRequest,
  [Types.MAILBOX_ARCHIVE_SELECTED_SUCCESS]: bulkDeleteSuccessReducer,

  [Types.MAILBOX_READ_SELECTED_REQUEST]: selectedUpdateRequest,
  // [Types.MAILBOX_READ_SELECTED_SUCCESS]: mailboxClearSelection,

  [Types.MAILBOX_UNREAD_SELECTED_REQUEST]: selectedUpdateRequest,
  // [Types.MAILBOX_UNREAD_SELECTED_SUCCESS]: mailboxClearSelection,

  [Types.MAILBOX_DELETE_SELECTED_REQUEST]: selectedUpdateRequest,
  [Types.MAILBOX_DELETE_SELECTED_SUCCESS]: bulkDeleteSuccessReducer,

  [Types.SET_MAILBOX_FILTER]: setMailboxFilter,
  [Types.CLEAR_MAILBOX_FILTER]: clearMailboxFilter,

  [Types.TOGGLE_MAILBOX_IDENTITY_FILTER]: toggleMailboxIdentityFilter,
  [Types.CLEAR_MAILBOX_IDENTITY_FILTER]: clearMailboxIdentityFilter,

  [Types.TOGGLE_MAILBOX_DOMAIN_FILTER]: toggleMailboxDomainFilter,
  [Types.CLEAR_MAILBOX_DOMAIN_FILTER]: clearMailboxDomainFilter,

  [Types.CLEAR_ALL_MAILBOX_RELATION_FILTERS]: clearAllMailboxRelationFilters,

  [Types.TOGGLE_UNREAD_FILTER]: toggleUnreadFilter,

  [Types.SET_CUSTOM_COMPOSE_CONTACT_EMAIL]: setCustomComposeContactEmail,
  [Types.CLEAR_CUSTOM_COMPOSE_CONTACT_EMAIL]: clearCustomComposeContactEmail,

  [Types.DRAWER_TOTALS_OPTIMISTIC_UPDATE]: drawerTotalsOptimisticUpdate,

  [UserTypes.LOGOUT]: reset
})

/* ------------- Selectors ------------- */
