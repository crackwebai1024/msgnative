import React, { Component } from 'react'
import { View, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import KeepAwake from 'react-native-keep-awake'
import PropTypes from 'prop-types'

import {
  isRemoteVideoPlaying,
  isLocalVideoPlaying
} from 'commons/Selectors/VideoChat'
import palette from 'app/Styles/colors'
import { getContactByEmail } from 'commons/Selectors/Contact'

import Header from './components/Header'
import BottomTools from './components/BottomTools'
import PrimaryVideo from './components/PrimaryVideo'
import SecondaryVideo from './components/SecondaryVideo'
import CallState from './components/CallState'

const s = EStyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.black
  }
})

const isProd = process.env.NODE_ENV === 'production'

class VideoChat extends Component {
  static navigationOptions = ({ navigation }) => ({
    navBarVisible: false,
    tabBarVisible: false,
    header: null
  })

  static propTypes = {
    navigation: PropTypes.object,
    remoteVideoPlaying: PropTypes.bool,
    localVideoPlaying: PropTypes.bool,
    remoteFeedURL: PropTypes.string,
    localFeedURL: PropTypes.string,
    isConnected: PropTypes.bool,
    inProgress: PropTypes.bool,
    contactEmail: PropTypes.string,
    contactDisplayName: PropTypes.string
  }

  constructor (props) {
    super(props)

    const { height, width } = Dimensions.get('window')
    this.state = {
      containerWidth: width,
      containerHeight: height,
      contactEmail: props.contactEmail,
      contactDisplayName: props.contactDisplayName,
      callEndReason: null
    }

    this.setCallEndReason = this.setCallEndReason.bind(this)
  }

  static getDerivedStateFromProps (props, state) {
    if (props.callEndReason && !state.callEndReason) {
      return { callEndReason: props.callEndReason }
    }

    return null
  }

  setCallEndReason (reason) {
    this.setState({ callEndReason: reason })
  }

  componentDidMount () {
    try {
      KeepAwake.activate()
    } catch (e) {}
  }

  componentWillUnmount () {
    console.info('VideoChat: componentWillUnmount')
    try {
      KeepAwake.deactivate()
    } catch (e) {}
  }

  // Note: Previously we were using onLayout callback to get
  // the dimensions but it causes the app to get stuck
  // in debug mode when not connected to remote debugger

  // _onLayout (e) {
  //   console.log('Video Chat _onLayout', e)
  //   this.setState({
  //     containerWidth: e.nativeEvent.layout.width,
  //     containerHeight: e.nativeEvent.layout.height
  //   })
  // }

  render () {
    const {
      navigation,
      remoteVideoPlaying,
      localVideoPlaying,
      remoteFeedURL,
      localFeedURL,
      isConnected,
      inProgress
    } = this.props

    const {
      containerWidth,
      containerHeight,
      contactEmail,
      contactDisplayName,
      callEndReason
    } = this.state

    return (
      <View style={s.container}>
        <PrimaryVideo
          remoteFeedURL={remoteFeedURL}
          remoteVideoPlaying={remoteVideoPlaying}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
        <SecondaryVideo
          isConnected={isConnected}
          localFeedURL={localFeedURL}
          localVideoPlaying={localVideoPlaying}
        />
        <Header
          navigation={navigation}
          inProgress={inProgress}
          contactEmail={contactEmail}
          contactDisplayName={contactDisplayName}
        />
        <CallState
          contactEmail={contactEmail}
          contactDisplayName={contactDisplayName}
          callEndReason={callEndReason}
        />
        <BottomTools
          endCall={this._endCall}
          disabled={!inProgress}
          setCallEndReason={this.setCallEndReason}
        />
        {/* { !isProd && <Logger /> } */}
      </View>
    )
  }
}

const mapStateToProps = s => {
  // Select display name from local contacts 
  // TODO: the correct display_name should come from the inbound call signal
  const contact = getContactByEmail(s.webrtc.contactEmail)(s)

  return {
    inProgress: s.webrtc.inProgress,
    isConnected: s.webrtc.isConnected,
    remoteFeedURL: s.webrtc.remoteFeedURL,
    localFeedURL: s.webrtc.localFeedURL,
    contactEmail: s.webrtc.contactEmail,
    contactDisplayName: contact ? contact.display_name : s.webrtc.contactDisplayName,
    callEndReason: s.webrtc.callEndReason,
    remoteVideoPlaying: isRemoteVideoPlaying(s),
    localVideoPlaying: isLocalVideoPlaying(s),
  }
}

export default connect(mapStateToProps)(VideoChat)
