import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

export const ATTACHMENT_TOOLS_HEIGHT = 40

const s = EStyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ATTACHMENT_TOOLS_HEIGHT,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopColor: palette.clouds,
    borderTopWidth: 1
  },

  icon: {
    fontSize: '1.5rem',
    paddingLeft: '1rem',
    paddingTop: '0.15rem',
    paddingBottom: '0.15rem',
    paddingRight: '1rem',
    color: palette.iosBlue
  }
})

class AttachmentTools extends Component {
  static propTypes = {
    keyboardHeight: PropTypes.number.isRequired,
    onFilePress: PropTypes.func.isRequired,
    onImagePress: PropTypes.func.isRequired
  }

  render () {
    const { keyboardHeight } = this.props
    const bottom = Platform.OS === 'ios' ? keyboardHeight - ATTACHMENT_TOOLS_HEIGHT : 0
    return (
      <View style={[s.container, { bottom }]} >
        <TouchableOpacity onPress={this.props.onFilePress} >
          <Icon style={s.icon} name='paperclip' />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.props.onImagePress} >
          <Icon style={s.icon} name='image' />
        </TouchableOpacity>
      </View>
    )
  }
}

export default AttachmentTools
