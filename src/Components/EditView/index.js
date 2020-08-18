import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { ScrollView, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native'
import dismissKeyboard from 'dismissKeyboard'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'

import HeaderButton from 'app/Components/HeaderButton'
import styles from 'app/Components/ListView/styles'

const BUTTON_STATE = {
  READY: 1,
  IN_PROGRESS: 2,
  DONE: 0
}

/**
 * EditItem container component.
 *
 * Used for creating either a new item or editing an existing one.
 *
 * `editItemData` is the prop used to pass the edit form data object.
 */
class EditItemView extends PureComponent {
  static propType = {
    style: PropTypes.object,

    // If an existing item is to be edited, pass the item data object
    editItemData: PropTypes.object.isRequired,

    // convert the form values to payload that can be submitted
    formValuesToPayload: PropTypes.func.isRequired,

    // action creator for item creation
    createItemRequest: PropTypes.func.isRequired,

    // action creator for editing item
    editItemRequest: PropTypes.func.isRequired,
    disableSubmit: PropTypes.bool,

    // create/edit success message
    createSuccessMessage: PropTypes.string.isRequired,
    editSuccessMessage: PropTypes.string.isRequired,

    // redux action for notification
    displayNotification: PropTypes.func.isRequired,

    goBackOnSuccess: PropTypes.bool,

    // Add or subtract additional spacing from keyboard height
    keyboardTopSpacing: PropTypes.number,

    // show Notification when success
    showNotification: PropTypes.bool,

    // onToggle method is called when when keyboard toggles.
    // Two parameters passed through, keyboardState (boolean,
    // true if keyboard shown) and keyboardSpace (height
    // occupied by keyboard)
    onKeyboardToggle: PropTypes.func,

    // Props that going to be passed to ScrollView comp inside
    scrollViewProps: PropTypes.object
  }

  static defaultProps = {
    goBackOnSuccess: true,
    showNotification: true,
    disableSubmit: false,
    keyboardTopSpacing: 0,
    onKeyboardToggle: () => null
  }

  /**
   * Handler for the form submission.
   *
   * @param values
   * @return {Promise}
   * @private
   */
  _handleSubmit (values) {
    const { editItemData, createItemRequest, editItemRequest, formValuesToPayload, dispatch } = this.props

    const payload = formValuesToPayload(values)

    let requestAction = createItemRequest

    // If the edit item data already has an id, it means the record already exists
    // on the server and so inject the id into the payload and use editing action
    if (editItemData && editItemData.id) {
      payload['id'] = editItemData.id
      requestAction = editItemRequest
    }

    return new Promise((resolve, reject) => requestAction(payload, resolve, reject, dispatch))
  }

  /**
   * Returns whether the component is in editing mode or creation mode.
   *
   * @return {boolean}
   * @private
   */
  _isEditing () {
    return !!this.props.editItemData
  }

  _updateNavbar (props) {
    const { rightTitle } = this.props

    // If the form submission is in progress, then show the activity indicator
    if (props.submitting) {
      props.navigation.setParams({
        buttonState: BUTTON_STATE.IN_PROGRESS,
        disableSubmit: true,
        submitting: true
      })
      return
    }

    if (props.submitSucceeded) {
      props.navigation.setParams({
        buttonState: BUTTON_STATE.DONE,
        disableSubmit: false,
        submitting: false
      })
      return
    }

    // Set the right button as "Save", with color based on the validity of form
    props.navigation.setParams({
      buttonTitle: rightTitle,
      buttonColor: props.valid ? 'rgb(0, 122, 255)' : 'gray',
      buttonState: BUTTON_STATE.READY,
      buttonOnPress: this.props.handleSubmit(this._handleSubmit.bind(this)).bind(this),
      disableSubmit: props.disableSubmit,
      submitting: false
    })
  }

  componentWillReceiveProps (nextProps) {
    // If the error prop is present and has changed, show it as an alert message
    if (nextProps.error && this.props.submitting && !nextProps.submitting) {
      Alert.alert(nextProps.error)
    }

    // If the submission was successful, then show an alert message and call pop
    // on the navigator stack
    if (nextProps.submitSucceeded && !this.props.submitSucceeded) {
      const message = this._isEditing() ? this.props.editSuccessMessage : this.props.createSuccessMessage
      if (this.props.showNotification) {
        this.props.displayNotification(message, 'success', 4000)
      }
      nextProps.goBackOnSuccess && setTimeout(nextProps.navigation.goBack, 500)
    }

    // If the `editItemData` was passed as props, then initialize the form
    if (nextProps.editItemData && (nextProps.editItemData !== this.props.editItemData)) {
      this.props.initialize(nextProps.editItemData)
    }

    // If the validity of the form or the submitting prop changes, update the navbar
    if (
      nextProps.disableSubmit !== this.props.disableSubmit ||
        nextProps.valid !== this.props.valid ||
        nextProps.submitting !== this.props.submitting ||
        nextProps.error !== this.props.error ||
        nextProps.submitSucceeded !== this.props.submitSucceeded
    ) { this._updateNavbar(nextProps) }
  }

  componentWillMount () {
    const { editItemData } = this.props

    // If editItemData is passed, use it for form initialization
    if (editItemData) {
      this.props.initialize(editItemData)
    }

    this._updateNavbar(this.props)
  }

  componentDidMount () {
    this._updateNavbar(this.props)
  }

  render () {
    return (
      <TouchableWithoutFeedback style={{ flex: 1 }} onPressOut={() => dismissKeyboard()}>
        <ScrollView style={[styles.editMain, this.props.style]} {...this.props.scrollViewProps}>
          {this.props.children}
          <KeyboardSpacer
            topSpacing={this.props.keyboardTopSpacing}
            onToggle={this.props.onKeyboardToggle}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    )
  }
}

const IntlEditItemView = injectIntl(EditItemView)
IntlEditItemView.navigationOptions = ({ navigation, screenProps }) => {
  const buttonState = path(['state', 'params', 'buttonState'], navigation)
  const disableSubmit = path(['state', 'params', 'disableSubmit'], navigation)
  if (!buttonState) return null

  const headerRight = buttonState !== BUTTON_STATE.READY
    ? <ActivityIndicator style={styles.navBarRightSpinner} animating />
    : (
      <HeaderButton
        title={navigation.state.params.buttonTitle || screenProps.fm(m.app.Common.save)}
        onPress={navigation.state.params.buttonOnPress}
        color={navigation.state.params.buttonColor}
        disabled={disableSubmit}
      />
    )

  return {
    tabBarVisible: false,
    headerRight
  }
}
const mapDispatchToProps = dispatch => ({
  displayNotification: (...args) => dispatch(NotificationActions.displayNotification(...args)),
  dispatch
})

export default connect(null, mapDispatchToProps)(IntlEditItemView)
