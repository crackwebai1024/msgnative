import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { StatusBar, Modal, TouchableOpacity, View, Dimensions, BackHandler } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions } from 'react-navigation'
import { injectIntl } from 'react-intl'
import StatusBarAlert from 'react-native-statusbar-alert'
import m from 'commons/I18n'
import AppActions from 'commons/Redux/AppRedux'
import { isLoggedIn } from 'commons/Selectors/User'
import Text from 'app/Components/BaseText'
import Notification from 'app/Components/Notification'
import VideoChatStatusProvider from 'app/Components/VideoChatStatusProvider'
// import AppNavigator from 'app/Navigation'
import Overlay from 'app/Containers/Overlay'
import { AppWithNavigationState } from 'app/Redux/NavigationRedux'
import IntlProvider from './IntlProvider'
import { getCurrentRouteName } from 'app/Navigation/utils'

const { width } = Dimensions.get('window')

class _IntlAppNavigator extends PureComponent {
  static propTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.any,
    nav: PropTypes.object
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  onBackPress = () => {
    const { dispatch, nav } = this.props
    const parentRouteName = nav.routes[nav.index].routeName
    const currentRouteName = getCurrentRouteName(nav)

    if ((parentRouteName === 'UserArea' || parentRouteName === 'Launch' || parentRouteName === 'Auth') &&
      (currentRouteName === 'AuthInitial' || currentRouteName === 'MailboxList')) {
      return false
    }
    dispatch(NavigationActions.back())
    return true
  }

  render () {
    const { intl, dispatch, nav } = this.props

    return (
      <AppWithNavigationState
        screenProps={{ fm: intl.formatMessage }}
      />
    )
  }
}

const IntlAppNavigator = injectIntl(_IntlAppNavigator)

class RootContainer extends PureComponent {
  static propTypes = {
    intl: PropTypes.object,
    loggedIn: PropTypes.bool,
    isNetworkOnline: PropTypes.bool,
    refreshNetwork: PropTypes.func,
    notificationMessage: PropTypes.string,
    notificationMessageType: PropTypes.string,
    dispatch: PropTypes.any,
    nav: PropTypes.object,
    socketDown: PropTypes.bool,
    socketConnecting: PropTypes.bool,
    connectionTimeout: PropTypes.bool
  }
  componentWillReceiveProps (nextProps) {
    if (this.props.loggedIn) {
      if (this.props.isNetworkOnline && !nextProps.isNetworkOnline) {
        this.props.refreshNetwork() // Force Refresh
      }
    }
  }

  componentWillMount () {
    this.props.refreshNetwork()
  }

  _renderSocketStatus () {
    const {
      loggedIn, socketDown, socketConnecting, connectionTimeout, intl
    } = this.props

    // Don't render network status when user is not logged in
    if (!loggedIn) return

    // Display socket status after the timeout
    if (!connectionTimeout) return

    // Don't render network status when neither of socketConnecting
    // or socketDown are true
    if (!socketConnecting && !socketDown) return

    const connectingMsg = (intl.messages || {})[m.native.Snackbar.connecting.id] || m.native.Snackbar.connecting.defaultMessage
    const socketDownMsg = (intl.messages || {})[m.native.Snackbar.socketDown.id] || m.native.Snackbar.socketDown.defaultMessage

    return (
      <StatusBarAlert
        visible
        message={socketConnecting ? connectingMsg : socketDownMsg}
        backgroundColor={socketConnecting ? 'yellow' : '#FC3B3F'}
        color={socketConnecting ? 'black' : 'white'}
        statusbarHeight={25}
      />
    )
  }

  _renderNetworkStatus () {
    return (
      <Modal
        animationType='slide'
        transparent
        visible={!this.props.isNetworkOnline && this.props.loggedIn}
      >
        <View
          style={{
            flex: 1, backgroundColor: '#00000087', alignItems: 'center', flexDirection: 'row'
          }}
        >
          <View
            style={{ flex: 1, alignItems: 'center', flexDirection: 'column' }}
          >
            <View style={{
              width: width * 0.7,
              backgroundColor: '#FFF',
              borderRadius: 10,
              paddingTop: 16,
              paddingBottom: 10
            }}
            >
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '500' }}>There Is No Network Connection</Text>
              <Text style={{
                textAlign: 'center', marginTop: 6, marginLeft: 16, marginRight: 16, fontSize: 12.5
              }}
              >Check your network connection and try again!
              </Text>
              <View
                style={{ borderTopWidth: 0.5, marginTop: 18, borderTopColor: '#00000037' }}
              >
                <TouchableOpacity
                  style={{ paddingTop: 12, paddingBottom: 2 }}
                  onPress={this.props.refreshNetwork}
                >
                  <Text style={{
                    textAlign: 'center', fontSize: 16, fontWeight: '500', color: '#0a60fe'
                  }}
                  >Refresh
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  render () {
    return (
      <IntlProvider>
        <View style={{ flex: 1 }}>
          {/* this._renderSocketStatus() */}
          {/* this._renderNetworkStatus() */}
          <StatusBar barStyle='default' />
          <VideoChatStatusProvider>
            <IntlAppNavigator
              dispatch={this.props.dispatch}
              nav={this.props.nav}
            />
          </VideoChatStatusProvider>
          <Notification
            message={this.props.notificationMessage}
            type={this.props.notificationMessageType}
          />
          <Overlay />
        </View>
      </IntlProvider>
    )
  }
}

const mapStateToProps = state => ({
  intl: state.intl,
  nav: state.nav,
  notificationMessage: state.notification.message,
  notificationMessageType: state.notification.messageType,
  isNetworkOnline: state.app.isNetworkOnline,
  refreshNetwork: state.app.refresh,
  socketDown: state.chat.socketDown,
  socketConnecting: state.chat.socketConnecting,
  loggedIn: isLoggedIn(state.user),
  connectionTimeout: state.app.connectionTimeout
})

const mapDispatchToProps = dispatch => ({
  refreshNetwork: () => dispatch(AppActions.checkNetworkState()),
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)
