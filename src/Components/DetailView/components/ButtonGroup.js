import React from 'react'
import { View } from 'react-native'

import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  buttonGroup: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignSelf: 'center',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    borderTopWidth: 1,
    borderTopColor: palette.clouds,
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds,
    width: '100%',
    justifyContent: 'center'
  }
})

const ButtonGroup = ({ children }) => (
  <View style={styles.buttonGroup}>
    {children}
  </View>
)

export default ButtonGroup
