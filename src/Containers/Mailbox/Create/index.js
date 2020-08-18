import React, { Component } from 'react'
import { View, Alert, Platform, AlertIOS } from 'react-native'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import EStyleSheet from 'react-native-extended-stylesheet'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import ImagePicker from 'react-native-image-picker'
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import PropTypes from 'prop-types'
import { path, isNil, isEmpty, without, findIndex } from 'ramda'
import uuidv1 from 'uuid/v1'
import Immutable from 'seamless-immutable'
import mime from 'react-native-mime-types'
import Permissions from 'react-native-permissions'
import OpenSettings from 'react-native-open-settings'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'

import ContactActions from 'commons/Redux/ContactRedux'
import MailboxActions from 'commons/Redux/MailboxRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'
import UserActions from 'commons/Redux/UserRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { NavigationActions } from 'react-navigation'
import { getDataItemForId, getDataItemForIdWithCacheFirst } from 'commons/Redux/_Utils'

import { promptIfDirty } from 'app/Navigation/utils'
import Text from 'app/Components/BaseText'
import ContactListItem from 'app/Components/ContactListItem'
import EditItemView from 'app/Components/EditView'
import LiteTextInput from 'app/Components/Form/LiteTextInput'
import ForeignItemSelectionInput from 'app/Components/Form/ForeignItemSelectionInput'
import FormCheckbox from 'app/Components/Form/FormCheckbox'
import HeaderButton from 'app/Components/HeaderButton'
import { createValidator, required, email, i18nize } from 'commons/Lib/Validators'
import { makeReplyBody, makeForwardBody, makeForwardAttachments } from 'app/Lib/Mail'
import palette from 'app/Styles/colors'
import { pickDeviceContactEmailAddress } from 'app/Containers/Contacts/DeviceContactDetail/utils'

import AttachmentTools, { ATTACHMENT_TOOLS_HEIGHT } from './components/AttachmentTools'
import AttachmentList from './components/AttachmentList'
import ContactSearchClean from './components/ContactSearchClean'
import ContactAutocompleteOrSelection from './components/ContactAutocompleteOrSelection'
import { base64ToFilesize } from 'commons/Lib/Utils'

export const FORM_IDENTIFIER = 'mailboxCompose'
export const FILE_UPLOAD_LIMIT_IN_MB = 10
// const EncryptionDefaultState = {
//   DISABLED: 1,
//   ON: 2,
//   OFF: 3
// }

const s = EStyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  attachKeyContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 11.2,
    borderBottomColor: '#ECF0F1',
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF'
  },
  textStyle: {
    fontSize: 14.4,
    color: '#7f8c8d',
    paddingTop: 3,
    flex: 1
  },
  checkBoxStyle: {
    marginBottom: 0,
    flex: 1
  }
})

class MailboxCompose extends Component {
  static propTypes = {
    change: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      contactDisabled: false,
      identityDisabled: false,
      editItemData: null,
      isKeyboardOpen: false,
      keyboardHeight: 0,
      files: Immutable([]),
      bodyFocused: null,
      gpgState: false,
      smimeState: false
    }

    this._bodyFocusChanged = this._bodyFocusChanged.bind(this)
    this.formValuesToPayload = this.formValuesToPayload.bind(this)
    this._setEditItemData = this._setEditItemData.bind(this)
    this._selectIdentity = this._selectIdentity.bind(this)
    this._selectContact = this._selectContact.bind(this)
    this._appendSignature = this._appendSignature.bind(this)
    this._autoSelectFrom = this._autoSelectFrom.bind(this)
    this._setBodyRef = this._setBodyRef.bind(this)
    this._updateNavigationDirtyFrom = this._updateNavigationDirtyFrom.bind(this)
    this._handleKeyboardToggle = this._handleKeyboardToggle.bind(this)
    this._handleFileAttachmentPress = this._handleFileAttachmentPress.bind(this)
    this._handleFileAttachment = this._handleFileAttachment.bind(this)
    this._handleImageAttachmentPress = this._handleImageAttachmentPress.bind(this)
    this._handleImageAttachment = this._handleImageAttachment.bind(this)
    this._addAttachment = this._addAttachment.bind(this)
    this._removeAttachment = this._removeAttachment.bind(this)
    this._updateAttachment = this._updateAttachment.bind(this)
    this._handleAttachmentProgress = this._handleAttachmentProgress.bind(this)
    this._onGPGCheckBoxChange = this._onGPGCheckBoxChange.bind(this)
    this._onSMIMECheckBoxChange = this._onSMIMECheckBoxChange.bind(this)
    this._getAttachmentsFileSizeInMB = this._getAttachmentsFileSizeInMB.bind(this)
  }

  _setBodyRef (elm) {
    this.emailBodyRef = elm
  }

  _bodyFocusChanged (key) {
    if (key['isFocused']) {
      this.editScrollView.scrollTo({ y: 250, animated: true })
      // const RCTUIManager = require('NativeModules').UIManager
      // const screenHeight = Dimensions.get('window').height
      // setTimeout(() => {
      //   RCTUIManager.measure(this.editScrollView.getInnerViewNode(), (...data) => {
      //     console.log('RCTUIManager.measure', data, screenHeight)
      //     this.editScrollView.scrollTo({ y: data[3] - screenHeight, animated: true })
      //   })
      // }, 100)
      // this.editScrollView.scrollTo({x: 0, y: 0, animated: true})
    }
    this.setState({ bodyFocused: key['isFocused'] })
  }

  formValuesToPayload (values) {
    return {
      identity_id: values.identity.id,
      msg_subject: values.msg_subject,
      msg_body: values.msg_body.replace(/\n/g, '<br />'), // replace line breaking with html markup
      msg_files: this.state.files.map(file => ({
        data: file.data,
        name: file.name,
        type: file.type
      })),
      attach_pgp: this.state.gpgState,
      attach_smime: this.state.smimeState,
      disable_pgp: true,
      disable_smime: true,
      save_webmail: true, // Set true for keeping it in Sent inbox
      // Use email property (if it's contact object), else use email string
      msg_to: values.recipient.email || values.recipient
    }
  }

  /**
   * Using state to keep the copy of editItemData since
   * calling this.props.change or this.props.autofill
   * dispatches the actions too early, before the form has
   * even been initialised – causing no change in identity name
   *
   * @private
   */
  _setEditItemData (props) {
    const { replyData, forwardData, recipient, selectedIdentity } = props || this.props

    let editItemData = {}
    let contactDisabled = false
    let identityDisabled = false

    if (recipient) {
      contactDisabled = true
      editItemData.recipient = {
        id: recipient.id,
        display_name: recipient.display_name,
        email: recipient.email
      }
    }

    let signature = ''

    if ((forwardData || replyData) && selectedIdentity) {
      editItemData.identity = selectedIdentity

      if (selectedIdentity.include_signature_reply) {
        signature = selectedIdentity.email_signature
      }
    }

    let files = this.state.files
    if (forwardData) {
      editItemData['msg_subject'] = `Fwd: ${forwardData.msg_subject ? forwardData.msg_subject : ''}`
      editItemData['msg_body'] = makeForwardBody(forwardData, signature)
      files = makeForwardAttachments(forwardData)
    }

    if (replyData) {
      contactDisabled = true
      editItemData['recipient'] = {
        id: replyData.contact_id,
        display_name: replyData.msg_from_name || replyData.msg_from_displayname,
        email: replyData.msg_from
      }
      editItemData['msg_subject'] = `Re: ${replyData.msg_subject ? replyData.msg_subject : ''}`
      editItemData['msg_body'] = makeReplyBody(replyData, signature)
    }

    this.setState({
      editItemData,
      contactDisabled,
      identityDisabled,
      files
    })
  }

  /**
   * Custom item selection callback that passes the identity_id
   * to RouterActions.selectContactForMailbox to filter only for
   * selected identity.
   *
   * Used below for ForeignItemSelectionInput
   *
   * @param params
   * @private
   */
  _selectContact (params) {
    this.props.navigation.navigate('ContactSelection', {
      ...params,
      disableSwipe: true,
      tabBarVisible: false,
      listItemComponent: ContactListItem,
      subselectComponent: ContactSearchClean,
      headerLeftProps: { isBack: true }
    })
  }

  _selectIdentity (params) {
    this.props.navigation.navigate('IdentitySelection', {
      ...params,
      headerLeftProps: { isBack: true }
    })
  }

  _appendSignature (nextProps = {}) {
    // append the signature of the identity when selected for the
    // first time
    if (!this.props.selectedIdentity && nextProps.selectedIdentity) {
      const { include_signature_compose: signatureOnCompose } = nextProps.selectedIdentity
      if (this.props.replyData || this.props.forwardData || !signatureOnCompose) return
    } else {
      return
    }

    const msgBody = nextProps.msgBody || ''
    const signature = nextProps.selectedIdentity.email_signature
    if (typeof nextProps.change === 'function') {
      nextProps.change('msg_body', `${msgBody} \n\r\r\r${signature}`)
    }
  }

  _autoSelectFrom (nextProps) {
    if (!nextProps || !nextProps.selectedRecipient) return
    const { selectedRecipient } = nextProps
    if (this.props.selectedRecipient !== selectedRecipient && selectedRecipient.email) {
      const resolve = (contact) => {
        if (!contact || contact.is_deleted) return
        this.props.change('identity', contact.identities[0])
      }
      this.props.contactGetFullObject(selectedRecipient.email, resolve)
    }
  }

  componentDidMount () {
    const { navigation, dirty } = this.props
    if (!navigation.state.params || navigation.state.params.dirty === undefined) {
      setTimeout(() => {
        navigation.setParams({ dirty })
      }, 0)
    }
  }

  _updateNavigationDirtyFrom (nextProps) {
    const { navigation, dirty } = nextProps
    if (navigation.state.params && navigation.state.params.dirty !== undefined && navigation.state.params.dirty !== dirty) {
      setTimeout(() => {
        navigation.setParams({ dirty })
      }, 0)
    }
  }

  _handleKeyboardToggle (isKeyboardOpen, keyboardHeight) {
    if (isKeyboardOpen) {
      setTimeout(() => this.setState({ isKeyboardOpen, keyboardHeight }), 500)
    } else {
      this.setState({ isKeyboardOpen, keyboardHeight: 0 })
    }
  }

  _handleFileAttachmentPress () {
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles()]
    }, (err, res) => {
      if (err) {
        console.info('Error attaching a file', err)
        return
      }
      this._handleFileAttachment(res)
    })
  }

  async _handleFileAttachment (response) {
    const { displayNotification, intl } = this.props
    const file = {
      id: uuidv1(),
      name: response.fileName,
      type: mime.lookup(response.fileName),
      data: null,
      progress: 0
    }
    try {
      // android gets a DocumentProviders URI. E.g. "content://one/two/three" (it is not an absolute path)
      // https://github.com/Elyx0/react-native-document-picker/issues/70#issuecomment-338972278
      // https://github.com/Elyx0/react-native-document-picker/issues/70#issuecomment-384335402
      // For android, we can upload files using this URI with a properly formatted FormData object as a
      // part of a multipart/form-data fetch. So we need not do anything
      // For ios, we need not do anything as an absolute path is returned

      this._addAttachment(file)

      const data = await RNFS.readFile(decodeURI(response.uri), 'base64')
      this._updateAttachment({ ...file, progress: 100, data })
      const totalFilesize = this._getAttachmentsFileSizeInMB()
      if (totalFilesize > FILE_UPLOAD_LIMIT_IN_MB) {
        Alert.alert(`File size exceeds ${FILE_UPLOAD_LIMIT_IN_MB}MB`, intl.formatMessage(m.native.Mailbox.attachmentsSizeExceedsAllowedLimit, { limitInMB: FILE_UPLOAD_LIMIT_IN_MB }), [
          { text: intl.formatMessage(m.app.Common.ok), onPress: () => this._removeAttachment(file.id) }
        ])
      }
    } catch (err) {
      displayNotification(intl.formatMessage(m.native.Mailbox.couldNotAttachFile, { filename: response.fileName }), 'danger', 3000)
      this._removeAttachment(file.id)
      console.log('Error attaching a file', err)
    }
  }

  _getAttachmentsFileSizeInMB () {
    const fileSizeSumInMB = this.state.files.reduce((total, file) => total + (file.data ? base64ToFilesize(file.data) : 0), 0) / (1024 * 1024)
    return fileSizeSumInMB.toFixed(1)
  }

  _showPhotoPermissionModal () {
    AlertIOS.alert(
      '"MsgSafe.io" does not have access to your photos',
      'Please update your device settings and allow MsgSafe.io to access your photos',
      [
        { text: 'Cancel' },
        { text: 'Settings', onPress: () => OpenSettings.openSettings(), style: 'cancel' }
      ]
    )
  }

  async _handleImageAttachmentPress () {
    const r = await Permissions.request('photo')

    if (r !== 'authorized') {
      this._showPhotoPermissionModal()
      return
    }

    ImagePicker.showImagePicker({
      noData: true,
      mediaType: 'photo'
    }, this._handleImageAttachment)
  }

  async _handleImageAttachment (response) {
    if (response.didCancel) {
      return
    }

    const { displayNotification, intl } = this.props

    // in case the user takes a live photo, give it a generic filename
    response.fileName = response.fileName || 'Photo.jpg'

    const file = {
      id: uuidv1(),
      name: response.fileName,
      type: mime.lookup(response.fileName),
      data: null,
      progress: 0
    }
    try {
      // android gets a content uri. E.g. "content://one/two/three.jpg"
      // we need to convert it to actual file path, and below method
      // does that for android. And returns the passed argument back
      // for ios
      if (Platform.OS === 'android') {
        response.uri = response.path
      }

      this._addAttachment(file)

      const data = await RNFS.readFile(response.uri, 'base64')
      this._updateAttachment({ ...file, progress: 100, data })
      const totalFilesize = this._getAttachmentsFileSizeInMB()
      if (totalFilesize > FILE_UPLOAD_LIMIT_IN_MB) {
        Alert.alert(`File size exceeds ${FILE_UPLOAD_LIMIT_IN_MB}MB`, intl.formatMessage(m.native.Mailbox.attachmentsSizeExceedsAllowedLimit, { limitInMB: FILE_UPLOAD_LIMIT_IN_MB }), [
          { text: intl.formatMessage(m.app.Common.ok), onPress: () => this._removeAttachment(file.id) }
        ])
      }
    } catch (err) {
      displayNotification(intl.formatMessage(m.native.Mailbox.couldNotAttachImage, { filename: response.fileName }), 'danger', 3000)
      this._removeAttachment(file.id)
      console.error('Error attaching an image', err)
    }
  }

  _addAttachment (file) {
    const files = this.state.files
    // check if the file is already attached
    const attached = files.find(f => f.id === file.id)
    if (attached) {
      return
    }
    this.setState({ files: files.concat([file]) })
  }

  _removeAttachment (id) {
    const files = this.state.files
    const file = files.find(f => f.id === id)
    if (!file) {
      return
    }
    this.setState({ files: Immutable(without([file], files)) })
  }

  _updateAttachment (file) {
    const files = this.state.files
    const index = findIndex(f => f.id === file.id)(files)
    const oldFile = files[index]
    this.setState({ files: files.set(index, oldFile.merge(file)) })
  }

  _handleAttachmentProgress (file) {
    // const { chatMessageModified } = this.props
    const updateAttachment = this._updateAttachment
    return function (event) {
      if (event.percent) {
        updateAttachment({ ...file, progress: event.percent / 100 })
      }
    }
  }

  _renderAttachmentTools () {
    const { isKeyboardOpen, keyboardHeight, bodyFocused } = this.state
    if (
      !isKeyboardOpen ||
      !bodyFocused
    ) {
      return null
    }
    return (
      <AttachmentTools
        keyboardHeight={keyboardHeight}
        onFilePress={this._handleFileAttachmentPress}
        onImagePress={this._handleImageAttachmentPress}
      />
    )
  }

  componentWillMount () {
    const { replyData, forwardData, selectedIdentity, getIdentity, sumESP, hasConfirmedESP } = this.props

    // If it's reply or forward instance and identity isn't present
    // then get the identity
    if ((replyData || forwardData) && !selectedIdentity) {
      const identityEmail = (replyData || forwardData).msg_to
      getIdentity({ search: { identity_email: identityEmail }, limit: 1 })
    }

    this._setEditItemData()

    if (!sumESP || !hasConfirmedESP) {
      const that = this
      const { refreshProfile } = this.props
      if (!refreshProfile) return
      refreshProfile({}, () => {
        setTimeout(() => {
          that._checkHasValidESP()
        }, 100)
      })
    }
  }

  _checkHasValidESP () {
    const { navigation, allESPs, intl } = this.props
    const fm = intl.formatMessage
    if (!this.props.sumESP) {
      const backAndESPCreate = () => navigation.dispatch(NavigationActions.navigate({
        routeName: 'CreateForwardAddress'
      }))

      Alert.alert(fm(m.native.Mailbox.noLinkedEmail), fm(m.native.Mailbox.addEmailAddressMessage), [
        { text: fm(m.native.Mailbox.dismiss), onPress: navigation.goBack },
        { text: fm(m.native.Mailbox.addEmailAddress), onPress: backAndESPCreate }
      ])
    } else if (!this.props.hasConfirmedESP) {
      const backAndESPDetail = () => navigation.dispatch(NavigationActions.navigate({
        routeName: 'ForwardAddressDetail',
        params: { detail: allESPs[0], noEdit: true }
      }))

      Alert.alert(fm(m.native.Mailbox.emailNotConfirmed), fm(m.native.Mailbox.confirmEmailAddressMessage), [
        { text: fm(m.native.Mailbox.dismiss), onPress: navigation.goBack },
        { text: fm(m.native.Mailbox.resend), onPress: backAndESPDetail }
      ])
    }
  }

  _onGPGCheckBoxChange () {
    this.setState({ gpgState: !this.state.gpgState })
  }
  _onSMIMECheckBoxChange () {
    this.setState({ smimeState: !this.state.smimeState })
  }

  componentWillReceiveProps (nextProps) {
    if ((this.props.replyData || this.props.forwardData) && !this.props.selectedIdentity && nextProps.selectedIdentity) {
      this.setState({
        editItemData: {
          ...this.state.editItemData,
          identity: nextProps.selectedIdentity
        }
      })

      this._setEditItemData(nextProps)
    }

    this._appendSignature(nextProps)
    this._autoSelectFrom(nextProps)
    this._updateNavigationDirtyFrom(nextProps)
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <View style={s.container}>
        <EditItemView
          createSuccessMessage={fm(m.native.Mailbox.sendingEmail)}
          editSuccessMessage={fm(m.native.Mailbox.sendingEmail)}
          formValuesToPayload={this.formValuesToPayload}
          rightTitle={fm(m.native.Mailbox.send)}
          style={{ backgroundColor: palette.white }}
          {...this.props}
          editItemData={this.state.editItemData}
          keyboardTopSpacing={ATTACHMENT_TOOLS_HEIGHT}
          onKeyboardToggle={this._handleKeyboardToggle}
          scrollViewProps={{
            keyboardShouldPersistTaps: 'always',
            keyboardDismissMode: 'interactive',
            ref: r => { this.editScrollView = r } // TODO: Somehow this is needed but ocasionally occurs unexpected error.
            // onContentSizeChange: () => this.editScrollView.scrollToEnd()
          }}
        >
          <Field
            name='recipient'
            component={ContactAutocompleteOrSelection}
            disableSelection={this.state.contactDisabled}
            goToItemSelectionView={this._selectContact}
            textInputProps={{
              label: fm(m.native.Mailbox.to),
              returnKeyType: 'next',
              keyboardType: 'email-address',
              autoCorrect: false,
              autoCapitalize: 'none',
              placeholder: 'john.doe@example.com',
              labelButtonText: <FAIcon name='plus-circle' size={20} />
            }}
            foreignItemSelectionInputProps={{
              linkText: fm(m.native.Mailbox.selectContact),
              initialMessage: fm(m.native.Mailbox.selectTo),
              selectedMessage: fm(m.native.Mailbox.to),
              labelButtonText: fm(m.native.Mailbox.manual),
              renderSelectedValue: value => {
                if (isNil(value) || isEmpty(value)) return
                return value.display_name === value.email ? value.display_name : `${value.display_name} <${value.email}>`
              }
            }}
            transformData={pickDeviceContactEmailAddress}
          />

          <Field
            name='identity'
            type='select'
            component={ForeignItemSelectionInput}
            // Disable identity selection/changes if in editing mode
            disableSelection={this.state.identityDisabled}
            goToItemSelectionView={this._selectIdentity}
            linkText={fm(m.native.Mailbox.selectMailbox)}
            initialMessage={fm(m.native.Mailbox.from)}
            selectedMessage={fm(m.native.Mailbox.from)}
            renderSelectedValue={value => {
              if (isNil(value) || isEmpty(value)) return
              return value.display_name === value.email ? value.display_name : `${value.display_name} <${value.email}>`
            }}
          />
          <Field
            name='msg_subject'
            component={LiteTextInput}
            placeholder={fm(m.native.Mailbox.subject)}
            returnKeyType='next'
            blurOnSubmit
          />
          <AttachmentList
            data={this.state.files}
            onItemRemove={this._removeAttachment}
          />
          <View style={s.attachKeyContainer}>
            <Text style={s.textStyle}>{fm(m.native.Mailbox.attachPublicKeyLabel)}</Text>
            <Field
              name='attach_pgp'
              label='GPG'
              isChecked={this.state.gpgState}
              onClick={this._onGPGCheckBoxChange}
              component={FormCheckbox}
            />
            <Field
              name='attach_smime'
              label='S/MIME'
              component={FormCheckbox}
              isChecked={this.state.smimeState}
              onClick={this._onSMIMECheckBoxChange}
            />
          </View>

          <Field
            name='msg_body'
            component={LiteTextInput}
            placeholder={fm(m.native.Mailbox.composeBodyFieldPlaceholder)}
            multiline
            multilineLarge
            noBottomBorder
            selectTextOnFocus={false}
            focusChanged={this._bodyFocusChanged}
            setRef={this._setBodyRef}
          />
        </EditItemView>
        {this._renderAttachmentTools()}
      </View>
    )
  }
}

const mailboxComposeFormValidator = createValidator({
  identity: [i18nize(required, m.native.Mailbox.from)],
  msg_subject: [i18nize(required, m.native.Mailbox.subjectIsRequired)],
  msg_body: [i18nize(required, m.native.Mailbox.bodyIsRequired)],
  recipient: [value => {
    if (!isNil(value) && isNil(value.id) && isNil(value.email)) {
      return email()(value)
    }
  }, i18nize(required, m.native.Mailbox.typeEmailAddress)]
})

const MailboxComposeForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: mailboxComposeFormValidator,
  touchOnBlur: false
})(MailboxCompose)

const IntlMailboxComposeForm = injectIntl(MailboxComposeForm)

IntlMailboxComposeForm.navigationOptions = ({ navigation, screenProps }) => {
  return {
    ...EditItemView.navigationOptions({ navigation, screenProps }),
    title: screenProps && screenProps.fm(m.native.Mailbox.compose),
    headerLeft: <HeaderButton title={screenProps.fm(m.app.Common.cancel)} onPress={promptIfDirty(navigation, screenProps.fm)} />
  }
}

const mapStateToProps = (state, ownProps) => {
  const { mailboxReplyId, mailboxForwardId, recipientEmail } = path(['navigation', 'state', 'params'], ownProps) || {}

  const props = {
    // Pluck out values for selected identity and recipient ids
    // for the current form from redux store
    selectedIdentity: path(['form', 'mailboxCompose', 'values', 'identity'], state),
    selectedRecipient: path(['form', 'mailboxCompose', 'values', 'recipient'], state),
    msgBody: path(['form', 'mailboxCompose', 'values', 'msg_body'], state),

    // Reply/Forward data if mailboxReplyId or mailboxForwardId has been
    // passed using router
    replyData: mailboxReplyId && (state.mailbox.data[mailboxReplyId] || state.mailbox.searchResultsData[mailboxReplyId]),
    forwardData: mailboxForwardId && (state.mailbox.data[mailboxForwardId] || state.mailbox.searchResultsData[mailboxForwardId]),

    hasConfirmedESP: path(['user', 'data', 'has_confirmed_esp'], state),
    sumESP: path(['user', 'data', 'sum_esp'], state)
  }

  // let gpgState = EncryptionDefaultState.DISABLED
  // let smimeState = EncryptionDefaultState.DISABLED

  if ((props.replyData || props.forwardData) && !props.selectedIdentity) {
    const mailData = (props.replyData || props.forwardData)
    props.selectedIdentity = getDataItemForId(state.identity, mailData.identity_id, mailData.msg_to)
  }

  if (recipientEmail) {
    props.recipient = getDataItemForIdWithCacheFirst(state.contact, recipientEmail) || { email: recipientEmail, display_name: '', id: recipientEmail }
  }

  if (props.sumESP && !props.hasConfirmedESP) {
    props.allESPs = path(['user', 'data', 'all_esp'], state)
  }

  return props
}

const mapDispatchToProps = {
  refreshProfile: UserActions.refreshProfileRequest,
  createItemRequest: MailboxActions.sendMailRequest,
  editItemRequest: MailboxActions.sendMailRequest,
  displayNotification: NotificationActions.displayNotification,
  emailConfirmationRequest: UserActions.emailConfirmationRequest,
  getIdentity: IdentityActions.identityGetFromCacheOrRequest,
  contactGetFullObject: ContactActions.contactGetFullObject
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlMailboxComposeForm)
