import AppNavigator from 'app/Navigation'
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware
  // createNavigationReducer
} from 'react-navigation-redux-helpers'
import { connect } from 'react-redux'

export const getCurrentRouteName = (state) => {
  const route = state.routes[state.index]
  return typeof route.index === 'undefined' ? route.routeName : getCurrentRouteName(route)
}

const initialState = AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams('Launch'))

export default (state = initialState, action) => {
  const nextState = AppNavigator.router.getStateForAction(action, state)

  // prevents navigating twice to the same route
  if (action.type === 'Navigation/NAVIGATE' && state && nextState) {
    const stateRouteName = getCurrentRouteName(state)
    const nextStateRouteName = getCurrentRouteName(nextState)
    return stateRouteName === nextStateRouteName ? state : Object.assign({}, { ...nextState }, { previousRouteName: stateRouteName })
  }

  // Simply return the original `state` if `nextState` is null or undefined.

  return nextState || state
}

export const middleware = createReactNavigationReduxMiddleware(
  'nav',
  state => state.nav
)

const App = reduxifyNavigator(AppNavigator, 'nav')
const mapStateToProps = (state) => ({
  state: state.nav
})

export const AppWithNavigationState = connect(mapStateToProps)(App)
