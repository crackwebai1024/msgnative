import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStylesheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStylesheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '0.5rem'
  },

  text: {
    fontSize: '0.8rem',
    color: palette.asbestos
  },

  icon: {
    color: palette.asbestos,
    marginRight: '0.25rem'
  }
})

class EncryptionKeyTitle extends Component {
  static propTypes = {
    isLocked: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  }

  static defaultProps = {
    isLocked: false,
    text: ''
  }

  render () {
    const { isLocked, text } = this.props
    return (
      <View style={s.container}>
        <Icon style={s.icon} name={isLocked ? 'lock' : 'unlock'} />
        <Text style={s.text}>{text}</Text>
      </View>
    )
  }
}

export default EncryptionKeyTitle
