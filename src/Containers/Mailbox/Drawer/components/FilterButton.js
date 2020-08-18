import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'
import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({

  button: {
    marginTop: '1.3rem',
    marginLeft: '0.35rem',
    flexDirection: 'row',
    alignItems: 'center'
  },

  buttonSmall: {
    marginTop: '0.5rem',
    marginBottom: 0
  },

  buttonText: {
    color: palette.touchofgray,
    fontSize: '1rem',
    fontWeight: '600',
    letterSpacing: '0.05rem',
    opacity: 0.7
  },

  buttonTextSmall: {
    fontSize: '0.8rem'
  },

  buttonTextActive: {
    color: palette.touchofgray,
    opacity: 1
  },

  buttonDescription: {
    color: palette.clouds
  },

  buttonIcon: {
    marginRight: '1.28rem',
    fontSize: '1.7rem'
  }

})

export default class SideMenuButton extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    small: PropTypes.bool,
    text: PropTypes.string,
    description: PropTypes.string,
    active: PropTypes.bool,
    entypoIconName: PropTypes.string,
    materialIconName: PropTypes.string,
    featherIconName: PropTypes.string,
    fontawesomeIconName: PropTypes.string
  }

  constructor (props) {
    super(props)

    this._handlePress = this._handlePress.bind(this)
  }

  _handlePress () {
    const { onPress } = this.props

    if (typeof onPress === 'function') {
      onPress()
    }
  }

  render () {
    const {
      small, text, description, active, entypoIconName, materialIconName, featherIconName, fontawesomeIconName
    } = this.props

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.button, small && styles.buttonSmall]}
        onPress={this._handlePress}
      >
        {entypoIconName && <EntypoIcon
          name={entypoIconName}
          style={[
            styles.buttonText,
            styles.buttonIcon,
            small && styles.buttonTextSmall,
            active && styles.buttonTextActive
          ]}
        />}
        {materialIconName && <MaterialIcon
          name={materialIconName}
          style={[
            styles.buttonText,
            styles.buttonIcon,
            small && styles.buttonTextSmall,
            active && styles.buttonTextActive
          ]}
        />}
        {featherIconName && <Feather
          name={featherIconName}
          style={[
            styles.buttonText,
            styles.buttonIcon,
            small && styles.buttonTextSmall,
            active && styles.buttonTextActive
          ]}
        />}
        {fontawesomeIconName && <FontAwesome
          name={fontawesomeIconName}
          style={[
            styles.buttonText,
            styles.buttonIcon,
            small && styles.buttonTextSmall,
            active && styles.buttonTextActive
          ]}
        />}
        <View>
          <Text
            style={[
              styles.buttonText,
              small && styles.buttonTextSmall,
              active && styles.buttonTextActive
            ]}
          >
            {text}
          </Text>
          { description && text !== description ? <Text style={styles.buttonDescription}>{description}</Text> : null }
        </View>
      </TouchableOpacity>
    )
  }
}
