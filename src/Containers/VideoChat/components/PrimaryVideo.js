import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { RTCView } from 'react-native-webrtc'
import EStyleSheet from 'react-native-extended-stylesheet'

const s = EStyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0
  }
})

class CallPrimaryVideo extends Component {
  static propTypes = {
    remoteFeedURL: PropTypes.string,
    remoteVideoPlaying: PropTypes.bool,
    containerWidth: PropTypes.number,
    containerHeight: PropTypes.number
  }

  render () {
    const {
      remoteFeedURL,
      remoteVideoPlaying,
      containerWidth,
      containerHeight
    } = this.props

    const videoStyle = [s.container, {
      width: containerWidth,
      height: containerHeight
    }]

    return (
      <RTCView
        key='primary_video'
        streamURL={remoteVideoPlaying ? remoteFeedURL : null}
        style={videoStyle}
        objectFit='cover'
        zOrder={1}
      />
    )
  }
}

export default CallPrimaryVideo
