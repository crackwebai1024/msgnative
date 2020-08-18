import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, WebView } from 'react-native'

// import Text from 'app/Components/BaseText'
import s from '../style'

class PdfRenderer extends Component {
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
      <View style={s.bodyContainer} >
        <WebView
          useWebKit
          source={{ uri: `data:${mimeType};${encoding},${data}` }}
        />
      </View>
    )
  }
}

export default PdfRenderer
