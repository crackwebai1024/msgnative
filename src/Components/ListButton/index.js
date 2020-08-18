import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'

import Text from 'app/Components/BaseText'
import styles from './styles'

const ListButton = ({
  textLeft, textRight, style, ...props
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[styles.main, style]}
    {...props}
  >
    {textLeft ? <Text style={styles.text}>{textLeft}</Text> : null}
    {textRight ? <Text style={styles.text}>{textRight}</Text> : null}
  </TouchableOpacity>
)

ListButton.propType = {
  onPress: PropTypes.func,
  textLeft: PropTypes.string.isRequired,
  textRight: PropTypes.string,
  iconComponent: PropTypes.element,
  iconName: PropTypes.string
}

export default ListButton
