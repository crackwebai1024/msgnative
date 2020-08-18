import { all } from 'redux-saga/effects'

import { createRootReducer } from 'commons/Redux/'
import getCommonsSagas from 'commons/Sagas/'
import getAppSagas from 'app/Sagas/'
import configureStore from 'commons/Redux/ConfigureStore'

import customReducers from './reducers'

/**
 * Wrapper around `commons/Redux/ConfigureStore`'s `configureStore` function
 * that adds react-router specific plumbing.
 *
 * @param initialState
 */
export default (initialState = {}) => {
  // Collect commons and app specific sagas together
  // and create a generator function that yields them all
  // This will act the as the root saga for the app
  function * getRootSaga () {
    const _commonsRootSaga = getCommonsSagas(initialState)
    const _appRootSaga = getAppSagas(initialState)

    const _all = _commonsRootSaga.concat(_appRootSaga)
    yield all(_all)
  }

  const rootReducer = createRootReducer(customReducers)
  return configureStore(rootReducer, getRootSaga, initialState)
}
