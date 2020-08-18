import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, Image } from 'react-native'

import Text from 'app/Components/BaseText'
import s from '../style'

class ImageRenderer extends Component {
  static propTypes = {
    data: PropTypes.shape({
      mimeType: PropTypes.string.isRequired,
      encoding: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired
    }).isRequired
  }

  render () {
    const {
      mimeType,
      encoding,
      data
    } = this.props.data
    return (
      <View style={s.bodyContainer}>
        <Image
          source={{ uri: `data:${mimeType};${encoding},${data}` }}
          style={{
            resizeMode: 'contain',
            width: '100%',
            height: '100%'
          }}
        />
      </View>
    )
  }
}

export default ImageRenderer
