import React from 'react'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import Text from 'app/Components/BaseText'

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    paddingVertical: '0.1rem'
  },

  text: {
    marginLeft: '1rem',
    // fontSize: '1rem',
    fontWeight: '600'
  }
})

const SectionHeader = ({ title, ...props }) => (
  <View style={styles.container} {...props}>
    <Text style={styles.text}>{title}</Text>
  </View>
)

export default SectionHeader
