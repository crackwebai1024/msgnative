import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'

import { MESSAGE_STATUS } from 'commons/Redux/ChatRedux'

import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'
import MessageFile from './MessageFile'

const s = EStyleSheet.create({
  container: {
    display: 'flex',
    padding: 8
  },

  textRight: {
    color: '#fff'
  },

  status: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: 20,
    height: 20,
    top: 2,
    left: -23,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: palette.silver,
    borderRadius: 15
  },

  statusIcon: {
    color: palette.silver,
    fontSize: 13
  }
})

class MessageText extends Component {
  static propTypes = {
    data: PropTypes.object
  }

  constructor (props) {
    super(props)
    this._renderText = this._renderText.bind(this)
    this._renderStatus = this._renderStatus.bind(this)
  }

  _renderStatus () {
    const { currentMessage, user } = this.props.data
    if (
      currentMessage.user._id !== user._id ||
      currentMessage.message.status !== MESSAGE_STATUS.ERROR
    ) {
      return null
    }
    return (
      <View style={s.status}>
        <Icon style={s.statusIcon} name='info' />
      </View>
    )
  }

  _renderText () {
    const { data } = this.props
    const textStyle = []
    if (data.currentMessage.user._id === data.user._id) {
      textStyle.push(s.textRight)
    }
    return (
      <View style={s.container}>
        {this._renderStatus()}
        <Text style={textStyle}>{data.currentMessage.text}</Text>
      </View>
    )
  }

  render () {
    const message = this.props.data.currentMessage
    if (message.is_url || (message.message.is_file)) {
      return <MessageFile {...this.props} />
    }
    return this._renderText()
  }
}

export default MessageText
