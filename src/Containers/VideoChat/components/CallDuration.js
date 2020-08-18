import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import Timer from 'app/Components/Timer'

const s = EStyleSheet.create({
  container: {
    zIndex: 95
  },

  duration: {
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: '1.25rem',
    marginTop: '0.5rem'
  }
})

class CallDuration extends Component {
  static propTypes = {
    startTime: PropTypes.instanceOf(Date)
  }

  render () {
    const { startTime } = this.props
    if (!startTime) {
      return null
    }

    return (
      <View style={s.container}>
        <Timer style={s.duration} startDate={startTime} />
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  startTime: state.webrtc.startTime
})

export default connect(mapStateToProps)(CallDuration)
