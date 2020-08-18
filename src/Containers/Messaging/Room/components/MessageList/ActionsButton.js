import React, { PureComponent } from 'react'
import { View, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Entypo'
import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const s = EStyleSheet.create({
  container: {
    width: 34,
    height: 44,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  icon: {
    fontSize: '1.5rem',
    color: palette.link,
    borderColor: '#000'
  }
})

class ActionsButton extends PureComponent {
  render () {
    const { uploadingFiles } = this.props.data
    if (uploadingFiles && uploadingFiles.length) {
      return (
        <View style={s.container}>
          <ActivityIndicator
            color='#000'
          />
        </View>
      )
    }
    return (
      <TouchableOpacity style={s.container} {...this.props}>
        <Icon name='plus' style={s.icon} />
      </TouchableOpacity>
    )
  }
}

export default ActionsButton
