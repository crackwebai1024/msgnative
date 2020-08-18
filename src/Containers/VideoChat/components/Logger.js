import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, ScrollView } from 'react-native'
import EStylesheet from 'react-native-extended-stylesheet'
import Immutable from 'seamless-immutable'

import { GET_USER_MEDIA_STATE } from 'commons/Redux/WebrtcRedux'

import Text from 'app/Components/BaseText'

const s = EStylesheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 0,
    left: 0,
    bottom: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000
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

const getUserMediaBodyMap = {
  [GET_USER_MEDIA_STATE.START_AUDIO_VIDEO]: 'creating video stream',
  [GET_USER_MEDIA_STATE.END_AUDIO_VIDEO]: 'video stream created!',
  [GET_USER_MEDIA_STATE.START_AUDIO]: 'creating audio stream',
  [GET_USER_MEDIA_STATE.END_AUDIO]: 'audio stream created!'
}

class CallLogger extends Component {
  constructor (props) {
    super(props)

    this.state = {
      logs: Immutable([])
    }

    this._renderLogs = this._renderLogs.bind(this)
  }

  _renderLogs () {
    if (this.state.logs.length === 0) return null

    return this.state.logs.slice(-5).map(log => (
      <View style={s.log} key={Math.ceil(Math.random() * 1000000)}>
        <Text style={s.logTitle}>{log.title} &nbsp; {log.body}</Text>
      </View>
    ))
  }

  _addLog (log) {
    this.setState({ logs: this.state.logs.concat([log]) })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.localIceConnectionState !== nextProps.localIceConnectionState) {
      this._addLog({
        title: 'ICE Connection: ',
        body: nextProps.localIceConnectionState
      })
    }

    if (this.props.localIceGatheringState !== nextProps.localIceGatheringState) {
      this._addLog({
        title: 'ICE Gathering: ',
        body: nextProps.localIceGatheringState
      })
    }

    if (this.props.localIceCandidates !== nextProps.localIceCandidates) {
      this._addLog({
        title: 'ICE Candidate count: ',
        body: nextProps.localIceCandidates.length
      })
    }

    if (this.props.localDescription !== nextProps.localDescription) {
      this._addLog({
        title: 'Session Description: ',
        body: 'updated!'
      })
    }

    if (this.props.getLocalUserMediaState !== nextProps.getLocalUserMediaState) {
      this._addLog({
        title: 'getUserMedia(): ',
        body: getUserMediaBodyMap[nextProps.getLocalUserMediaState]
      })
    }

    // Remote state change
    if (this.props.remoteIceConnectionState !== nextProps.remoteIceConnectionState) {
      this._addLog({
        title: 'Remote ICE Connection: ',
        body: nextProps.remoteIceConnectionState
      })
    }

    if (this.props.remoteIceGatheringState !== nextProps.remoteIceGatheringState) {
      this._addLog({
        title: 'Remote ICE Gathering: ',
        body: nextProps.remoteIceGatheringState
      })
    }

    if (this.props.remoteIceCandidates !== nextProps.remoteIceCandidates) {
      this._addLog({
        title: 'Remote ICE Candidate count: ',
        body: nextProps.remoteIceCandidates && nextProps.remoteIceCandidates.length
      })
    }

    if (this.props.remoteDescription !== nextProps.remoteDescription) {
      this._addLog({
        title: 'Remote Session description: ',
        body: 'updated!'
      })
    }

    if (this.props.getRemoteUserMediaState !== nextProps.getRemoteUserMediaState) {
      this._addLog({
        title: 'Remote getUserMedia(): ',
        body: getUserMediaBodyMap[nextProps.getRemoteUserMediaState]
      })
    }
  }

  render () {
    return (
      <View style={s.container}>
        {/* <Text style={s.title}> */}
        {/* Video Chat Events: */}
        {/* </Text> */}
        <ScrollView
          style={s.logs}
          contentContainerStyle={s.logsContainer}
          ref={(ref) => { this.scrollView = ref }}
          onContentSizeChange={(contentWidth, contentHeight) => {
            this.scrollView.scrollToEnd({ animated: true })
          }}
        >
          {this._renderLogs()}
        </ScrollView>
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

export default connect(mapStateToProps)(CallLogger)
