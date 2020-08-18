import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableOpacity, TextInput } from 'react-native'
// import { propTypes } from 'redux-form'
import debounce from 'lodash.debounce'

import Text from 'app/Components/BaseText'

import { inputStyles as styles, commonStyles } from './styles'

/**
 * RF Field complianced TextInput with light and good performance by comparing FormTextInput
 * No special props required, apart from those for TextInput.
 */
export default class LiteTextInput extends PureComponent {
  static propTypes = {
    multiline: PropTypes.bool,
    multilineLarge: PropTypes.bool,
    editable: PropTypes.bool,
    focus: PropTypes.bool,
    noBottomBorder: PropTypes.bool,
    successMessage: PropTypes.string,
    label: PropTypes.string,
    setRef: PropTypes.func,
    labelButtonText: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]),
    debounceWait: PropTypes.number,
    labelButtonCb: PropTypes.func,
    focusChanged: PropTypes.func
    // ...propTypes
  }

  static defaultProps = {
    multiline: false,
    multilineLarge: false,
    editable: true,
    noBottomBorder: false,
    debounceWait: 150
  }

  constructor (props) {
    super(props)

    this._setTextInputRef = elm => {
      this.textInputRef = elm
      props.setRef && props.setRef(elm)
    }

    this._onChange = debounce(this._onChange.bind(this), props.debounceWait)
    this._onFocus = this._onFocus.bind(this)
    this._onBlur = this._onBlur.bind(this)
    this._containerStyle = [styles.container, props.noBottomBorder && commonStyles.noBottom, props.containerStyle]
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.focus !== nextProps.focus && nextProps.focus) {
      this.textInputRef.focus()
    }

    // if (this.props.input.value !== nextProps.input.value) {
    //   this._setValue(nextProps.input.value)
    // }
  }

  componentDidMount () {
    const { input: { value } } = this.props

    this._setValue(value)
  }

  _setValue (text) {
    this.textInputRef.setNativeProps({ text })
  }

  _renderLabelText () {
    const { meta: { error, touched }, successMessage, label } = this.props

    if (error && touched) {
      return <Text style={[commonStyles.label, commonStyles.labelError]}>{error}</Text>
    }

    if (successMessage) {
      return <Text style={[commonStyles.label, commonStyles.labelSuccess]}>{successMessage}</Text>
    }

    if (label) {
      return <Text style={commonStyles.label}>{label}</Text>
    }
  }

  _renderLabel () {
    const { labelButtonText, labelButtonCb } = this.props
    const labelText = this._renderLabelText()

    if (!labelButtonText || !labelButtonCb) return labelText

    return (
      <View style={commonStyles.labelContainer}>
        {labelText}
        <TouchableOpacity style={commonStyles.labelButton} onPress={labelButtonCb}>
          <Text style={commonStyles.labelButtonText}>{labelButtonText}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _onFocus () {
    this.props.focusChanged && this.props.focusChanged({ isFocused: true })
  }

  _onBlur () {
    this.props.focusChanged && this.props.focusChanged({ isFocused: false })
  }

  _onChange (value) {
    this.props.input.onChange(value)
  }

  render () {
    const {
      multiline,
      multilineLarge,
      editable,
      setRef,
      ...props
    } = this.props

    return (
      <View style={this._containerStyle}>
        {this._renderLabel()}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              multiline && styles.inputMultiLine,
              multilineLarge && styles.inputMultiLineLarge,
              !editable && styles.inputDisabled
            ]}
            underlineColorAndroid='transparent'
            onChangeText={this._onChange}
            multiline={multiline}
            editable={editable}
            ref={this._setTextInputRef}
            onFocus={this._onFocus}
            onBlur={this._onBlur}
            {...props}
          />
        </View>
      </View>
    )
  }
}
