import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity, Platform, StatusBar } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { NavigationActions } from 'react-navigation'
import { injectIntl } from 'react-intl'
import { ifIphoneX } from 'react-native-iphone-x-helper'

import m from 'commons/I18n'
import Text from 'app/Components/BaseText'
import Timer from 'app/Components/Timer'
import palette from 'app/Styles/colors'
import { getCurrentRouteName } from 'app/Navigation/utils'

const CALL_STATUS_HEIGHT = (Platform.OS === 'ios' ? ifIphoneX(44, 20) : StatusBar.currentHeight) + 40
const VIDEO_CHAT_ROUTE_NAME = 'VideoChat'

const s = EStyleSheet.create({
  status: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: CALL_STATUS_HEIGHT,
    backgroundColor: 'rgb(58,206,1)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15
  },

  text: {
    color: '#fff'
  }
})

class VideoChatStatusProvider extends Component {
  static propTypes = {
    startTime: PropTypes.instanceOf(Date),
    currentRouteName: PropTypes.string.isRequired,
    localFeedURL: PropTypes.string
  }

  constructor (props) {
    super(props)

    this._shouldShowStatusBar = this._shouldShowStatusBar.bind(this)
    this._getContainerStyle = this._getContainerStyle.bind(this)
    this._goToVideoChat = this._goToVideoChat.bind(this)
    this._renderStatusBar = this._renderStatusBar.bind(this)
  }

  _shouldShowStatusBar () {
    const {
      localFeedURL,
      currentRouteName
    } = this.props

    if (currentRouteName === VIDEO_CHAT_ROUTE_NAME) {
      return false
    }

    if (localFeedURL) {
      return true
    }

    return false
  }

  _getContainerStyle () {
    let paddingTop = 0
    if (this._shouldShowStatusBar()) {
      paddingTop = CALL_STATUS_HEIGHT - 20
    }
    return {
      flex: 1,
      paddingTop
    }
  }

  _goToVideoChat () {
    const { navigate } = this.props
    navigate({ routeName: 'VideoChat' })
  }

  _renderStatusBar () {
    const { startTime, intl } = this.props
    if (!this._shouldShowStatusBar()) {
      return null
    }
    return (
      <TouchableOpacity style={s.status} onPress={this._goToVideoChat}>
        <Text style={s.text}>{intl.formatMessage(m.native.Snackbar.touchToReturnToCall)} </Text>
        {startTime && <Timer style={s.text} startDate={startTime} />}
      </TouchableOpacity>
    )
  }

  render () {
    const { children } = this.props
    return (
      <View style={this._getContainerStyle()}>
        {children}
        {this._renderStatusBar()}
      </View>
    )
  }
}

const IntlVideoChatStatusProvider = injectIntl(VideoChatStatusProvider)
const mapStateToProps = (state) => ({
  startTime: state.webrtc.startTime,
  currentRouteName: getCurrentRouteName(state.nav),
  localFeedURL: state.webrtc.localFeedURL
})

const mapDispatchToProps = {
  navigate: NavigationActions.navigate
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlVideoChatStatusProvider)
