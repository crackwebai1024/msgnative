/* Seems Deprecated Component */
import React, { Component } from 'react'
import { Alert } from 'react-native'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { path } from 'ramda'
import { NavigationActions, StackActions } from 'react-navigation'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import ContactActions from 'commons/Redux/ContactRedux'
import ChatActions from 'commons/Redux/ChatRedux'
import UserActions from 'commons/Redux/UserRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import EditItemView from 'app/Components/EditView'
import FormTextInput from 'app/Components/Form/FormTextInput'
import ForeignItemSelectionInput from 'app/Components/Form/ForeignItemSelectionInput'
import { createValidator, required, i18nize } from 'commons/Lib/Validators'
import palette from 'app/Styles/colors'

export const FORM_IDENTIFIER = 'createChatRoom'

class ChatCreateRoom extends Component {
  constructor (props) {
    super(props)

    this._selectIdentity = this._selectIdentity.bind(this)
    this._formValuesToPayload = this._formValuesToPayload.bind(this)

    this._focusIdentity = this._setFocus.bind(this, 'identity')

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
    const {
      roomId, roomExistsInMemory, roomExistsButNotInMemory, displayNotification, intl
    } = this.props

    if (roomExistsInMemory) {
      setTimeout(() => displayNotification(intl.formatMessage(m.native.Chat.roomExists), 'danger', 3000), 500)
      return { skip: true }
    }

    if (roomExistsButNotInMemory) {
      return {
        setupRoom: true,
        identityEmail: values.identity.email,
        identityDisplayName: values.identity.display_name,
        contact: values.contact.email || values.contact,
        roomId
      }
    }

    return {
      identityEmail: values.identity.email,
      identityDisplayName: values.identity.display_name,
      contact: values.contact.email || values.contact
    }
  }

  _selectIdentity (params) {
    this.props.navigation.navigate('IdentitySelection', params)
  }

  componentWillMount () {
    this.props.toggleContactMsgsafeUsersFilter()
  }

  componentWillReceiveProps (nextProps) {
    // If the selected identity has changed
    // and a contact has already been selected, reset it
    if (
      this.props.selectedIdentity && nextProps.selectedContact &&
      (nextProps.selectedIdentity !== this.props.selectedIdentity) &&
      nextProps.selectedContact.id
    ) {
      this.props.change('contact', null)
    }

    if (!this.props.submitSucceeded && nextProps.submitSucceeded) {
      if (nextProps.selectedIdentity.email == nextProps.selectedContact) {
        Alert.alert(
          nextProps.intl.formatMessage(m.app.Common.warning),
          nextProps.intl.formatMessage(m.native.Chat.cantChatWithYourself),
          [
            { text: nextProps.intl.formatMessage(m.app.Common.ok), onPress: () => {} }
          ],
          { cancelable: true }
        )
        return
      }
      const message = this.props.roomExistsInMemory ? '' : this.props.intl.formatMessage(m.native.Chat.chatCreated)
      this.props.displayNotification(message, 'success', 4000)

      this.props.navigation.dispatch(StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'MessagingRoomList' })]
      }))
    }
  }

  componentWillUnmount () {
    this.props.clearContactMsgsafeUsersFilter()
  }

  render () {
    const { roomExistsInMemory, intl } = this.props
    const fm = intl.formatMessage
    return (
      <EditItemView
        createSuccessMessage={roomExistsInMemory ? '' : fm(m.native.Chat.chatCreated)}
        editSuccessMessage={roomExistsInMemory ? '' : fm(m.native.Chat.chatCreated)}
        formValuesToPayload={this._formValuesToPayload}
        rightTitle={fm(m.native.Chat.start)}
        style={{ backgroundColor: palette.white }}
        goBackOnSuccess={false}
        showNotification={false}
        {...this.props}
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
          selectedMessage={fm(m.native.Chat.identityForChatting)}
          props={this._focusProp('identity')}

        />
      </EditItemView>
    )
  }
}

const chatCreateRoomValidator = createValidator({
  identity: [i18nize(required, m.native.Chat.identityRequired)],
  contact: [i18nize(required, m.native.Chat.contactRequired)]
})

// Async validator that checks if contact email is a msgsafe user
// and can chat
const chatCreateRoomAsyncValidator = (values, dispatch, props) => {
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

const ChatCreateRoomForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: chatCreateRoomValidator,
  asyncBlurFields: ['contact'],
  asyncValidate: chatCreateRoomAsyncValidator
})(ChatCreateRoom)

const IntlChatCreateRoomForm = injectIntl(ChatCreateRoomForm)

IntlChatCreateRoomForm.navigationOptions = (...args) => {
  let title = ''
  if (args[0] && args[0].screenProps) {
    title = args[0].screenProps.fm(m.native.Chat.chat)
  }

  return {
    ...EditItemView.navigationOptions(...args),
    title
  }
}

const mapStateToProps = (state, ownProps) => {
  const identity = path(['form', FORM_IDENTIFIER, 'values', 'identity'], state)
  const contact = path(['form', FORM_IDENTIFIER, 'values', 'contact'], state)

  let roomExistsInMemory = false
  let roomExistsButNotInMemory = false
  let roomId = null
  if (identity && contact) {
    const roomsMapKey = `${identity.email}__${contact.email || contact}`
    roomId = state.chat.roomsMap[roomsMapKey]
    if (roomId && state.chat.data[roomId]) {
      roomExistsInMemory = true
    } else if (roomId) {
      roomExistsButNotInMemory = true
    }
  }

  return {
    roomId,
    // identities: state.identity.data,
    selectedIdentity: identity,
    selectedContact: contact,
    roomExistsInMemory,
    roomExistsButNotInMemory,
    isOnline: state.app.isNetworkOnline
  }
}

const handleFormSubmit = (payload, resolve, reject, dispatch) => {
  const { identityEmail, identityDisplayName, contact } = payload

  if (identityEmail === contact) {
    reject()
    return
  }
  // const { identities } = this.props;
  if (payload.skip) {
    resolve()
    return
  }

  if (payload.setupRoom) {
    dispatch(ChatActions.chatSetupExistingRoomRequest(payload.roomId, identityEmail, identityDisplayName, contact))
    resolve()
    return
  }

  dispatch(ChatActions.chatCreateRoomRequest(identityEmail, identityDisplayName, contact, false))
  resolve()
}

const mapDispatchToProps = {
  createItemRequest: handleFormSubmit,
  editItemRequest: handleFormSubmit,
  displayNotification: NotificationActions.displayNotification,
  clearContactSearchData: ContactActions.contactClearSearchData,
  emailConfirmationRequest: UserActions.emailConfirmationRequest,
  canMemberChat: ChatActions.canMemberChatRequest,
  toggleContactMsgsafeUsersFilter: ContactActions.toggleContactMsgsafeUsersFilter,
  clearContactMsgsafeUsersFilter: ContactActions.clearContactMsgsafeUsersFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlChatCreateRoomForm)
