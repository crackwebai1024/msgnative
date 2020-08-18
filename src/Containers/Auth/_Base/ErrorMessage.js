import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { View } from 'react-native'

import Text from 'app/Components/BaseText'
import styles from './styles'

/**
 * Form level error message component.
 *
 * @param props
 * @constructor
 */
export const ErrorMessage = props => (
  <View style={styles.error}>
    <Icon name='exclamation-circle' style={styles.errorIcon} />
    <Text style={styles.errorText}>{props.text}</Text>
  </View>
)
