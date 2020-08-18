import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, Switch } from 'react-native'

import Text from 'app/Components/BaseText'

import { switchStyles as styles } from './styles'

/**
 * redux-form's Field compatible Switch component.
 * Also supports showing a label.
 */

class SwitchInput extends PureComponent {
  static propTypes = {
    // An array with [<false value>, <true value>]
    values: PropTypes.array.isRequired,
    label: PropTypes.string,
    smallLabel: PropTypes.string,
    disabled: PropTypes.bool
  }

  _isOn () {
    const { input: { value }, values } = this.props
    return value === values[1]
  }

  _onValueChange (value) {
    const { input: { onChange, onBlur }, values } = this.props

    onChange(value ? values[1] : values[0])
    onBlur()
  }

  render () {
    const {
      label,
      smallLabel,
      onHelpText,
      offHelpText,
      disabled
    } = this.props

    const isOn = this._isOn()

    const helpText = isOn ? onHelpText : offHelpText

    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, smallLabel && styles.smallText]}>{ smallLabel || label }</Text>
          { helpText && <Text style={styles.helpText}>{helpText}</Text> }
        </View>
        <Switch
          value={isOn}
          onValueChange={this._onValueChange.bind(this)}
          style={[helpText && styles.spaceySwitch]}
          disabled={disabled}
        />
      </View>
    )
  }
}

export default SwitchInput
