import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'

import WebrtcActions, { CALL_END_REASON } from 'commons/Redux/WebrtcRedux'

import palette from 'app/Styles/colors'

const END_CALL_BUTTON_HEIGHT = 60

const s = EStyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 95,
    // marginBottom: '1rem',
    height: 90,
    paddingTop: 25,
    paddingBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)'
  },

  endCall: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: END_CALL_BUTTON_HEIGHT,
    width: END_CALL_BUTTON_HEIGHT,
    backgroundColor: palette.pomegranate,
    borderRadius: END_CALL_BUTTON_HEIGHT / 2
  },

  endCallIcon: {
    color: 'white',
    fontSize: '1.65rem',
    backgroundColor: 'transparent',
    transform: [{ rotate: '135deg' }]
  },

  endCallDisabled: {
    backgroundColor: palette.concrete,
    opacity: 0.8
  },

  icons: {
    position: 'absolute',
    left: 0,
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingRight: END_CALL_BUTTON_HEIGHT / 2
  },

  iconWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.5rem'
  },

  icon: {
    color: 'white',
    fontSize: '1.5rem',
    backgroundColor: 'transparent'
  },

  iconRed: {
    color: 'red',
    fontSize: '1.5rem',
    backgroundColor: 'transparent'
  },

  iconDisabled: {
    color: palette.silver,
    opacity: 0.8
  }

})

class CallBottomTools extends Component {
  static propTypes = {
    endVideoCall: PropTypes.func,
    toggleCallCamera: PropTypes.func.isRequired,
    toggleCallMic: PropTypes.func.isRequired,
    toggleCallSpeaker: PropTypes.func.isRequired,
    localMicEnabled: PropTypes.bool,
    localCameraEnabled: PropTypes.bool,
    localSpeakerEnabled: PropTypes.bool,
    isOutboundCall: PropTypes.bool,
    isConnected: PropTypes.bool,
    disabled: PropTypes.bool,
    setCallEndReason: PropTypes.func
  }

  constructor (props) {
    super(props)

    this._endCall = this._endCall.bind(this)
  }

  _endCall () {
    const {
      isConnected,
      isOutboundCall,
      endVideoCall,
      setCallEndReason
    } = this.props

    let reason = CALL_END_REASON.MANUAL
    if (!isConnected && isOutboundCall) {
      reason = CALL_END_REASON.CANCELLED
    }

    setCallEndReason(reason)

    console.log('calling endVideoCall: call ended by UI red button')
    endVideoCall(reason)
  }

  _renderEndCall () {
    const { disabled } = this.props

    return (
      <TouchableOpacity style={[s.endCall, disabled && s.endCallDisabled]} onPress={this._endCall} disabled={disabled}>
        <Icon name='phone' style={s.endCallIcon} />
      </TouchableOpacity>
    )
  }

  _renderHelpers () {
    const {
      toggleCallCamera,
      toggleCallMic,
      toggleCallSpeaker,
      localMicEnabled,
      localCameraEnabled,
      localSpeakerEnabled,
      disabled
    } = this.props

    return (
      <View style={s.icons}>
        <TouchableOpacity style={s.iconWrapper} onPress={() => toggleCallCamera(!localCameraEnabled)} disabled={disabled}>
          <Icon
            style={[localCameraEnabled ? s.icon : s.iconRed, disabled && s.iconDisabled]}
            name={localCameraEnabled ? 'eye' : 'eye-slash'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={s.iconWrapper} onPress={() => toggleCallMic(!localMicEnabled)} disabled={disabled}>
          <Icon
            style={[localMicEnabled ? s.icon : s.iconRed, disabled && s.iconDisabled]}
            name={localMicEnabled ? 'microphone' : 'microphone-slash'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={s.iconWrapper} onPress={() => toggleCallSpeaker(!localSpeakerEnabled)} disabled={disabled}>
          <Icon
            style={[s.icon, disabled && s.iconDisabled]}
            name={localSpeakerEnabled ? 'volume-up' : 'volume-down'}
          />
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    return (
      <View style={s.container}>
        {this._renderHelpers()}
        {this._renderEndCall()}
      </View>
    )
  }
}

const mapStateToProps = s => ({
  isConnected: s.webrtc.isConnected,
  isOutboundCall: s.webrtc.isOutboundCall,
  localMicEnabled: s.webrtc.localMicEnabled,
  localCameraEnabled: s.webrtc.localCameraEnabled,
  localSpeakerEnabled: s.webrtc.localSpeakerEnabled
})

const mapDispatchToProps = {
  toggleCallCamera: WebrtcActions.toggleCallCamera,
  toggleCallMic: WebrtcActions.toggleCallMic,
  toggleCallSpeaker: WebrtcActions.toggleCallSpeaker,
  endVideoCall: WebrtcActions.endVideoCall
}

export default connect(mapStateToProps, mapDispatchToProps)(CallBottomTools)
