import { Alert } from 'react-native'
import m from 'commons/I18n'

export const promptIfDirty = (navigation, fm) => () => {
  if (!navigation.state.params || !navigation.state.params.dirty) {
    navigation.goBack()
    return
  }
  Alert.alert(
    fm(m.native.Snackbar.areYouSure),
    fm(m.native.Snackbar.changesWillBeDiscarded),
    [
      {
        text: fm(m.app.Common.discard),
        onPress: () => navigation.goBack()
      },
      {
        text: fm(m.app.Common.cancel),
        style: 'cancel',
        onPress: () => {}
      }
    ]
  )
}

// gets the current route from navigation state
export const getCurrentRoute = (navigationState) => {
  if (!navigationState) return null

  const route = navigationState.routes[navigationState.index]
  // dive into nested navigators
  if (route.routes) return getCurrentRoute(route)

  return route
}

// gets the current routeName from navigation state
export const getCurrentRouteName = (navigationState) => {
  const route = getCurrentRoute(navigationState)
  if (route) return route.routeName
}

export const getActiveParentRouteName = (nav) => {
  const route = nav.routes[nav.index]
  return typeof route.index === 'undefined' ? nav.routes[0].routeName : getActiveParentRouteName(route)
}
