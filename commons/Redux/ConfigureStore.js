import { createStore, applyMiddleware, compose } from 'redux'
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import { not, contains, path } from 'ramda'

import Config from 'app/Config/DebugSettings'

import { StartupTypes } from './StartupRedux'

const SAGA_LOGGING_BLACKLIST = [
  'EFFECT_TRIGGERED',
  'EFFECT_RESOLVED',
  'EFFECT_REJECTED'
]

const REDUX_FORM_LOGGING_BLACKLIST = [
  'redux-form/CHANGE', 'redux-form/REGISTER_FIELD'
]

const REACT_NATIVE_ROUTER_FLUX_LOGGING_BLACKLIST = [
  'REACT_NATIVE_ROUTER_FLUX_FOCUS',
  'REACT_NATIVE_ROUTER_FLUX_REFRESH',
  'REACT_NATIVE_ROUTER_FLUX_RESET',
  'REACT_NATIVE_ROUTER_FLUX_BACK',
  'REACT_NATIVE_ROUTER_FLUX_BACK_ACTION',
  'REACT_NATIVE_ROUTER_FLUX_JUMP'
]

// creates the store
export default (rootReducer, rootSaga, initialState, customEnhancers = []) => {
  const isReactNative = path(['device', 'isReactNative'], initialState)

  /* ------------- Redux Configuration ------------- */

  const middleware = []
  const enhancers = []

  /* ------------- Saga Middleware ------------- */

  const sagaMiddleware = createSagaMiddleware()
  middleware.push(sagaMiddleware)

  /* ------------- Logger Middleware ------------- */

  if (__DEV__) {
    // the logger master switch
    const USE_LOGGING = Config.reduxLogging
    // silence these saga-based messages
    // create the logger
    const logger = createLogger({
      predicate: (getState, { type }) => USE_LOGGING && not(contains(type, SAGA_LOGGING_BLACKLIST))
    })
    middleware.push(logger)
  }

  /* ------------- Assemble Middleware ------------- */

  enhancers.push(applyMiddleware(...middleware))

  /* ------------- Redux Devtools Extension (web app only) ------------- */

  let composeEnhancers = compose

  if (__DEV__) {
    const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    if (typeof composeWithDevToolsExtension === 'function') {
      composeEnhancers = composeWithDevToolsExtension
    }
  }

  const store = createStore(rootReducer, initialState, composeEnhancers(...enhancers, ...customEnhancers))

  // kick off root saga
  sagaMiddleware.run(rootSaga)

  return store
}
