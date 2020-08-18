import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  button: {
    marginLeft: '1.2rem',
    marginRight: '1.2rem'
  },

  disabled: {
    opacity: 0.3
  },

  buttonBody: {
    flexDirection: 'column',
    alignItems: 'center'
  },

  buttonIconContainer: {
    backgroundColor: palette.peterRiver,
    height: '3rem',
    width: '3rem',
    borderRadius: '1rem',
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttonIcon: {
    color: 'white',
    fontSize: '1.2rem'
  },

  buttonText: {
    marginTop: '0.2rem',
    fontSize: '0.8rem',
    color: palette.link,
    textAlign: 'center'
  },

  primary: {
    backgroundColor: palette.peterRiver
  },

  primaryText: {
    color: palette.peterRiver
  },

  danger: {
    backgroundColor: palette.pomegranate
  },

  dangerText: {
    color: palette.pomegranate
  }
})

export default class Button extends PureComponent {
  static propTypes = {
    text: PropTypes.string.isRequired,
    iconComponent: PropTypes.func.isRequired,
    iconName: PropTypes.string.isRequired,
    onPress: PropTypes.func,
    type: PropTypes.string,
    style: PropTypes.object,
    disabled: PropTypes.bool
  }

  static defaultProps = {
    type: 'primary'
  }

  render () {
    const { text, iconName, onPress, type, style, disabled } = this.props

    return (
      <TouchableOpacity style={[styles.button, disabled ? styles.disabled : null, style || null]} onPress={onPress} disabled={disabled}>
        <View style={styles.buttonBody}>
          <View style={[styles.buttonIconContainer, styles[type]]}>
            <this.props.iconComponent name={iconName} style={styles.buttonIcon} />
          </View>
          <Text style={[styles.buttonText, styles[`${type}Text`]]}>{text}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}
