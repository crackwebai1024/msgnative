import React from 'react'
import { View } from 'react-native'

const s = {
  marginTop: 15
}

const ListButtonGroup = ({ children, style, ...props }) =>
  (<View style={[s, style]} {...props}>
    {children}
  </View>)

export default ListButtonGroup
