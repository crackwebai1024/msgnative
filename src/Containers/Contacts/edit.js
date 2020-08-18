import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { View, Alert } from 'react-native'
import { reduxForm, Field } from 'redux-form'
import { NavigationActions, StackActions } from 'react-navigation'
import { path } from 'ramda'
import m from 'commons/I18n'
import { ITEM_UPDATE_TYPES } from 'commons/Lib/Redux/CRUD'
import ContactActions from 'commons/Redux/ContactRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { getDataItemForIdWithCacheFirst } from 'commons/Redux/_Utils'
import { createValidator, required, email, i18nize } from 'commons/Lib/Validators'
import { promptIfDirty } from 'app/Navigation/utils'
import EditItemView from 'app/Components/EditView'
import FormTextInput from 'app/Components/Form/FormTextInput'
// import { Button, ButtonGroup } from 'app/Components/DetailView'
import Picker from 'app/Components/Form/Picker'
import ForeignItemSelectionInput from 'app/Components/Form/ForeignItemSelectionInput'
import Text from 'app/Components/BaseText'
import commonStyles from 'app/Styles/common'
import { FormSectionTitle } from 'app/Components/Form/Common'
import HeaderButton from 'app/Components/HeaderButton'
import BatchUpdateProgress from '../Mailbox/List/components/BatchUpdateProgress'

const CONTACT_STATE = [
  { value: 1, title: 'Allow' },
  { value: -1, title: 'Reject/block' },
  { value: -2, title: 'Silently ignore' }
]

// const whitelist = [
//   'display_name', 'email', 'identity', 'state', 'notes',
//   'contact_pref_mail_load_remote_content', 'contact_pref_mail_load_embedded_image',
//   'pref_mail_load_remote_content', 'pref_mail_load_embedded_image',
//   'gpg_public_key', 'smime_public_cert', 'address', 'phone_number_home',
//   'phone_number_cell', 'phone_number_work'
// ]

class EditContact extends Component {
  constructor (props) {
    super(props)

    this.state = {
      focus: null
    }

    this.formValuesToPayload = this.formValuesToPayload.bind(this)

    this._focusOrganization = this._setFocus.bind(this, 'organization')
    this._focusEmail = this._setFocus.bind(this, 'email')
    this._focusNotes = this._setFocus.bind(this, 'notes')
    this._focusIdentity = this._setFocus.bind(this, 'identity')
    this._focusState = this._setFocus.bind(this, 'state')
    this._focusGPG = this._setFocus.bind(this, 'gpg_public_key')
    this._focusSMIME = this._setFocus.bind(this, 'smime_public_cert')
    this._focusPhysicalAddress = this._setFocus.bind(this, 'address')
    this._focusPhoneMobile = this._setFocus.bind(this, 'phone_number_cell')
    this._focusPhoneHome = this._setFocus.bind(this, 'phone_number_home')

    this._selectIdentity = this._selectIdentity.bind(this)
    this._deleteContact = this._deleteContact.bind(this)
    this._confirmDeletion = this._confirmDeletion.bind(this)
    this._updateNavigationDirtyFrom = this._updateNavigationDirtyFrom.bind(this)
  }

  formValuesToPayload (values) {
    const payload = {
      display_name: values.display_name ? values.display_name.trim() : '',
      organization: values.organization ? values.organization.trim() : '',
      phone_number_cell: values.phone_number_cell,
      // phone_number_home: values.phone_number_home,
      email: values.email,

      address: values.address,

      // has_contact_email_pgp: values.has_contact_email_pgp,
      // has_contact_email_smime: values.has_contact_email_smime,
      notes: values.notes

      // phone_number_work: values.phone_number_work,
      // pref_mail_load_embedded_image: values.pref_mail_load_embedded_image,
      // pref_mail_load_remote_content: values.pref_mail_load_remote_content,

      // contact_pref_mail_load_embedded_image: values.contact_pref_mail_load_embedded_image,
      // contact_pref_mail_load_remote_content: values.contact_pref_mail_load_remote_content,
    }

    if (values.state) {
      payload.state = values.state
    }

    if (values.identity) {
      payload.identity_id = values.identity.id
    }

    return payload
  }

  _setFocus (key) {
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _selectIdentity (params) {
    this.props.navigation.navigate('IdentitySelection', params)
  }

  _isEditing () {
    return !!this.props.editItemData && !this.props.createForm
  }

  _goToList () {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'ContactList' })]
    }))
  }

  _deleteContact () {
    const {
      intl,
      editItemData: data,
      deleteContactRequest,
      displayNotification
    } = this.props
    const fm = intl.formatMessage
    const payload = {
      email: data.email,
      delete_mail_history: false
    }
    deleteContactRequest(
      payload,
      () => {
        displayNotification(fm(m.native.Snackbar.contactDeleted), 'danger', 3000)
        // to avoid route doesnot exists error, simply goback and let the previous page handle the null data state
        this.props.navigation.goBack()
      },
      () => displayNotification(fm(m.native.Snackbar.couldntDeleteContact), 'danger', 3000)
    )
  }

  _confirmDeletion () {
    const {
      intl,
      editItemData: data,
      displayNotification
    } = this.props
    const fm = intl.formatMessage

    Alert.alert(
      fm(m.native.Contact.deleteContact, { name: data.email }),
      '',
      [
        { text: fm(m.app.Common.yes), onPress: this._deleteContact },
        { text: fm(m.app.Common.no), onPress: () => displayNotification(fm(m.native.Contact.contactNotDeleted), 'info', 3000) }
      ]
    )
  }

  _updateNavigationDirtyFrom (nextProps) {
    const { navigation, dirty } = nextProps

    setTimeout(() => {
      if (path(['state', 'params', 'dirty'], navigation) !== dirty) {
        navigation.setParams({ dirty })
      }
    }, 100)
  }

  _updateNavigationIsEditing (nextProps) {
    const { navigation } = nextProps
    const isEditing = this._isEditing()
    setTimeout(() => {
      if (path(['state', 'params', 'isEditing'], navigation) !== isEditing) {
        navigation.setParams({ isEditing })
      }
    }, 100)
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
    this._updateNavigationIsEditing(nextProps)
    this._updateCancelButtonDisabledState(nextProps)
    if (nextProps.focusedFieldName && nextProps.focusedFieldName !== this.props.focusedFieldName && nextProps.focusedFieldName !== this.state.focus) {
      this._setFocus(nextProps.focusedFieldName)
      this.scrollViewRef.scrollTo({ y: 250, animated: true })
    }
  }

  render () {
    const { intl, editItemData, navigation } = this.props
    const isEditing = this._isEditing()
    const fm = intl.formatMessage
    const disableEmail = isEditing || (editItemData && this.props.createForm)
    const isCurrentActionInProgress = !!editItemData && editItemData.actionTypeInProgress === ITEM_UPDATE_TYPES.REMOVE
    const submitting = path(['state', 'params', 'submitting'], navigation)
    return (
      <View style={{ flex: 1 }}>
        <EditItemView
          createSuccessMessage={fm(m.native.Contact.contactSaved)}
          editSuccessMessage={fm(m.native.Contact.contactSaved)}
          formValuesToPayload={this.formValuesToPayload}
          scrollViewProps={{ ref: (ref) => { this.scrollViewRef = ref } }}
          disableSubmit={isCurrentActionInProgress}
          {...this.props}
        >
          <FormSectionTitle text={fm(m.native.Contact.contact)} />

          <Field
            name='display_name'
            component={FormTextInput}
            label={fm(m.app.Common.name)}
            returnKeyType='next'
            props={this._focusProp('display_name')}
            onSubmitEditing={this._focusOrganization}
            blurOnSubmit
          />

          <Field
            name='organization'
            component={FormTextInput}
            label={fm(m.native.Contact.organization)}
            returnKeyType='next'
            props={this._focusProp('organization')}
            onSubmitEditing={this._focusPhoneMobile}
            blurOnSubmit
          />

          <Field
            name='phone_number_cell'
            component={FormTextInput}
            label={fm(m.app.Contact.mobilePhone)}
            keyboardType='phone-pad'
            returnKeyType='next'
            props={this._focusProp('phone_number_cell')}
            onSubmitEditing={this._focusPhoneHome}
            blurOnSubmit
          />
          <Field
            name='phone_number_home'
            component={FormTextInput}
            label={fm(m.app.Contact.homePhone)}
            keyboardType='phone-pad'
            returnKeyType='next'
            props={this._focusProp('phone_number_home')}
            onSubmitEditing={isEditing ? this._focusState : this._focusEmail}
            blurOnSubmit
          />

          <Field
            name='email'
            component={FormTextInput}
            label={fm(m.app.Common.email)}
            returnKeyType='next'
            // API doesnt allow email address update
            editable={!disableEmail}
            keyboardType='email-address'
            autoCorrect={false}
            autoCapitalize='none'
            props={this._focusProp('email')}
            onSubmitEditing={isEditing ? this._focusPhysicalAddress : this._focusIdentity}
            blurOnSubmit
          />

          { !isEditing && (
            <Field
              name='identity'
              type='select'
              component={ForeignItemSelectionInput}
              goToItemSelectionView={this._selectIdentity}
              linkText={fm(m.native.Contact.selectIdentity)}
              initialMessage={fm(m.native.Contact.identityRequired)}
              selectedMessage={fm(m.native.Contact.identityKnownBy)}
              props={this._focusProp('identity')}
            />
          )}

          <Field
            name='address'
            component={FormTextInput}
            label={fm(m.native.Contact.address)}
            returnKeyType='next'
            props={this._focusProp('address')}
            onSubmitEditing={this._focusGPG}
            blurOnSubmit
          />

          <FormSectionTitle text={fm(m.native.Contact.emailSettings)} />

          <Field
            name='state'
            component={Picker}
            title={fm(m.native.Contact.allowEmails)}
            initialMessage={fm(m.native.Contact.allowBlockOrIgnore)}
            linkText={fm(m.native.Contact.selectContactState)}
            returnKeyType='next'
            options={CONTACT_STATE}
            props={this._focusProp('state')}
            onSubmitEditing={this._focusNotes}
          />

          <FormSectionTitle text={fm(m.native.Contact.notes)} />

          <Field
            name='notes'
            component={FormTextInput}
            label={fm(m.native.Contact.notes)}
            returnKeyType='next'
            props={this._focusProp('notes')}
            onSubmitEditing={this._focusGPG}
            blurOnSubmit
          />

          { isEditing && (
            <View>
              <FormSectionTitle text={fm(m.native.Contact.actions)} />
              <View style={commonStyles.deleteContainer}>
                <Text style={commonStyles.deleteEntity} onPress={this._confirmDeletion}>{fm(m.native.Contact.deleteContactButton)}</Text>
              </View>
            </View>
          )}
        </EditItemView>
        {(isCurrentActionInProgress || submitting) && <BatchUpdateProgress />}
      </View>
    )
  }
}

const contactEditFormValidator = createValidator({
  identity: [
    i18nize(required, m.app.CommonValidation.identityRequired)
  ],
  email: [
    i18nize(required, m.app.CommonValidation.emailRequired),
    i18nize(email, m.app.CommonValidation.emailInvalid)
  ]
})

const EditContactForm = reduxForm({
  form: 'editContact',
  validate: contactEditFormValidator,
  onSubmitFail: (errors, dispatch, submitError, props) => {
    if (errors && Object.keys(errors).length > 0) {
      Object.keys(errors).map(name => {
        props.setFocus(name)
      })
    }
  }
})(EditContact)

const IntlEditContactForm = injectIntl(EditContactForm)
IntlEditContactForm.navigationOptions = ({ navigation, screenProps }) => {
  const disableCancel = path(['state', 'params', 'disableCancel'], navigation)
  const disableSubmit = path(['state', 'params', 'disableSubmit'], navigation)  // this value is set in `EditItemView` component
  const isEditing = path(['state', 'params', 'isEditing'], navigation)
  return {
    ...EditItemView.navigationOptions({ navigation, screenProps }),
    title: isEditing ? screenProps.fm(m.native.Contact.editContact) : screenProps.fm(m.native.Contact.addContact),
    headerLeft: (
      <HeaderButton
        title={screenProps.fm(m.app.Common.cancel)}
        onPress={promptIfDirty(navigation, screenProps.fm)}
        disabled={disableCancel || disableSubmit} />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const id = path(['navigation', 'state', 'params', 'id'], ownProps)
  const createForm = path(['navigation', 'state', 'params', 'createForm'], ownProps)
  let editItemData = getDataItemForIdWithCacheFirst(state.contact, id)
  if (editItemData && editItemData.asMutable && createForm) {
    editItemData = editItemData.asMutable()
    delete editItemData.id
    // pre-select `identity` field using either `identity_id` or `identity_email`
    const identityId = path(['navigation', 'state', 'params', 'identity_id'], ownProps)
    const identityEmail = path(['navigation', 'state', 'params', 'identity_email'], ownProps)
    if (identityId || identityEmail) {
      const identity = getDataItemForIdWithCacheFirst(state.identity, identityId, identityEmail)
      if (identity && !identity.is_deleted) {
        editItemData.identity = getDataItemForIdWithCacheFirst(state.identity, identityId, identityEmail)
      }
    }
  }
  return {
    createForm,
    editItemData,
    focusedFieldName: state.contact.focusedFieldName
  }
}

const mapDispatchToProps = {
  createItemRequest: ContactActions.contactCreate,
  editItemRequest: ContactActions.contactEdit,
  deleteContactRequest: ContactActions.contactRemove,
  displayNotification: NotificationActions.displayNotification,
  setFocus: ContactActions.setFocus
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlEditContactForm)
