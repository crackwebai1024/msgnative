import React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { View } from 'react-native'
import Text from 'app/Components/BaseText'
import styles from '../styles'

const AdvantagePoint = ({ children, showIcon = true }) => (
  <View style={styles.advantagesPoint}>
    { showIcon && <FontAwesome name='check' style={styles.advantagesPointIcon} /> }
    <Text style={styles.advantagesPointText}>{children}</Text>
  </View>
)

export default AdvantagePoint
