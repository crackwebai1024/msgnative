import React, { PureComponent } from 'react'
import { View, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import Text from 'app/Components/BaseText'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import styles from './styles'

/**
 * Wrapper around ReduxFormTextInput; handles showing the error.
 */

export class AuthTextInputWithIcon extends PureComponent {
  static defaultProps = {
    iconSize: 13
  }

  measure (...args) {
    return this.refs.main.measure(...args)
  }

  _renderError (errorText) {
    if (!errorText) return

    return (
      <View style={styles.fieldErrorContainer}>
        <Icon name='ios-warning' style={styles.fieldErrorIcon} size={20} />
        <Text style={styles.fieldError}>{errorText}</Text>
      </View>
    )
  }

  render () {
    const { iconComponent, iconName, iconSize, meta: { touched, asyncValidating }, loading } = this.props

    const error = this.props.meta.error || this.props.error
    const isFocus = this.props.focus
    const Icon = iconComponent

    return (
      <View>
        <View style={[styles.iconInputContainer, isFocus && styles.iconInputContainerFocused]}>
          <Icon name={iconName} style={[styles.iconStyle, isFocus && styles.iconStyleFocused]} size={iconSize} />
          <ReduxFormTextInput {...this.props} ref='main'
            onBlur={() => {
              const { input: { value, onBlur } } = this.props
              onBlur(value)
            }} />
          <ActivityIndicator animating={loading || asyncValidating} color='#fff' />
        </View>
        {(error && touched) && this._renderError(error)}
      </View>
    )
  }
}
