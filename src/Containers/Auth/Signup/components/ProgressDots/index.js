import React from 'react'
import { View } from 'react-native'
import { range } from 'ramda'

import localStyles from './styles'

const ProgressDots = ({ style, activeIndex, totalCount = 4 }) => (
  <View style={[localStyles.dotsContainer, style]}>
    {range(0, totalCount).map(i => (
      <View key={i} style={[localStyles.dot, activeIndex === i ? localStyles.dotActive : {}]} />))}
  </View>
)

export default ProgressDots
