import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'

import baseStyles from './styles'

const NavButtonsWithSearch = ({ onSearchPress, children, disabled }) => (
  <View style={baseStyles.navBarButtons}>
    <TouchableOpacity onPress={onSearchPress} disabled={disabled}>
      <EntypoIcon name='magnifying-glass' style={[baseStyles.navBarMenuIcon, baseStyles.navBarRightIcon]} />
    </TouchableOpacity>
    {children}
  </View>
)

export default NavButtonsWithSearch
