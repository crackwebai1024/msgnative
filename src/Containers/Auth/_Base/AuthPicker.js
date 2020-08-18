import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { DataPicker } from 'rnkit-actionsheet-picker'
import dismissKeyboard from 'dismissKeyboard'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import styles from './styles'
import { path, find, propEq } from 'ramda'
import Text from 'app/Components/BaseText'

class AuthPickerComponent extends PureComponent {
  constructor (props) {
    super(props)

    this._showPicker = this._showPicker.bind(this)
  }

  _valueToTitle (value) {
    const { options } = this.props

    return path(['title'], find(propEq('value', value))(options))
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.focus && nextProps.focus) {
      this._showPicker()
    }
  }

  _showPicker () {
    const {
      input: { onChange, onBlur, value }, title: titleText, options, onSubmitEditing, intl
    } = this.props
    const dataSource = options.map(option => option.title)
    const defaultSelected = value ? [this._valueToTitle(value)] : [dataSource[0]]

    dismissKeyboard()

    DataPicker.show({
      dataSource,
      titleText,
      defaultSelected,
      doneText: intl.formatMessage(m.app.Common.done),
      cancelText: intl.formatMessage(m.app.Common.cancel),
      numberOfComponents: 1,
      onPickerConfirm: (selectedData, selectedIndex) => {
        onChange(options[selectedIndex].value)
        onBlur()

        typeof onSubmitEditing === 'function' && onSubmitEditing()
      }
    })
  }

  render () {
    const {
      iconComponent, iconName, iconSize, input: { value }, linkText
    } = this.props
    const Icon = iconComponent
    const isFocus = this.props.focus

    return (
      <View>
        <View style={[styles.iconInputContainer, isFocus && styles.iconInputContainerFocused]}>
          <Icon name={iconName} style={[styles.iconStyle, isFocus && styles.iconStyleFocused]} size={iconSize} />
          <Text style={[styles.textInput, styles.textInputLight]} onPress={this._showPicker}>{this._valueToTitle(value) || linkText}</Text>
        </View>
      </View>
    )
  }
}

export const AuthPicker = injectIntl(AuthPickerComponent)
