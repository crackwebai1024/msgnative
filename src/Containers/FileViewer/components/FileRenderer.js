import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import mime from 'react-native-mime-types'

import { base64ToFilesize, bytesToReadableStr } from 'commons/Lib/Utils'
import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'
import FileIcon from 'app/Components/FileIcon'
import style from '../style'

const s = EStyleSheet.create({
  fileIcon: {
    fontSize: '8rem',
    textAlign: 'center'
  },

  title: {
    fontSize: '0.9rem',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '0.75rem',
    color: palette.asbestos
  },

  size: {
    fontSize: '0.7rem',
    color: palette.asbestos,
    textAlign: 'center'
  }
})

class FileRenderer extends Component {
  static propTypes = {
    data: PropTypes.shape({
      mimeType: PropTypes.string.isRequired,
      encoding: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired
    }).isRequired
  }

  constructor (props) {
    super(props)
    this._getFileSize = this._getFileSize.bind(this)
  }

  _getFileSize () {
    const { data } = this.props.data
    return bytesToReadableStr(base64ToFilesize(data))
  }

  render () {
    const { fileName, mimeType } = this.props.data
    return (
      <View style={[style.bodyContainer, { backgroundColor: '#fff' }]}>
        <TouchableOpacity onPress={this.props.onShare} >
          <FileIcon style={s.fileIcon} mimeType={mime.lookup(fileName)} />
          <Text style={s.title} >{fileName}</Text>
          <Text style={s.size}>{this._getFileSize()}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default FileRenderer
