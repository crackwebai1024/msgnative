import React from 'react'
import { View, Image } from 'react-native'

import baseStyles from './styles'

const LogoHero = ({ style, small, align = 'center' }) => (
  <View style={{ alignItems: align }}>
    <Image
      source={require('app/Images/logo.png')}
      style={[
        baseStyles.logo,
        small ? baseStyles.logoSmall : {},
        style
      ]}
    />
  </View>
)

export default LogoHero
