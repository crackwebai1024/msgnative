import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { intlReducer } from 'react-intl-redux'

import configureStore from './ConfigureStore'
import getRootSaga from '../Sagas/'

/* ------------- Assemble The Reducers ------------- */

/**
 * Takes custom (platform specific) reducers, mixes it with the
 * common reducers and returns a root reducer created with combineReducers.
 *
 * @param customReducers
 */
export const createRootReducer = (customReducers = {}) => combineReducers({
  app: require('./AppRedux').reducer,
  device: require('./DeviceRedux').reducer,
  router: require('./RouterRedux').reducer,
  form: formReducer,
  intl: intlReducer,
  user: require('./UserRedux').reducer,
  dashboard: require('./DashboardRedux').reducer,
  contact: require('./ContactRedux').reducer,
  identity: require('./IdentityRedux').reducer,
  useremail: require('./UserEmailRedux').reducer,
  domain: require('./DomainRedux').reducer,
  mailboxDomain: require('./MailboxDomainRedux').reducer,
  region: require('./RegionRedux').reducer,
  mailbox: require('./MailboxRedux').reducer,
  notification: require('./NotificationRedux').reducer,
  push: require('./PushRedux').reducer,
  accounthistory: require('./AccountHistoryRedux').reducer,
  chat: require('./ChatRedux').reducer,
  webrtc: require('./WebrtcRedux').reducer,
  callHistory: require('./CallHistoryRedux').reducer,
  crypto: require('./CryptoRedux').reducer,
  plan: require('./PlanRedux').reducer,
  payment: require('./PaymentRedux').reducer,
  paymentHistory: require('./PaymentHistoryRedux').reducer,
  avatar: require('./AvatarRedux').reducer,
  ...customReducers
})

/**
 * Configures and returns a store with reducers, sagas and initial state.
 *
 * @param initialState
 */
export default initialState => configureStore(createRootReducer(), getRootSaga(initialState), initialState)
