import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableOpacity } from 'react-native'

import Text from 'app/Components/BaseText'

import { selectionStyles as styles, commonStyles } from './styles'

/**
 * redux-form's Field compatible component that supports jumping to another view
 * and taking back data in a callback. This data is then passed to the redux-form
 * form using the onChange callback.
 */
class ForeignItemSelectionInput extends PureComponent {
  static propTypes = {
    // The text shown in the call to action link
    // prompting the user to select an item (required)
    linkText: PropTypes.string.isRequired,

    // Callback called upon clicking the link text (required)
    goToItemSelectionView: PropTypes.func.isRequired,

    // Triggers the selection view when the component is mounted
    // used by the TextInputOrForeignItemSelectionInput so that
    // when user switches from textInput to selection input, the
    // slection list view is triggered automatically
    goToSelectionOnMount: PropTypes.bool.isRequired,

    // Displayed above the link text before a selection has been made (required)
    initialMessage: PropTypes.string.isRequired,

    // Displayed above the link after a selection has been made (required)
    selectedMessage: PropTypes.string.isRequired,

    // Disable item selection
    disableSelection: PropTypes.bool.isRequired,

    // Pass these two to show a label button at the top right
    labelButtonText: PropTypes.string,
    labelButtonCb: PropTypes.func,

    // Function for rendering the selected value
    // If not passed, `display_name` property will be used
    renderSelectedValue: PropTypes.func,

    // Pass a callback that'd called after an item has been selected
    cleanupCb: PropTypes.func
  }

  static defaultProps = {
    disableSelection: false,
    goToSelectionOnMount: false
  }

  constructor (props) {
    super(props)
    this._handlePress = this._handlePress.bind(this)
    this._handleItemSelection = this._handleItemSelection.bind(this)
  }

  /**
   * Callback given to the items selection view which is called
   * when the user selects an item, passing back the data.
   *
   * @param data
   */
  _handleItemSelection (data) {
    const { input: { onChange, onBlur }, cleanupCb, onSubmitEditing } = this.props

    // Invoke the redux-form helper functions and pass it the data about
    // the selected item
    onChange(data)
    onBlur()

    // Call the post selection cleanup callback
    typeof cleanupCb === 'function' && cleanupCb()

    typeof onSubmitEditing === 'function' && onSubmitEditing()
  }

  _handlePress () {
    const { disableSelection, goToItemSelectionView, cleanupCb } = this.props

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

  _renderLabel () {
    const {
      input: { value },
      meta: { error, touched },
      initialMessage,
      selectedMessage,
      labelButtonText,
      labelButtonCb
    } = this.props

    let labelTextString = value ? selectedMessage : initialMessage

    if (error) labelTextString = error

    const labelText = (
      <Text style={[commonStyles.label, (touched && error) && commonStyles.labelError]}>
        {labelTextString}
      </Text>
    )

    // If there's no label button, return the label text as it is
    if (!labelButtonText || !labelButtonCb) return labelText

    // Otherwise render the label text along with the label button
    return (
      <View style={commonStyles.labelContainer}>
        {labelText}
        <TouchableOpacity style={commonStyles.labelButton} onPress={labelButtonCb}>
          <Text style={commonStyles.labelButtonText}>{labelButtonText}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderSelectedValue (value) {
    if (value) {
      return value.display_name || value.email
    }
  }

  componentDidMount () {
    const { goToSelectionOnMount } = this.props
    if (goToSelectionOnMount) {
      this._handlePress()
    }
  }

  render () {
    let {
      input: { value },
      linkText,
      renderSelectedValue
    } = this.props

    renderSelectedValue = renderSelectedValue || this._renderSelectedValue

    return (
      <View style={styles.container}>
        {this._renderLabel()}
        <Text
          style={styles.item}
          onPress={this._handlePress}
        >
          {renderSelectedValue(value) || linkText}
        </Text>
      </View>
    )
  }
}

export default ForeignItemSelectionInput
