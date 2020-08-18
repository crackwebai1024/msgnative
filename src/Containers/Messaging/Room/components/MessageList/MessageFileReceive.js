import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'
import RNFS from 'react-native-fs'
import PropTypes from 'prop-types'

import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'
import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'
import { DOCS_DIRECTORY_PATH } from 'app/Lib/FS'

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
    color: '#999',
    maxWidth: 150,
    textAlign: 'center'
  },

  progressContainer: {
    backgroundColor: '#ddd',
    height: 10,
    width: 130,
    borderRadius: 5,
    marginBottom: '0.5rem',
    overflow: 'hidden'
  },

  progress: {
    height: 10,
    width: 0,
    backgroundColor: palette.belizeHole
  }
})

class MessageFileReceive extends PureComponent {
  static propTypes = {
    data: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      is_url: props.data.is_url || false,
      downloadInProgress: false,
      downloadProgress: 0
    }

    this._hanleFileDownload = this._hanleFileDownload.bind(this)
  }

  _hanleFileDownload () {
    const { displayNotification, intl } = this.props
    const message = this.props.data.currentMessage
    const fromUrl = message.url
    const toFile = `${DOCS_DIRECTORY_PATH}/${message.filename}`
    RNFS
      .downloadFile({
        fromUrl,
        toFile,
        begin: () => this.setState({ downloadInProgress: true }),
        progress: (data) => this.setState({ downloadProgress: data.bytesWritten / data.contentLength * 100 })
      })
      .promise
      .then((result) => {
        this.setState({ downloadInProgress: false })
        displayNotification(intl.formatMessage(m.native.Chat.fileDownloaded, { filename: message.filename }), 'info', 3000)
      })
      .catch((err) => {
        this.setState({ downloadInProgress: false })
        displayNotification(intl.formatMessage(m.native.Chat.fileDownloaded, { filename: message.filename }), 'danger', 3000)
        console.info('FILE DOWNLOAD ERROR', err)
      })
  }

  _renderProgress () {
    if (!this.state.downloadInProgress) {
      return null
    }
    return (
      <View style={[s.progressContainer]} >
        <View style={[s.progress, { width: this.state.downloadProgress }]} />
      </View>
    )
  }

  render () {
    const message = this.props.data.currentMessage
    return (
      <TouchableOpacity style={[s.container, s.fileContainer]} onPress={this._hanleFileDownload}>
        <View style={s.fileIconsContainer}>
          <Icon name='file' style={s.fileIcon} />
          <View style={s.lockIconContainer}>
            <Icon name='lock' style={s.lockIcon} />
          </View>
        </View>
        {this._renderProgress()}
        <Text style={s.fileText}>{message.filename}</Text>
      </TouchableOpacity>
    )
  }
}

const mapDisptatchToProps = {
  displayNotification: NotificationActions.displayNotification
}

export default connect(null, mapDisptatchToProps)(injectIntl(MessageFileReceive))
