import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

import FormTextInput from 'app/Components/Form/FormTextInput'
import ForeignItemSelectionInput from 'app/Components/Form/ForeignItemSelectionInput'

/**
 * A wrapper around FormTextInput & ForeignItemSelectionInput.
 * Allows the user to input value with either.
 *
 * Handles the logic around switching between the two components
 * and clearing the value upon switch.
 *
 * Use case - Mailbox Compose scene where user can either
 * choose an existing contact or enter a new email address.
 */
class TextInputOrForeignItemSelectionInput extends PureComponent {
  static propTypes = {
    // Props to be forwarded to the FormTextInput
    textInputProps: PropTypes.object.isRequired,
    // Props to be forwarded to the ForeignItemSelectionInput
    foreignItemSelectionInputProps: PropTypes.object.isRequired,

    // Disable changing the value
    disableSelection: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      // If the input value is an object, hide the text input
      textInputVisible: !(props.input && props.input.value && typeof props.input.value === 'object')
    }
    this._handleItemSelection = this._handleItemSelection.bind(this)
    this._goToSelect = this._goToSelect.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    // If the value is just coming in now
    // and the type is object, then hide the text input
    // so that ForeignItemSelectionInput can show up and
    // make use of the object
    // if (!this.props.input.value && nextProps.input.value && typeof nextProps.input.value === 'object') {
    if (nextProps.input.value && typeof nextProps.input.value === 'object') {
      this.setState({ textInputVisible: false })
    }
  }

  _changeTextinputVisibility (value) {
    if (this.props.disableSelection) return

    this.props.input.onChange('')
    this.setState({ textInputVisible: value })
  }

  _goToSelect () {
    const { disableSelection, goToItemSelectionView } = this.props

    // If selection is disabled, do nothing
    // Use case – disabling identity selection on edit contact screen
    if (disableSelection) return

    // Otherwise transition to item selection view and pass a callback for dealing with
    // the selected item data
    goToItemSelectionView({
      disableSwipe: true,
      selectItemAndPop: this._handleItemSelection
    })
  }

  /**
   * Callback given to the items selection view which is called
   * when the user selects an item, passing back the data.
   *
   * @param selectedValue
   */
  _handleItemSelection (selectedValue) {
    const { input: { onChange, onBlur }, cleanupCb, onSubmitEditing, transformData } = this.props

    const _transformData = transformData || ((val, cb) => cb(val))

    _transformData(selectedValue, data => {
      // Invoke the redux-form helper functions and pass it the data about
      // the selected item
      onChange(data)
      onBlur()

      // Call the post selection cleanup callback
      typeof cleanupCb === 'function' && cleanupCb()

      typeof onSubmitEditing === 'function' && onSubmitEditing()
    })
  }

  render () {
    const { textInputProps, foreignItemSelectionInputProps, ...commonProps } = this.props

    if (this.props.disableSelection) {
      commonProps['labelButtonText'] = null
    }

    if (this.state.textInputVisible) {
      return (
        <FormTextInput
          {...textInputProps}
          {...commonProps}
          labelButtonCb={this._goToSelect}
        />
      )
    }

    return (
      <ForeignItemSelectionInput
        {...foreignItemSelectionInputProps}
        {...commonProps}
        // Pass label button callback for showing FormTextInput
        labelButtonCb={this._changeTextinputVisibility.bind(this, true)}
      />
    )
  }
}

export default TextInputOrForeignItemSelectionInput
