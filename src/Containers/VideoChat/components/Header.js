import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'
import { StatusBar } from 'react-native'

import { isRemoteVideoPlaying } from 'commons/Selectors/VideoChat'

import Text from 'app/Components/BaseText'

import CallDuration from './CallDuration'
import WebRTCStats from './WebRTCStats'

const s = EStyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    zIndex: 95,
    padding: '1rem',
  },

  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: '5rem',
    // paddingTop: '1rem', // In iOS, receive cold launch call from other app, space for the original app name 
    backgroundColor: 'transparent'
  },

  title: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600'
  },

  backIcon: {
    color: '#fff',
    fontSize: '2rem',
    paddingVertical: '0.25rem',
    paddingRight: '1rem'
  }
})

class CallHeader extends Component {
  static propTypes = {
    contactEmail: PropTypes.string,
    contactDisplayName: PropTypes.string,
    remoteVideoPlaying: PropTypes.bool,
    navigation: PropTypes.object,
    inProgress: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this._goToContact = this._goToContact.bind(this)
  }

  _goToContact () {
    const { navigation, contactEmail } = this.props
    navigation.navigate('ContactDetail', { id: contactEmail })
  }

  render () {
    const { contactEmail, contactDisplayName } = this.props
    return (
      <View style={s.container}>
        <StatusBar
          backgroundColor='black'
          barStyle='light-content'
        />
        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
          <Icon style={s.backIcon} name='angle-left' />
        </TouchableOpacity>
        <View style={s.titleContainer}>
          <CallDuration />
        </View>
        <WebRTCStats />
      </View>
    )
  }
}

const mapStateToProps = state => ({
  // remoteVideoPlaying: isRemoteVideoPlaying(state)
})

export default connect(mapStateToProps)(CallHeader)
