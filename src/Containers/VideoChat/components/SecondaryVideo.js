import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { RTCView } from 'react-native-webrtc'
import EStyleSheet from 'react-native-extended-stylesheet'

const s = EStyleSheet.create({
  video: {
    /* transform: [
      { scaleX: -1 }
    ], */
    right: 19,
    bottom: 20,
    height: 140,
    width: 80,
    position: 'absolute',
    zIndex: 100
  }
})

class CallSecondaryVideo extends Component {
  static propTypes = {
    localFeedURL: PropTypes.string,
    localVideoPlaying: PropTypes.bool,
    isConnected: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      right: 19
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.isConnected !== this.props.isConnected) {
      this.setState({ right: 20 })
    }
  }

  render () {
    const { localFeedURL, localVideoPlaying } = this.props

    return (
      <RTCView
        key='secondary_video'
        streamURL={localFeedURL}
        mirror
        style={[s.video, { width: localVideoPlaying ? 80 : 0, right: localVideoPlaying ? 19: -100 }]}
        objectFit='cover'
        zOrder={2}
      />
    )
  }
}

export default CallSecondaryVideo
