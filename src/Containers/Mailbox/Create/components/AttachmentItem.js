import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'
import mime from 'react-native-mime-types'

import { base64ToFilesize, bytesToReadableStr } from 'commons/Lib/Utils'
import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'
import FileIcon from 'app/Components/FileIcon'

const s = EStyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: palette.clouds,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '0.35rem'
  },

  rightContainer: {
    position: 'absolute',
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  leftContainer: {
    flex: 1,
    paddingRight: '7rem',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },

  titleIcon: {
    fontSize: '1.25rem',
    marginRight: '0.5rem'
  },

  title: {
    fontSize: '0.8rem'
  },

  size: {
    fontSize: '0.8rem',
    color: palette.asbestos,
    marginTop: '0.25rem'
  },

  iconWrapper: {
    paddingLeft: '0.5rem',
    paddingVertical: '0.5rem',
    paddingRight: '0.25rem'
  },

  icon: {
    fontSize: '1.25rem',
    color: palette.pomegranate
  }

})

class AttachmentItem extends Component {
  static propTypes = {
    // id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.string,
    // type: PropTypes.string.isRequired,
    // progress: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
    first: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._getFileSize = this._getFileSize.bind(this)
  }

  _getFileSize () {
    const { data } = this.props
    return bytesToReadableStr(base64ToFilesize(data))
  }

  render () {
    const { name } = this.props
    return (
      <View style={[s.container, { borderTopWidth: this.props.first ? 0 : 1 }]}>
        <View style={s.leftContainer}>
          <FileIcon style={s.titleIcon} mimeType={mime.lookup(name)} />
          <Text style={s.title}>{name}</Text>
        </View>
        <View style={s.rightContainer}>
          <Text style={s.size}>{this._getFileSize()}</Text>
          <TouchableOpacity style={s.iconWrapper} onPress={this.props.onRemove} >
            <Icon style={s.icon} name='trash' />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export default AttachmentItem
