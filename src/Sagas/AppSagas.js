import { updateIntl } from 'react-intl-redux'
import { eventChannel } from 'redux-saga'
import { put, select, take, call } from 'redux-saga/effects'
import { NavigationActions, StackActions } from 'react-navigation'
import { AppState, NetInfo } from 'react-native'
import { path } from 'ramda'

import AppActions from 'commons/Redux/AppRedux'
import UserActions from 'commons/Redux/UserRedux'
import { IdentityTypes } from 'commons/Redux/IdentityRedux'
import OverlayActions, { OverlayIdentifiers } from 'app/Redux/OverlayRedux'

/**
 * Handle I18n.
 */

export function * applyLocaleWithUserData ({ data: { locale } }) {
  if (!locale) return

  const currentLocale = yield select(s => s.intl.locale)
  if (currentLocale !== locale) {
    yield applyLocale({ locale })
  }
}

export function * applyLocale ({ locale }) {
  if (!locale || locale === 'en-US') {
    return yield put(updateIntl({ locale: 'en-US', messages: {} }))
  }
  const { languages, translations } = require('translations/translations.json')
  if (languages.indexOf(locale) === -1) {
    return yield put(updateIntl({ locale: 'en-US', messages: {} }))
  }

  const currentTranslation = {}
  for (const key in translations) {
    if (translations.hasOwnProperty(key) &&
      (key.startsWith('native') || key.startsWith('app.Common') || key.startsWith('app.CommonValidation') ||
      key.startsWith('app.APIErrors') || key.startsWith('app.Auth') || key.startsWith('app.AuthValidation') || key.startsWith('app.Chat'))) {
      currentTranslation[key] = translations[key][locale]
    }
  }

  if (!currentTranslation) return
  yield put(updateIntl({ locale, messages: currentTranslation }))
}

/**
 * Handle user onboading completion by sending to mailbox view,
 * showing the education overlay & updating user display_name.
 */
export function * onBoardingComplete () {
  // Send user to Mailbox
  yield put(StackActions.reset({
    index: 1,
    key: null,
    actions: [
      NavigationActions.navigate({ routeName: 'Auth' }),
      NavigationActions.navigate({ routeName: 'UserArea' })
    ]
  }))

  // Show education overlay
  yield put(OverlayActions.showOverlay(OverlayIdentifiers.EDUCATION))

  // Set display_name on account

  const identityCount = yield select(s => path(['identity', 'data', 'length'], s))
  if (!identityCount) {
    yield take(IdentityTypes.IDENTITY_CREATE_SUCCESS)
  }

  const identityId = yield select(s => path(['identity', 'dataOrder', 0], s))
  if (!identityId) return

  const identity = yield select(s => path(['identity', 'data', identityId], s))
  if (identity && identity.display_name && identity.display_name !== identity.email) {
    yield put(UserActions.updateAccountRequest({ display_name: identity.display_name }))
  }
}

/**
 * App state change tracker.
 */

// AppState change event channel creator
export const createAppStateChangeEventChannel = () => eventChannel((emit) => {
  AppState.addEventListener('change', emit)
  return () => AppState.removeEventListener('change', emit)
})

// Listens to AppState change event channel and updates redux store
export function * trackAppStateChange () {
  const channel = yield call(createAppStateChangeEventChannel)
  while (true) {
    const state = yield take(channel)
    console.info('trackAppStateChange: new app state = ', state)
    yield put(AppActions.nativeAppStateChanged(state))
  }
}

/**
 * Network change tracker.
 */

// NetInfo.isConnected event channel creator
const createAppNetworkStateChangeEventChannel = () => eventChannel((emit) => {
  NetInfo.isConnected.addEventListener('connectionChange', emit)
  return () => NetInfo.isConnected.removeEventListener('connectionChange', emit)
})

// Listens to NetInfo.isConnected event channel and updates redux store
export function * trackNetworkStateChange () {
  const channel = yield call(createAppNetworkStateChangeEventChannel)
  while (true) {
    const state = yield take(channel)
    console.info('trackNetworkStateChange: new network state = ', state)
    yield put(AppActions.setNetworkState(state))
  }
}

export function * checkNetworkState () {
  const state = yield call(NetInfo.isConnected.fetch)
  yield put(AppActions.setNetworkState(state))
}

const createAppConnectionInfoChangeEventChannel = () => eventChannel(emit => {
  NetInfo.addEventListener('connectionChange', emit)
  return () => NetInfo.removeEventListener('connectionChange', emit)
})

export function * trackNetworkConnectionInfoChange () {
  // Get network connection information the first time
  const { type, effectiveType } = yield call([NetInfo, NetInfo.getConnectionInfo])
  console.log('trackNetworkConnectionInfoChange - initial - ', type, effectiveType)
  yield put(AppActions.setNativeAppNetworkConnectionInfo(type, effectiveType))

  const channel = yield call(createAppConnectionInfoChangeEventChannel)
  while (true) {
    const { type, effectiveType } = yield take(channel)
    console.log('trackNetworkConnectionInfoChange - change - ', type, effectiveType)
    yield put(AppActions.setNativeAppNetworkConnectionInfo(type, effectiveType))
  }
}
