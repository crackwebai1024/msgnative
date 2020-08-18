import React from 'react'
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native'

import { withWSState } from 'commons/Lib/NetworkStateProvider'

import Text from 'app/Components/BaseText'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },

  title: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: 'rgba(0, 0, 0, .9)',
    marginHorizontal: 8
  }
})

export default withWSState(({ title, wsOnline }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    { !wsOnline && <ActivityIndicator /> }
  </View>
))
