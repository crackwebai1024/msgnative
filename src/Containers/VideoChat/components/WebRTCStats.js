import React, { PureComponent } from 'react'
import { View, TouchableOpacity, ScrollView, Modal } from 'react-native'
import PropTypes from 'prop-types'
import EStylesheet from 'react-native-extended-stylesheet'
import IonIcons from 'react-native-vector-icons/Ionicons'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { connect } from 'react-redux'

import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const s = EStylesheet.create({
  iconContainer: {
    position: 'absolute',
    right: '1.2rem',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  icon: {
    color: palette.clouds
  },

  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    flex: 1
  },

  stats: {
    width: '80%',
    padding: 15,
    alignSelf: 'center',
    backgroundColor: 'white',
    height: 300
  },

  closeIcon: {
    position: 'absolute',
    top: 7,
    right: 7,
    zIndex: 11000
  },

  header: {
    fontWeight: '600',
    fontSize: 15,
    marginTop: 15,
    marginBottom: 4
  },

  subtitle: {
    marginTop: 1,
    marginBottom: 7,
    color: palette.asbestos,
    fontStyle: 'italic'
  },

  text: {
    marginTop: 3,
    marginBottom: 3
  }
})

const isDebug = process.env.NODE_ENV !== 'production'

class WebRTCStats extends PureComponent {
  constructor (props) {
    super(props)

    this._toggleStatsVisibility = this._toggleStatsVisibility.bind(this)

    this.state = {
      statsVisible: false
    }
  }

  static propTypes = {
    webrtcStats: PropTypes.object
  }

  _toggleStatsVisibility () {
    this.setState({
      statsVisible: !this.state.statsVisible
    })
  }

  _renderActiveCandidatePair () {
    const { webrtcStats } = this.props
    const activeCandiates = webrtcStats.candidatePairs.filter(x => x.isActive)
    if (activeCandiates.length !== 1) {
      return (
        <Text>Active candiates found - {activeCandiates.length}</Text>
      )
    }

    const a = activeCandiates[0]
    const localC = webrtcStats.candidates[a.localCandidateId]
    const remoteC = webrtcStats.candidates[a.remoteCandidateId]

    return (
      <View>
        <Text style={s.header}>Session Candidates</Text>
        <Text style={s.text}>Local: {localC.ip}:{localC.port} ({localC.type} - {localC.transport})</Text>
        <Text style={s.text}>Remote: {remoteC.ip}:{remoteC.port} ({remoteC.type} - {remoteC.transport})</Text>
      </View>
    )
  }

  _renderCandidates (source) {
    const { webrtcStats } = this.props
    const candidates = []

    for (let id in webrtcStats.candidates) {
      const c = webrtcStats.candidates[id]
      if (c.source !== source) continue
      candidates.push((<Text style={s.text} key={id}>- {c.ip}:{c.port} ({c.type} - {c.transport})</Text>))
    }

    return candidates
  }

  render () {
    const { statsVisible } = this.state
    const { webrtcStats } = this.props

    if (!webrtcStats) {
      return null
    }

    if (!statsVisible) {
      return (
        <View style={statsVisible ? s.statsContainer : s.iconContainer}>
          <TouchableOpacity onPress={this._toggleStatsVisibility}>
            <IonIcons style={s.icon} name='md-information-circle' size={25} />
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <Modal visible transparent>
        <View style={s.statsContainer}>
          <View style={s.stats}>
            <TouchableOpacity style={s.closeIcon} onPress={this._toggleStatsVisibility}>
              <EntypoIcon name='cross' size={30} />
            </TouchableOpacity>
            <ScrollView>
              {isDebug && (
                <View>
                  {/* <Text>Is caller: {webrtcStats.isInitiator ? 'yes' : 'no'}</Text> */}
                  <Text style={s.header}>Session Codecs</Text>
                  {webrtcStats.codec.video && <Text style={s.text}>Video: {webrtcStats.codec.video}</Text>}
                  <Text style={s.text}>Audio: {webrtcStats.codec.audio}</Text>
                </View>
              )}

              <Text style={s.header}>Encryption used for this call</Text>
              <Text style={s.subtitle}>Session Ciphers</Text>
              <Text style={s.text}>DTLS: {webrtcStats.ciphers.dtls}</Text>
              <Text style={s.text}>SRTP: {webrtcStats.ciphers.srtp}</Text>

              {isDebug && (
                <View>
                  {this._renderActiveCandidatePair()}

                  <Text style={s.header}>All Local Candidates</Text>
                  {this._renderCandidates('local')}

                  <Text style={s.header}>All Remote Candidates</Text>
                  {this._renderCandidates('remote')}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    )
  }
}

const mapStateToProps = s => ({
  webrtcStats: s.webrtc.local.webrtcStats
})

export default connect(mapStateToProps)(WebRTCStats)
