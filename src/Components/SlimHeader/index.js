import PropTypes from 'prop-types'
import React from 'react'
import { View, TouchableOpacity } from 'react-native'

import Text from 'app/Components/BaseText'

import styles from './styles'

const SlimHeader = ({ title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.main} onPress={onPress} activeOpacity={0.9}>
    <View>
      <Text style={styles.title}>{title}</Text>
      { subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null }
    </View>
  </TouchableOpacity>
)

SlimHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
}

export default SlimHeader
