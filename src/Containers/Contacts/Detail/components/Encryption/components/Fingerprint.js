import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStyleSheet.create({
  container: {
    marginBottom: '0.5rem'
  },

  text: {
    fontSize: '0.7rem',
    color: palette.wetAsphalt,
    textAlign: 'center'
  }
})

class EncryptionKeyFingerprint extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  }

  render () {
    return (
      <TouchableOpacity style={s.container}>
        <Text style={s.text}>{this.props.text}</Text>
      </TouchableOpacity>
    )
  }
}

export default EncryptionKeyFingerprint
