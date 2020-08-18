import React from 'react'
import { View } from 'react-native'

import styles from '../styles'

export default ({ children }) => (
  <View style={styles.errorContainer}>
    <View style={styles.error}>
      {children}
    </View>
    <View style={styles.errorSpacer} />
  </View>
)
