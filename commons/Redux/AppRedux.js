import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  applyLocale: ['locale'],

  newBuildAvailable: ['build'],

  webViewEmbedded: ['isWebView'],

  onBoardingComplete: null,

  // action dispatched when the databse is initialzed
  cacheDBIsReady: null,

  // action dispatched on user login to start sync – dispatched by platform specific code
  readyForSync: null,

  // action dispatched to make sure all data from previous session is cleaned
  ensureDataCleanUpOnLogout: null,

  // Track app's state (active, background)
  nativeAppStateChanged: ['newState'],

  // Track whether network is online or offline
  setNetworkState: ['networkState'], // Set the current network state
  checkNetworkState: null, // Check network state manually

  // Track network connection info (none/wifi/cellular/unknown and 2g/3g/4g/unknown)
  setNativeAppNetworkConnectionInfo: ['networkType', 'networkEffectiveType'],

  scheduleConnectionTimeout: ['delay'],

  setConnectionTimeout: ['isTimeout'],

  setIsLaunchedFromNotificationTray: ['payload'],

  setMaintenanceMode: null
})

export const AppTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  build: null,
  newBuild: null,
  isNewBuildAvailable: false,
  maintenance: false,
  isWebViewEmbedded: false,
  isNetworkOnline: false,
  nativeAppState: null,
  nativeAppNetworkType: null,
  nativeAppNetworkEffectiveType: null,
  connectionTimeout: false,
  isLaunchedFromNotificationTray: false
})

/* ------------- Reducers ------------- */

const newBuildAvailable = (state, { build }) => state.merge({
  isNewBuildAvailable: true,
  newBuild: build
})

const webViewEmbedded = (state, { isWebView }) => state.setIn(['isWebViewEmbedded'], isWebView)

const setNetworkState = (state, { networkState }) => state.setIn(['isNetworkOnline'], networkState)

const nativeAppStateChanged = (state, { newState }) => state.set('nativeAppState', newState)

const setNativeAppNetworkConnectionInfo = (state, { networkType, networkEffectiveType }) =>
  state.merge({ nativeAppNetworkType: networkType, nativeAppNetworkEffectiveType: networkEffectiveType })

const maintenanceModeChanged = state => state.set('maintenance', true)

const setIsLaunchedFromNotificationTray = (state, { payload }) => state.set('isLaunchedFromNotificationTray', payload)

const setConnectionTimeout = (state, { isTimeout }) => state.set('connectionTimeout', !!isTimeout)

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.NEW_BUILD_AVAILABLE]: newBuildAvailable,
  [Types.WEB_VIEW_EMBEDDED]: webViewEmbedded,
  [Types.SET_NETWORK_STATE]: setNetworkState,
  [Types.NATIVE_APP_STATE_CHANGED]: nativeAppStateChanged,
  [Types.SET_NATIVE_APP_NETWORK_CONNECTION_INFO]: setNativeAppNetworkConnectionInfo,
  [Types.SET_CONNECTION_TIMEOUT]: setConnectionTimeout,
  [Types.SET_IS_LAUNCHED_FROM_NOTIFICATION_TRAY]: setIsLaunchedFromNotificationTray,
  [Types.SET_MAINTENANCE_MODE]: maintenanceModeChanged
})

/* ------------- Selectors ------------- */
