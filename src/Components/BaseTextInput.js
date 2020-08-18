import React, { PureComponent } from 'react'
import { TextInput } from 'react-native'

export default class BaseTextInput extends PureComponent {
  focus () {
    this.refs.input.focus()
  }

  measure (...args) {
    return this.refs.input.measure(...args)
  }

  render () {
    return (
      <TextInput {...this.props} style={this.props.style} ref='input'>
        {this.props.children}
      </TextInput>
    )
  }
}
