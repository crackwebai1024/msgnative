import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    bottom: '4rem',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },

  notification: {
    padding: '0.5rem',
    paddingLeft: '0.8rem',
    paddingRight: '0.8rem',
    backgroundColor: palette.belizeHole,
    borderRadius: '0.25rem',
    // shadowColor: 'white',
    // shadowOpacity: 0.9,
    // shadowRadius: 4,
    opacity: 0.95,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  notificationText: {
    color: palette.white,
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.01rem'
  },

  notificationLink: {
    color: palette.white,
    fontWeight: '900',
    fontSize: '0.75rem',
    marginLeft: '0.5rem'
  },

  danger: {
    backgroundColor: palette.pomegranate
  }
})

export default class Notification extends PureComponent {
  render () {
    const { message, type } = this.props

    if (!message) return null

    return (
      <View style={styles.notificationContainer}>
        <View style={[styles.notification, type && styles[type]]}>
          <Text style={styles.notificationText}>{message}</Text>
          {/* <Text style={styles.notificationLink}>UNDO</Text> */}
        </View>
      </View>
    )
  }
}
