import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View } from 'react-native'

import layoutStyles from 'app/Styles/layout'

class BaseUserView extends PureComponent {
  static propTypes = {
    navBarVisible: PropTypes.bool,
    tabBarVisible: PropTypes.bool
  }

  static defaultProps = {
    navBarVisible: true,
    tabBarVisible: true
  }

  render () {
    const { tabBarVisible, navBarVisible, styles } = this.props

    const viewStyles = [
      layoutStyles.flex,
      navBarVisible && layoutStyles.withNavBar,
      tabBarVisible && layoutStyles.withTabBar,
      styles
    ]

    return (
      <View style={viewStyles}>{this.props.children}</View>
    )
  }
}

export default BaseUserView
