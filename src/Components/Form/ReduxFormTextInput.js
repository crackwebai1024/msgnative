import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

import TextInput from 'app/Components/BaseTextInput'

import { stylePropType } from 'app/Styles'

/**
 * ReduxFormTextInput is a wrapper class around TextInput with modifications
 * to work properly with redux-form.
 *
 * Other components will probably wrap this to display error message.
 *
 * Doesn't has any styles of its own.
 */
class ReduxFormTextInput extends PureComponent {
  static propTypes = {
    focus: PropTypes.bool,
    style: stylePropType,
    errorStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number
    ]),
    selectTextOnFocus: PropTypes.bool,
    textComponent: PropTypes.func
  }

  static defaultProps = {
    focus: false,
    selectTextOnFocus: true
  }

  constructor (props) {
    super(props)

    this._onChangeText = this._onChangeText.bind(this)
  }

  _onChangeText (text) {
    this.props.input.onChange(text)
    this.props.onChangeText && this.props.onChangeText(text)
  }

  componentWillReceiveProps (nextProps) {
    nextProps.focus && this.refs.input && this.refs.input.focus()
  }

  measure (...args) {
    return this.refs.input.measure(...args)
  }

  render () {
    const {
      style,
      errorStyle,
      input: { onChange, ...restInput },
      meta: { error, touched },
      ...otherProps
    } = this.props

    const TextComponent = this.props.textComponent || TextInput

    return (
      <TextComponent
        {...restInput}
        {...otherProps}
        ref='input'
        style={(touched && error) ? [style, errorStyle] : style}
        underlineColorAndroid='transparent'
        onChangeText={this._onChangeText}
        blurOnSubmit={!!otherProps.blurOnSubmit}
      />
    )
  }
}

export default ReduxFormTextInput
