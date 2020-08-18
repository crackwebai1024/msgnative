import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'
import { path } from 'ramda'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const PROGRESS_BAR_WIDTH = 130

const s = EStyleSheet.create({
  container: {
    padding: 8
  },

  fileContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  fileIcon: {
    fontSize: '5rem',
    marginBottom: '0.5rem',
    color: palette.greenSea
  },

  lockIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },

  lockIcon: {
    color: '#eee',
    fontSize: '1.5rem'
  },

  fileText: {
    fontStyle: 'italic',
    fontSize: '0.7rem',
    color: '#fff',
    maxWidth: 150,
    textAlign: 'center'
  },

  progressContainer: {
    backgroundColor: '#aaa',
    height: 10,
    width: PROGRESS_BAR_WIDTH,
    borderRadius: 5,
    marginBottom: '0.5rem',
    overflow: 'hidden'
  },

  progress: {
    height: 10,
    width: 0,
    backgroundColor: '#fff'
  }
})

class MessageFileSend extends Component {
  constructor (props) {
    super(props)

    this._calculateProgressWidth = this._calculateProgressWidth.bind(this)
    this._renderProgress = this._renderProgress.bind(this)
    this._renderSuccessMessage = this._renderSuccessMessage.bind(this)
    this._renderStatus = this._renderStatus.bind(this)
  }

  _calculateProgressWidth () {
    const { progress } = this.props
    return PROGRESS_BAR_WIDTH * progress || 0
  }

  _renderProgress () {
    return (
      <View style={[s.progressContainer]} >
        <View style={[s.progress, { width: this._calculateProgressWidth() }]} />
      </View>
    )
  }

  _renderSuccessMessage () {
    return (
      <View style={{ width: PROGRESS_BAR_WIDTH }}>
        <Text style={s.fileText}>Sent!</Text>
      </View>
    )
  }

  _renderProcessing () {
    return (
      <View style={{ width: PROGRESS_BAR_WIDTH }}>
        <Text style={s.fileText}>processing...</Text>
      </View>
    )
  }

  _renderStatus () {
    const { progress } = this.props
    if (progress === null) {
      return this._renderProcessing()
    } else if (progress < 1) {
      return this._renderProgress()
    } else if (progress >= 1) {
      return this._renderSuccessMessage()
    }
    return null
  }

  render () {
    const { progress, data } = this.props
    const message = data.currentMessage.message
    return (
      <View style={[s.container, s.fileContainer]}>
        <View style={s.fileIconsContainer}>
          <Icon name='file' style={s.fileIcon} />
          <View style={s.lockIconContainer}>
            <Icon name='lock' style={s.lockIcon} />
          </View>
        </View>
        {this._renderStatus()}
        <Text style={s.fileText}>{message.data.fileName}</Text>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const props = {}
  const message = ownProps.data.currentMessage.message
  props.progress = path(['chat', 'data', message.room_id, 'e2ee', 'messages', message.message_id, 'progress'], state)
  return props
}

export default connect(mapStateToProps)(MessageFileSend)
