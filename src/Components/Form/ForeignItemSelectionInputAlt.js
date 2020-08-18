import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'

import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const s = EStyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '0.7rem',
    paddingVertical: '0.8rem',
    borderBottomColor: palette.clouds,
    borderBottomWidth: 1,
    backgroundColor: palette.white
  },

  labelText: {
    fontSize: '1rem'
  },

  innerContainerLeft: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },

  valueText: {
    fontSize: '1rem',
    color: palette.concrete
  },

  iconRight: {
    marginLeft: '0.75rem',
    fontSize: '1.5rem',
    color: palette.silver
  }
})

/**
 * redux-form's Field compatible component that supports jumping to another view
 * and taking back data in a callback. This data is then passed to the redux-form
 * form using the onChange callback.
 */
class ForeignItemSelectionInputAlt extends PureComponent {
  static propTypes = {
    // Callback called upon clicking the link text (required)
    goToItemSelectionView: PropTypes.func.isRequired,

    // Triggers the selection view when the component is mounted
    // used by the TextInputOrForeignItemSelectionInput so that
    // when user switches from textInput to selection input, the
    // slection list view is triggered automatically
    goToSelectionOnMount: PropTypes.bool.isRequired,

    // Disable item selection
    disableSelection: PropTypes.bool.isRequired,

    // Pass these two to show a label button at the top right
    label: PropTypes.string.isRequired,

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

  _renderSelectedValue (value) {
    return value.toString()
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
      label,
      renderSelectedValue
    } = this.props

    renderSelectedValue = renderSelectedValue || this._renderSelectedValue

    return (
      <TouchableOpacity style={s.container} onPress={this._handlePress}>
        <Text style={s.labelText}>{label}</Text>
        <View style={s.innerContainerLeft}>
          <Text style={s.valueText}>
            {value && renderSelectedValue(value)}
          </Text>
          <Icon style={s.iconRight} name='angle-right' />
        </View>
      </TouchableOpacity>
    )
  }
}

export default ForeignItemSelectionInputAlt
