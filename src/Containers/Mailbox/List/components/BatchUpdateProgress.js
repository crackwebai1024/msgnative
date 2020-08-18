import React, { Component } from 'react'
import { View, ActivityIndicator } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const s = EStyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

class BatchUpdateProgress extends Component {
  render () {
    return (
      <View style={s.container}>
        <ActivityIndicator color='#000' />
      </View>
    )
  }
}

export default BatchUpdateProgress
