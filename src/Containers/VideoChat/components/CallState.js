import React, { Component } from 'react'
import { View, Dimensions } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import EStyleSheet from 'react-native-extended-stylesheet'

import m from 'commons/I18n'
import { isRemoteVideoPlaying } from 'commons/Selectors/VideoChat'

import Text from 'app/Components/BaseText'
import Avatar from 'app/Components/Avatar'

const s = EStyleSheet.create({
  darkOverlay: {
    position: 'absolute',
    zIndex: 90,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },

  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  statusText: {
    marginTop: '3rem',
    fontSize: '1rem',
    color: 'white'
  },

  avatarText: {
    fontSize: '6rem',
    letterSpacing: '0.2rem'
  },

  contact: {
    paddingBottom: '1rem'
  },

  contactName: {
    color: 'white',
    fontSize: '1.2rem',
    textAlign: 'center'
  },

  contactEmail: {
    color: 'gray',
    fontSize: '1rem',
    textAlign: 'center',
  }
})

const CALL_STATE_MESSAGES = {
  TIMEOUT: m.native.Call.callEndReasonTimeout,
  REJECTED: m.native.Call.callEndReasonRejected,
  UNSUPPORTED: m.native.Call.callEndReasonUnsupported,
  CANCELLED: m.native.Call.callEndReasonCancelled,
  USER_BUSY: m.native.Call.callEndReasonUserBusy,
  MANUAL: m.native.Call.callEndReasonManual,
  CONNECTING: m.native.Call.callStateConnecting,
  CONNECTED: m.native.Call.callStateConnected,
  RINGING: m.native.Call.callStateRinging,
  UNKNOWN: m.native.Call.callEndReasonUnknown
}

const isPortrait = () => {
  const dim = Dimensions.get('screen')
  return dim.height >= dim.width
}

class CallState extends Component {
  static propTypes = {
    inProgress: PropTypes.bool,
    isConnected: PropTypes.bool,
    remoteVideoPlaying: PropTypes.bool,
    contactDisplayName: PropTypes.string,
    contactEmail: PropTypes.string,
    callEndReason: PropTypes.string,
    outboundCallDelivered: PropTypes.bool,
    intl: PropTypes.object
  }

  constructor(props) {
    super(props)
    const { width, height } = Dimensions.get('window')

    this.state = {
      AVATAR_HEIGHT: isPortrait() ? width : (height - 300)
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._orientationDidChange)
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._orientationDidChange)
  }

  _orientationDidChange = () => {
    const { width, height } = Dimensions.get('window')

    this.setState({
      AVATAR_HEIGHT: isPortrait() ? width : (height - 300)
    })
  }

  render () {
    const {
      inProgress, isConnected,
      contactDisplayName, contactEmail, remoteVideoPlaying,
      callEndReason, outboundCallDelivered, intl
    } = this.props

    if (isConnected && remoteVideoPlaying) return null

    let statusText = ''
    if (!inProgress) {
      statusText = callEndReason || 'UNKNOWN'
    } else if (!isConnected) {
      statusText = outboundCallDelivered ? 'RINGING' : 'CONNECTING'
    } else if (isConnected && !remoteVideoPlaying) {
      statusText = 'CONNECTED'
    }

    return (
      <View style={s.container}>
        <View style={s.contact}>
          <Text style={s.contactName}>{contactDisplayName}</Text>
          <Text style={s.contactEmail}>{contactEmail}</Text>
        </View>
        <Avatar
          name={contactDisplayName || contactEmail}
          email={contactEmail}
          avatarStyle={{
            width: this.state.AVATAR_HEIGHT * 0.62,
            height: this.state.AVATAR_HEIGHT * 0.62,
            borderRadius: 0
          }}
          textStyle={s.avatarText}
          size={this.state.AVATAR_HEIGHT}
        />
        <Text style={s.statusText}>{intl.formatMessage(CALL_STATE_MESSAGES[statusText])}</Text>
      </View>
    )
  }
}

const mapStateToProps = s => ({
  inProgress: s.webrtc.inProgress,
  isConnected: s.webrtc.isConnected,
  outboundCallDelivered: s.webrtc.outboundCallDelivered,
  remoteVideoPlaying: isRemoteVideoPlaying(s)
})

export default connect(mapStateToProps)(injectIntl(CallState))
