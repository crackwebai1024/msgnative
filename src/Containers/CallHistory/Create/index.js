/* Seems Deprecated Component */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'react-native'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { DataPicker } from 'rnkit-actionsheet-picker'
import { path } from 'ramda'
import { NavigationActions, StackActions } from 'react-navigation'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import ContactActions from 'commons/Redux/ContactRedux'
import ChatActions from 'commons/Redux/ChatRedux'
import WebrtcActions from 'commons/Redux/WebrtcRedux'
import UserActions from 'commons/Redux/UserRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import EditItemView from 'app/Components/EditView'
import FormTextInput from 'app/Components/Form/FormTextInput'
import ForeignItemSelectionInput from 'app/Components/Form/ForeignItemSelectionInput'
import { createValidator, required, i18nize } from 'commons/Lib/Validators'
import palette from 'app/Styles/colors'

export const FORM_IDENTIFIER = 'create-call'

class CreateCall extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    identities: PropTypes.object,
    selectedIdentity: PropTypes.object,
    selectedContact: PropTypes.string,
    asyncValidating: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool
    ]),
    change: PropTypes.func.isRequired,
    toggleContactMsgsafeUsersFilter: PropTypes.func.isRequired,
    clearContactMsgsafeUsersFilter: PropTypes.func.isRequired,
    isOnline: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._selectIdentity = this._selectIdentity.bind(this)
    this._formValuesToPayload = this._formValuesToPayload.bind(this)

    this._focusIdentity = this._setFocus.bind(this, 'identity')
    this.handleFormSubmit = this.handleFormSubmit.bind(this)

    const fm = props.intl.formatMessage

    this.callTypes = [
      fm(m.native.Chat.call),
      fm(m.native.Chat.title)
    ]

    this.state = {
      editItemData: null,
      focus: null
    }
  }

  _setFocus (key) {
    if (!key) return
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _formValuesToPayload (values) {
    return {
      identityEmail: values.identity.email,
      contactEmail: values.contact.email || values.contact,
      contactDisplayName: values.contact.display_name || ''
    }
  }

  _selectIdentity (params) {
    this.props.navigation.navigate('IdentitySelection', params)
  }

  _showCallTypePicker (cb) {
    const fm = this.props.intl.formatMessage

    const dataSource = this.callTypes
    const titleText = ''

    DataPicker.show({
      dataSource,
      titleText,
      defaultSelected: [dataSource[0]],
      doneText: fm(m.app.Common.done),
      cancelText: fm(m.app.Common.cancel),
      numberOfComponents: 1,
      onPickerConfirm: (selectedData, selectedIndex) => {
        cb(selectedIndex[0])
      },
      onPickerCancel: this._handleCancel
    })
  }

  handleFormSubmit = (payload, resolve, reject, dispatch) => {
    const { identityEmail, contactEmail, contactDisplayName } = payload

    if (identityEmail === contactEmail) {
      reject()
      return
    }

    this._showCallTypePicker((selectedIndex) => {
      dispatch(
        StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'CallHistoryList' })
          ]
        })
      )

      dispatch(WebrtcActions.makeOutboundVideoCallOffer(identityEmail, contactEmail, contactDisplayName, selectedIndex === 0))
      resolve()
    })
  }

  componentWillMount () {
    this.props.toggleContactMsgsafeUsersFilter()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.asyncValidating && !nextProps.asyncValidating) {
      const { identities } = nextProps
      let isMyIdentity = nextProps.selectedIdentity && nextProps.selectedIdentity.email === nextProps.selectedContact
      if (!isMyIdentity) {
        if (identities && (typeof identities === 'object')) {
          for (let id in identities) {
            if (identities[id].email === nextProps.selectedContact) {
              isMyIdentity = true
              break
            }
          }
        }
      }
      if (isMyIdentity) {
        Alert.alert(
          nextProps.intl.formatMessage(m.app.Common.warning),
          nextProps.intl.formatMessage(m.native.Chat.cantCallYourself),
          [
            { text: nextProps.intl.formatMessage(m.app.Common.ok), onPress: () => nextProps.change('contact', null) }
          ],
          { cancelable: true }
        )
      }
    }
  }

  componentWillUnmount () {
    this.props.clearContactMsgsafeUsersFilter()
  }

  render () {
    const { intl } = this.props
    const fm = intl.formatMessage
    return (
      <EditItemView
        createSuccessMessage=''
        editSuccessMessage=''
        formValuesToPayload={this._formValuesToPayload}
        rightTitle={fm(m.native.Chat.start)}
        style={{ backgroundColor: palette.white }}
        goBackOnSuccess={false}
        showNotification={false}
        {...this.props}
        createItemRequest={this.handleFormSubmit}
        editItemRequest={this.handleFormSubmit}
        editItemData={this.state.editItemData}
      >
        <Field
          name='contact'
          component={FormTextInput}
          label={fm(m.app.Common.emailAddress)}
          returnKeyType='next'
          keyboardType='email-address'
          autoCorrect={false}
          autoCapitalize='none'
          props={this._focusProp('contact')}
          placeholder='john.doe@example.com'
          onSubmitEditing={this._focusIdentity}
          blurOnSubmit
        />

        <Field
          name='identity'
          type='select'
          component={ForeignItemSelectionInput}
          goToItemSelectionView={this._selectIdentity}
          linkText={fm(m.native.Chat.selectIdentity)}
          initialMessage={fm(m.native.Chat.selectIdentityToStart)}
          selectedMessage={fm(m.native.Chat.identityForCalling)}
          props={this._focusProp('identity')}

        />
      </EditItemView>
    )
  }
}

const createCallValidator = createValidator({
  identity: [i18nize(required, m.native.Chat.identityRequired)],
  contact: [i18nize(required, m.native.Chat.contactRequired)]
})

// Async validator that checks if contact email is a msgsafe user
// and can chat
const createCallAsyncValidator = (values, dispatch, props) => {
  // If contact is present, validate it
  if (values.contact && props.isOnline) {
    const contactEmail = values.contact.email || values.contact
    return new Promise((resolve, reject) => {
      props.canMemberChat(
        { email: contactEmail },
        response => response && response.status && resolve(),
        () => reject({ contact: props.intl.formatMessage(m.native.Chat.notAMsgSafeUser) })
      )
    })
  }

  // return a resolved promise as required by redux-form
  return Promise.resolve()
}

const CreateCallForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: createCallValidator,
  asyncBlurFields: ['contact'],
  asyncValidate: createCallAsyncValidator
})(CreateCall)

const IntlCreateCallForm = injectIntl(CreateCallForm)

IntlCreateCallForm.navigationOptions = (...args) => {
  let title = ''
  if (args[0] && args[0].screenProps) {
    title = args[0].screenProps.fm(m.native.Chat.call)
  }

  return {
    ...EditItemView.navigationOptions(...args),
    title
  }
}

const mapStateToProps = (state, ownProps) => {
  const identity = path(['form', FORM_IDENTIFIER, 'values', 'identity'], state)
  const contact = path(['form', FORM_IDENTIFIER, 'values', 'contact'], state)

  return {
    identities: state.identity.data,
    selectedIdentity: identity,
    selectedContact: contact,
    isOnline: state.app.isNetworkOnline
  }
}

const mapDispatchToProps = {
  displayNotification: NotificationActions.displayNotification,
  clearContactSearchData: ContactActions.contactClearSearchData,
  emailConfirmationRequest: UserActions.emailConfirmationRequest,
  canMemberChat: ChatActions.canMemberChatRequest,
  toggleContactMsgsafeUsersFilter: ContactActions.toggleContactMsgsafeUsersFilter,
  clearContactMsgsafeUsersFilter: ContactActions.clearContactMsgsafeUsersFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlCreateCallForm)
