import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { DataPicker } from 'rnkit-actionsheet-picker'
import { find, propEq, path } from 'ramda'
import dismissKeyboard from 'dismissKeyboard'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import Text from 'app/Components/BaseText'
import { selectionStyles as styles, commonStyles } from './styles'

class ActionSheetPickerInput extends PureComponent {
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
      input: { value }, meta: { touched, error }, initialMessage, linkText
    } = this.props

    return (
      <View style={styles.container}>
        <Text style={[commonStyles.label, (touched && error) && commonStyles.labelError]} onPress={this._showPicker}>{touched && error ? error : initialMessage}</Text>
        <Text style={styles.item} onPress={this._showPicker}>{this._valueToTitle(value) || linkText}</Text>
      </View>
    )
  }
}

export default injectIntl(ActionSheetPickerInput)
