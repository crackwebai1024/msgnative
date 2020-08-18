import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, ScrollView } from 'react-native'
import EStylesheet from 'react-native-extended-stylesheet'
import Immutable from 'seamless-immutable'
import {
  // BallIndicator,
  // BarIndicator,
  // DotIndicator,
  // MaterialIndicator,
  // PacmanIndicator,
  // PulseIndicator,
  // SkypeIndicator,
  // UIActivityIndicator,
  WaveIndicator
} from 'react-native-indicators'

// import { GET_USER_MEDIA_STATE } from 'commons/Redux/WebrtcRedux'

// import Text from 'app/Components/BaseText'

const s = EStylesheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 0,
    left: 0,
    bottom: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: 1001
  },

  title: {
    color: '#fff',
    backgroundColor: 'transparent',
    marginBottom: '1rem',
    paddingTop: '1rem',
    paddingLeft: '1rem'
  },

  logsContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '8rem',
    maxHeight: '8rem'
  },

  logs: {
    width: '100%',
    paddingHorizontal: '1rem',
    maxHeight: '8rem'
  },

  log: {
    marginBottom: '0.25rem',
    display: 'flex'
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
    // alignItems: 'center',
  },

  logTitle: {
    color: '#999'
  },

  logBody: {
    color: '#ddd',
    fontStyle: 'italic'
  }
})

class CallLoading extends Component {
  render () {
    return (
      <View style={s.container}>
        <View>
          <WaveIndicator color='white' size={200} waveMode='outline' />
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  localIceConnectionState: state.webrtc.local.iceConnectionState,
  localIceGatheringState: state.webrtc.local.iceGatheringState,
  localIceCandidates: state.webrtc.local.iceCandidates,
  localDescription: state.webrtc.local.description,
  getLocalUserMediaState: state.webrtc.local.getUserMediaState,
  remoteIceConnectionState: state.webrtc.remote.iceConnectionState,
  remoteIceGatheringState: state.webrtc.remote.iceGatheringState,
  remoteIceCandidates: state.webrtc.remote.iceCandidates,
  remoteDescription: state.webrtc.remote.description,
  getRemoteUserMediaState: state.webrtc.remote.getUserMediaState
})

export default connect(mapStateToProps)(CallLoading)
