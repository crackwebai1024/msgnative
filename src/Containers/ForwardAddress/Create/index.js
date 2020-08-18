import React, { Component } from 'react'
import { View, Alert } from 'react-native'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm, Field } from 'redux-form'
import { NavigationActions, StackActions } from 'react-navigation'
// import PropTypes from 'prop-types'
import { path } from 'ramda'

import m from 'commons/I18n'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { getDataItemForId } from 'commons/Redux/_Utils'
import { createValidator, required, email, i18nize } from 'commons/Lib/Validators'
import { ITEM_UPDATE_TYPES } from 'commons/Lib/Redux/CRUD'

import { promptIfDirty } from 'app/Navigation/utils'
import EditItemView from 'app/Components/EditView'
import FormTextInput from 'app/Components/Form/FormTextInput'
import SwitchInput from 'app/Components/Form/SwitchInput'
// import { Button, ButtonGroup } from 'app/Components/DetailView'
import Text from 'app/Components/BaseText'
import commonStyles from 'app/Styles/common'
import { FormSectionTitle } from 'app/Components/Form/Common'
import HeaderButton from 'app/Components/HeaderButton'
import BatchUpdateProgress from 'app/Containers/Mailbox/List/components/BatchUpdateProgress'

class CreateForwardAddress extends Component {
  constructor (props) {
    super(props)

    this.state = {
      focus: null
    }

    this.formValuesToPayload = this.formValuesToPayload.bind(this)
    this._delete = this._delete.bind(this)
    this._confirmDeletion = this._confirmDeletion.bind(this)

    this._focusEmail = this._setFocus.bind(this, 'email')
  }

  formValuesToPayload (values) {
    return {
      display_name: values.display_name,
      email: values.email,
      is_recovery: values.is_recovery,
      can_receive_invite: values.can_receive_invite
    }
  }

  _setFocus (key) {
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _isEditing () {
    return !!this.props.editItemData
  }

  _goToList () {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'ForwardAddressList' })]
    }))
  }

  _delete () {
    const {
      editItemData: data,
      intl,
      useremailRemove,
      displayNotification
    } = this.props
    const fm = intl.formatMessage
    useremailRemove(
      { id: data.id },
      () => {
        displayNotification(fm(m.native.Snackbar.forwardAddressDeleted), 'danger', 3000)
        this._goToList()
      },
      () => displayNotification(fm(m.native.Snackbar.couldntDeleteForwardAddress), 'danger', 3000)
    )
  }

  _confirmDeletion () {
    const {
      editItemData: data,
      intl,
      displayNotification
    } = this.props
    const fm = intl.formatMessage
    Alert.alert(
      fm(m.native.ForwardAddress.deleteForwardAddress, { name: data.display_name || data.email }),
      '',
      [
        { text: fm(m.app.Common.yes), onPress: this._delete },
        { text: fm(m.app.Common.no), onPress: () => displayNotification(fm(m.native.ForwardAddress.forwardAddressNotDeleted), 'info', 3000) }
      ]
    )
  }

  componentDidMount () {
    const { navigation, dirty } = this.props
    navigation.setParams({ dirty })
  }

  _updateNavigationDirtyFrom (nextProps) {
    const { navigation, dirty } = nextProps
    if (navigation.state.params && navigation.state.params.dirty !== undefined && navigation.state.params.dirty !== dirty) {
      navigation.setParams({ dirty })
    }
  }

  _updateCancelButtonDisabledState (props) {
    const thisEditItem = this.props.editItemData || {}
    const nextEditItem = props.editItemData || {}
    const prevIsCurrentActionInProgress = thisEditItem.actionTypeInProgress === ITEM_UPDATE_TYPES.REMOVE
    const nextIsCurrentActionInProgress = nextEditItem.actionTypeInProgress === ITEM_UPDATE_TYPES.REMOVE

    if (prevIsCurrentActionInProgress !== nextIsCurrentActionInProgress) {
      this.props.navigation.setParams({ disableCancel: nextIsCurrentActionInProgress })
    }
  }

  componentWillReceiveProps (nextProps) {
    this._updateNavigationDirtyFrom(nextProps)
    this._updateCancelButtonDisabledState(nextProps)
  }

  render () {
    const { submitting, navigation, editItemData } = this.props
    const isCurrentActionInProgress = !!editItemData && editItemData.actionTypeInProgress === ITEM_UPDATE_TYPES.REMOVE
    const formSubmitting = path(['state', 'params', 'submitting'], navigation)
    const showSpinner = isCurrentActionInProgress || formSubmitting || submitting
    return (
      <View style={{ flex: 1 }}>
        <EditItemView
          createSuccessMessage='Linked email saved'
          editSuccessMessage='Linked email saved'
          formValuesToPayload={this.formValuesToPayload}
          disableSubmit={showSpinner}
          {...this.props}
        >

          <FormSectionTitle text='Linked Email' />
          <Field
            name='display_name'
            component={FormTextInput}
            label='Name'
            returnKeyType='next'
            props={this._focusProp('display_name')}
            onSubmitEditing={this._focusEmail}
            blurOnSubmit
          />
          {/* {fm(m.app.Common.displayName)} */}

          <Field
            name='email'
            component={FormTextInput}
            label='Email'
            returnKeyType='next'
            keyboardType='email-address'
            autoCorrect={false}
            autoCapitalize='none'
            props={this._focusProp('email')}
            // API doesnt allow email address update
            editable={!this._isEditing()}
            blurOnSubmit
          />
          {/* label={fm(m.app.Common.emailAddress)} */}

          <FormSectionTitle text='Options' />
          <Field
            name='can_receive_invite'
            component={SwitchInput}
            label='Allow audio, video and chat messages using the above email address'
            onHelpText='Allowed'
            offHelpText='Disabled'
            values={[false, true]}
          />

          {/* <Field       // hide this option temporarily; 2017.12.22
            name='is_recovery'
            component={SwitchInput}
            label='Notifications can be sent to the above email address'
            onHelpText='Allowed'
            offHelpText='Disabled'
            values={[false, true]}
            default
          /> */}

          {this._isEditing() &&
            <View style={commonStyles.deleteContainer}>
              <Text style={commonStyles.deleteEntity} onPress={this._confirmDeletion}>Delete</Text>
            </View>
          }
        </EditItemView>
        {showSpinner && <BatchUpdateProgress />}
      </View>
    )
  }
}

const formValidator = createValidator({
  email: [
    i18nize(required, m.app.CommonValidation.emailRequired),
    i18nize(email, m.app.CommonValidation.emailInvalid)
  ]
})

const CreateForwardAddressForm = reduxForm({
  form: 'createForwardAddress',
  validate: formValidator
})(CreateForwardAddress)

const IntlCreateForwardAddressForm = injectIntl(CreateForwardAddressForm)
IntlCreateForwardAddressForm.navigationOptions = ({ navigation, screenProps }) => {
  const disableCancel = path(['state', 'params', 'disableCancel'], navigation)
  const disableSubmit = path(['state', 'params', 'disableSubmit'], navigation) // this value is set in `EditItemView` component
  return {
    ...EditItemView.navigationOptions({ navigation, screenProps }),
    title: path(['state', 'params', 'id'], navigation) ? screenProps.fm(m.native.Mailbox.editEmail) : screenProps.fm(m.native.Mailbox.addEmail), /* Edit title : Add title */
    headerLeft: (
      <HeaderButton
        title={screenProps.fm(m.app.Common.cancel)}
        onPress={promptIfDirty(navigation, screenProps.fm)}
        disabled={disableCancel || disableSubmit} />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const props = {
    initialValues: {
      is_recovery: true,
      can_receive_invite: true
    }
  }

  const id = path(['navigation', 'state', 'params', 'id'], ownProps)
  if (id) {
    props.editItemData = getDataItemForId(state.useremail, id)
    props.initialValues = {
      ...props.initialValues,
      ...props.editItemData
    }
  }

  return props
}

const mapDispatchToProps = {
  createItemRequest: UserEmailActions.useremailCreate,
  editItemRequest: UserEmailActions.useremailEdit,
  useremailRemove: UserEmailActions.useremailRemove,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlCreateForwardAddressForm)
