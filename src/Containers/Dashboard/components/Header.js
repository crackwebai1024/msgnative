import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, Image } from 'react-native'
import EStylesheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const headerStyles = EStylesheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingTop: '1.8rem',
    paddingBottom: '0.9rem',
    backgroundColor: palette.white
  },

  logo: {
    height: 25,
    opacity: 0.8,
    resizeMode: 'contain'
  }
})

class Header extends Component {
  render () {
    return (
      <View style={headerStyles.container}>
        <Image source={require('app/Images/logo_black.png')} style={headerStyles.logo} />
      </View>
    )
  }
}

export default Header
