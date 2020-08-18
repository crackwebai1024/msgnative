import { AppRegistry, YellowBox, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import App from './src/Containers/App'

// https://stackoverflow.com/questions/49789150/warning-ismounted-is-deprecated-in-plain-javascript-classes
const NativeModules = ['RNImportService', 'RNDocumentPicker', 'RNSearchBarManager',
  'RNSound', 'WebRTCModule', 'RCTSodium', 'RCTPrivacySnapshot', 'SQLite']
YellowBox.ignoreWarnings(NativeModules.map(mName => `Module ${mName} requires main queue setup`)) // remove warning messages in dev mode
YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated', 'Module RCTImageLoader',
  'Class RCTCxxModule', 'Class GenericShare', 'Class InstagramShare',
  'Class WhatsAppShare', 'Class GooglePlusShare',
  'Module RNShare'
])

global.__old_console_warn = global.__old_console_warn || console.warn
global.console.warn = str => {
  let tst = (str || '') + ''
  if (tst.startsWith('Warning: isMounted(...) is deprecated') || tst.indexOf('requires main queue setup since it overrides') > -1) {
    return
  }
  return global.__old_console_warn.apply(console, [str])
}

// Uncomment next line to view network requests in chrome debugger
global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest
global.FormData = global.originalFormData ? global.originalFormData : global.FormData

fetch // Ensure to get the lazy property

// RNDebugger only
if (window.__FETCH_SUPPORT__) {
  window.__FETCH_SUPPORT__.blob = false
}

if (Platform.OS === 'android') {
  global.Symbol = require('core-js/es6/symbol')
  require('core-js/fn/symbol/iterator')

  // collection fn polyfills
  require('core-js/fn/map')
  require('core-js/fn/set')
  require('core-js/fn/array/find')
}

EStyleSheet.build()

AppRegistry.registerComponent('MsgSafe', () => App)
