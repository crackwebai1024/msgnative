import navReducer from './NavigationRedux'

export default {
  nav: navReducer,
  overlay: require('./OverlayRedux').reducer,
  keyboard: require('./KeyboardRedux').reducer,
  deviceContact: require('./DeviceContactRedux').reducer,
  file: require('./FileRedux').reducer
}
