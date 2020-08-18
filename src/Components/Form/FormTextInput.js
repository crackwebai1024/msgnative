import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { ActivityIndicator, View, TouchableOpacity } from 'react-native'

import Text from 'app/Components/BaseText'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'

import { inputStyles as styles, commonStyles } from './styles'

/**
 * Wrapper around the ReduxFormTextInput that renders the field itself,
 * as well as the error message.
 *
 * No special props required, apart from those for TextInput.
 */
class FormTextInput extends PureComponent {
  static propTypes = {
    multiline: PropTypes.bool,
    multilineLarge: PropTypes.bool,
    editable: PropTypes.bool,
    noBottomBorder: PropTypes.bool,
    successMessage: PropTypes.string,
    label: PropTypes.string,
    labelButtonText: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]),
    labelButtonCb: PropTypes.func
  }

  static defaultProps = {
    multiline: false,
    multilineLarge: false,
    editable: true,
    noBottomBorder: false
  }

  _renderLabelText () {
    const { meta: { error, touched, asyncValidating }, successMessage, label } = this.props

    if (error && touched && !asyncValidating) {
      return <Text style={[commonStyles.label, commonStyles.labelError]}>{error}</Text>
    }

    if (successMessage) {
      return <Text style={[commonStyles.label, commonStyles.labelSuccess]}>{successMessage}</Text>
    }

    if (label || asyncValidating) {
      return <Text style={commonStyles.label}>{label}</Text>
    }
  }

  _renderLabel () {
    const labelText = this._renderLabelText()

    const { labelButtonText, labelButtonCb } = this.props

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

  render () {
    const { containerStyle, multiline, multilineLarge, editable, noBottomBorder, meta: { asyncValidating } } = this.props

    return (
      <View style={[styles.container, noBottomBorder && { borderBottomWidth: 0 }, containerStyle]}>
        {this._renderLabel()}
        <View style={styles.inputWrapper}>
          <ReduxFormTextInput
            style={[
              styles.input,
              multiline && styles.inputMultiLine,
              multilineLarge && styles.inputMultiLineLarge,
              editable === false && styles.inputDisabled
            ]}
            {...this.props}
          />
          <ActivityIndicator animating={asyncValidating} color='#b4b4b4' />
        </View>
      </View>
    )
  }
}

export default FormTextInput
