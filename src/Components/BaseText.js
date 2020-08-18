import React from 'react'
import { Text, Platform } from 'react-native'
import PropTypes from 'prop-types'

const BaseText = ({ children, ...props }) => {
  return Platform.OS === 'android' ? <Text {...props} style={[props.style ? props.style : {}, { fontFamily: 'sans-serif' }]}>{children}</Text>
    : <Text {...props}>{children}</Text>
}
BaseText.propTypes = {
  children: PropTypes.any,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.number
  ])
}

export default BaseText
