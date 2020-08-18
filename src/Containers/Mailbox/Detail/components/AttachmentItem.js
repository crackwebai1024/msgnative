import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import { NavigationActions } from 'react-navigation'
import EStyleSheet from 'react-native-extended-stylesheet'
import mime from 'react-native-mime-types'

import { base64ToFilesize, bytesToReadableStr } from 'commons/Lib/Utils'
import Text from 'app/Components/BaseText'
import FileIcon from 'app/Components/FileIcon'
import palette from 'app/Styles/colors'

const s = EStyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '0.5rem'
  },

  titleContainer: {
    paddingRight: '6rem',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },

  icon: {
    fontSize: '1.25rem'
  },

  title: {
    marginLeft: '0.5rem',
    color: palette.iosBlue
  },

  size: {
    position: 'absolute',
    right: 0,
    fontSize: '0.75rem',
    color: palette.asbestos
  }
})

class MailboxAttachementItem extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    navigate: PropTypes.func
  }

  constructor (props) {
    super(props)
    this._handlePress = this._handlePress.bind(this)
    this._getFileSize = this._getFileSize.bind(this)
  }

  _handlePress () {
    const {
      contentType: mimeType,
      encoding,
      data,
      name: fileName
    } = this.props.data

    this.props.navigate({
      routeName: 'FileViewer',

      params: {
        mimeType,
        encoding,
        data,
        fileName
      }
    })
  }

  _getFileSize () {
    const { data } = this.props.data
    return bytesToReadableStr(base64ToFilesize(data))
  }

  render () {
    const {
      name: fileName
    } = this.props.data
    return (
      <TouchableOpacity style={s.container} onPress={this._handlePress}>
        <View style={s.titleContainer}>
          <FileIcon mimeType={mime.lookup(fileName)} style={s.icon} />
          <Text style={s.title} >{fileName}</Text>
        </View>
        <Text style={s.size}>{this._getFileSize()}</Text>
      </TouchableOpacity>
    )
  }
}

const mapDispatchToProps = {
  navigate: NavigationActions.navigate
}

export default connect(null, mapDispatchToProps)(MailboxAttachementItem)
