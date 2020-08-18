import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native'
import EStylesheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStylesheet.create({
  container: {
    padding: '0.5rem'
  },

  text: {
    fontSize: '0.9rem',
    color: palette.iosBlue
  },

  danger: {
    color: palette.pomegranate
  }
})

class EncryptionKeyButton extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    danger: PropTypes.bool
  }

  render () {
    const { danger, ...rest } = this.props
    const textStyle = [s.text]
    if (danger) {
      textStyle.push(s.danger)
    }
    return (
      <TouchableOpacity style={s.container} {...rest}>
        <Text style={textStyle}>
          {this.props.text}
        </Text>
      </TouchableOpacity>
    )
  }
}

export default EncryptionKeyButton
