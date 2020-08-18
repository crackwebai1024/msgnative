import React, { Component } from 'react'
import { Platform, NativeEventEmitter, NativeModules } from 'react-native'
import { Provider } from 'react-redux'
import { applyMiddleware } from 'redux'
import Immutable from 'seamless-immutable'
import applyConfigSettings from 'app/Config'
import createStore from 'app/Redux/CreateStore'
// import { getDeviceInfo } from 'app/Lib/Device'
import StartupActions from 'commons/Redux/StartupRedux'
import RootContainer from './RootContainer'
import PrivacySnapshot from 'react-native-privacy-snapshot'
import BFService from 'modules/BackgroundToForegroundService'
import { bugsnag } from '../Services/Bugsnag'
import { middleware } from 'app/Redux/NavigationRedux'
import { addLocaleData } from 'react-intl'

import enLocaleData from 'react-intl/locale-data/en'
import esLocaleData from 'react-intl/locale-data/es'
import ruLocaleData from 'react-intl/locale-data/ru'
import arLocaleData from 'react-intl/locale-data/ar'
import frLocaleData from 'react-intl/locale-data/fr'
import hiLocaleData from 'react-intl/locale-data/hi'
import deLocaleData from 'react-intl/locale-data/de'
import jaLocaleData from 'react-intl/locale-data/ja'
import zhLocaleData from 'react-intl/locale-data/zh'
import roLocaleData from 'react-intl/locale-data/ro'
import nlLocaleData from 'react-intl/locale-data/nl'
import trLocaleData from 'react-intl/locale-data/tr'
import ptLocaleData from 'react-intl/locale-data/pt'

addLocaleData([
  ...arLocaleData, ...deLocaleData, ...enLocaleData,
  ...esLocaleData, ...frLocaleData, ...hiLocaleData,
  ...jaLocaleData, ...nlLocaleData, ...ptLocaleData,
  ...roLocaleData, ...ruLocaleData, ...trLocaleData,
  ...zhLocaleData
])
/*
if (process.env.NODE_ENV !== 'production') {
  // Enable this when you only work on optimizing re-rendering
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React, {
    include: [/SectionListContainer/, /Contacts/, /Identity/],
    exclude: [/^View$/, /InjectIntl/, /shouldUpdate/, /withHandlers/]
  })
}
 */
bugsnag.setUser('-1', '', '')

if (Platform.OS === 'ios') {
  const { RNImportService } = NativeModules

  const importServiceEmitter = new NativeEventEmitter(RNImportService)
  importServiceEmitter.addListener(
    RNImportService.FILES_IMPORTED,
    (files) => {
      console.info('File Imported:', files)
    }
  )

  // Triggers the notification if the file is imported from the dead state
  RNImportService.checkImportedFiles()
}

// Apply config overrides
applyConfigSettings()

// create our store
const store = createStore({
  user: Immutable({
    data: {}
  }),
  intl: {
    locale: 'en-US',
    messages: {}
  }
}, applyMiddleware(middleware))
// Startup
store.dispatch(StartupActions.startup())

/**
 * Provides an entry point into our application.  Both index.ios.js and index.android.js
 * call this component first.
 *
 * We create our Redux store here, put it into a provider and then bring in our
 * RootContainer.
 *
 * We separate like this to play nice with React Native's hot reloading.
 */
class App extends Component {
  componentWillMount () {
    if (Platform.OS === 'ios') {
      try {
        PrivacySnapshot.enabled(true)
      } catch (e) {
        console.info('Failed to set PrivacySnapshot')
      }
    }
  }

  componentDidMount () {}

  componentWillUnmount () {
    // importSubscription.remove();
    if (Platform.OS === 'ios') {
      try {
        PrivacySnapshot.enabled(false)
      } catch (e) {
        console.info('Failed to disable PrivacySnapshot')
      }
    }
  }

  render () {
    return (
      <Provider store={store}>
        <RootContainer />
      </Provider>
    )
  }
}

export default App
