import React, { Component } from 'react'
import { View, Alert, AlertIOS } from 'react-native'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { path } from 'ramda'
import emojiFlags from 'emoji-flags'
import { NavigationActions, StackActions } from 'react-navigation'
import { isEmail } from 'validator'
import debounce from 'lodash.debounce'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import { promptIfDirty } from 'app/Navigation/utils'
import EditItemView from 'app/Components/EditView'
import FormTextInput from 'app/Components/Form/FormTextInput'
import Picker from 'app/Components/Form/Picker'
import { FormSectionTitle } from 'app/Components/Form/Common'
import SwitchInput from 'app/Components/Form/SwitchInput'
import Text from 'app/Components/BaseText'
import HeaderButton from 'app/Components/HeaderButton'
import commonStyles from 'app/Styles/common'
import BatchUpdateProgress from '../Mailbox/List/components/BatchUpdateProgress'

import { getDataItemForId } from 'commons/Redux/_Utils'
import { createValidator, required, fieldRequired, minLength, emailUsername, i18nize } from 'commons/Lib/Validators'
import IdentityActions from 'commons/Redux/IdentityRedux'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import UserActions from 'commons/Redux/UserRedux'
import DomainActions from 'commons/Redux/DomainRedux'
import { extractRegionListFromUser } from 'commons/Selectors/Region'
import { extractUserEmailData } from 'commons/Selectors/UserEmail'
import { extractOrderedDomainData } from 'commons/Selectors/Domain'
import { ITEM_UPDATE_TYPES } from 'commons/Lib/Redux/CRUD'

const asyncValidateIdentity = (values, dispatch, props) => {
  // Dispatch the request along with resolve & reject
  // and the saga will take care of using the one appropriately

  const { emailUsername, domain } = values

  if (emailUsername && domain && props.isOnline) {
    const identityEmail = `${emailUsername}@${domain}`
    if (isEmail(identityEmail)) {
      return new Promise((resolve, reject) => props.emailCheckForIdentity(identityEmail, resolve, ({ email }) => reject({ emailUsername: email })))
    }
  }

  return Promise.resolve()
}

class EditIdentity extends Component {
  constructor (props) {
    super(props)

    this._formValuesToPayload = this._formValuesToPayload.bind(this)

    this._focusDomain = this._setFocus.bind(this, 'domain')
    this._focusEmailUsername = this._setFocus.bind(this, 'emailUsername')
    this._focusRegion = this._setFocus.bind(this, 'region')
    this._clearFocus = this._setFocus.bind(this, null)

    this._deleteIdentity = this._deleteIdentity.bind(this)
    this._confirmDeletion = this._confirmDeletion.bind(this)
    this._updateNavigationDirtyFrom = this._updateNavigationDirtyFrom.bind(this)

    this.state = {
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
    const p = {
      auto_create_contact: values.auto_create_contact,
      can_receive_invite: values.can_receive_invite,
      country_flag_emoji: values.country_flag_emoji,
      display_name: values.display_name.trim(),
      email_signature: values.email_signature,
      // encrypt_contact_email_pgp: values.encrypt_contact_email_pgp,
      // encrypt_contact_email_smime: values.encrypt_contact_email_smime,
      encrypt_esp_pgp: values.encrypt_esp_pgp,
      encrypt_esp_smime: values.encrypt_esp_smime,
      http_pickup: values.http_pickup,
      http_pickup_send_inbound_notification: values.http_pickup_send_inbound_notification,
      http_pickup_sent: values.http_pickup_sent,
      include_signature_compose: values.include_signature_compose,
      include_signature_reply: values.include_signature_reply,
      next_hop_exit: values.next_hop_exit,
      region: values.region,
      strip_html: values.strip_html,
      two_factor_send: values.two_factor_send,
      // two_factor_verify_pgp: values.two_factor_verify_pgp,
      // two_factor_verify_smime: values.two_factor_verify_smime,
      useremail_id: values.useremail_id
    }

    // API barfs on null (reqparser is int)
    if (!p.useremail_id) {
      delete p.useremail_id
    }

    if (p.http_pickup) {
      p.next_hop_exit = false
    }

    if (!this._isEditing() && values.emailUsername && values.domain) {
      p.email = `${values.emailUsername}@${values.domain}`
    }

    return p
  }

  _getFullRegionData (regions) {
    if (!regions) return []
    return regions.map((region) => {
      const data = emojiFlags.countryCode(region)
      return {
        value: region,
        title: `${data.emoji} ${data.name}`
      }
    })
  }

  _getUserEmailData (userEmails) {
    if (!userEmails || !userEmails.data) return []
    return userEmails.data.map(d => ({
      title: d.name === d.label ? d.name : `${d.name} – ${d.label}`,
      value: d.value
    }))
  }

  _getDomainData (domains) {
    if (!domains || !domains.data) return []
    return domains.data.map(d => ({
      title: d.label,
      value: d.value
    }))
  }

  _goToList () {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'IdentityList' })]
    }))
  }

  _getFullEmailMessage () {
    const { selectedIdentityEmailUsername, selectedDomain, intl, asyncValidating } = this.props

    if (!selectedDomain || !selectedIdentityEmailUsername || asyncValidating) return
    const fm = intl.formatMessage
    return fm(m.native.Contact.getFullEmailMessage, { selectedIdentityEmailUsername, selectedDomain })
  }

  _deleteIdentity (delete_mail_history = false) {
    const {
      editItemData: data,
      deleteIdentityRequest,
      displayNotification,
      intl
    } = this.props
    const fm = intl.formatMessage
    const payload = {
      id: data.id,
      delete_mail_history
    }
    deleteIdentityRequest(
      payload,
      () => {
        displayNotification(fm(m.native.Contact.identityDeleted), 'danger', 3000)
        this._goToList()
      },
      () => displayNotification(fm(m.native.Contact.couldNotDeleteIdentity), 'danger', 3000)
    )
  }

  _confirmDeletion () {
    const {
      editItemData: data,
      displayNotification,
      intl
    } = this.props
    const fm = intl.formatMessage

    const checkEmail = email => (email === data.email
      ? this._choosePreserveEmailsOrNot()
      : displayNotification(fm(m.native.Contact.noSameAsIdentity), 'info', 3000))

    AlertIOS.prompt(
      fm(m.native.Contact.noSameAsIdentity),
      fm(m.native.Contact.identityRemovingConfirm, { email: data.email, display_name: data.display_name }),
      [
        { text: fm(m.app.Common.next), onPress: checkEmail },
        { text: fm(m.app.Common.cancel), onPress: () => displayNotification(fm(m.native.Contact.identityNotDeleted), 'info', 3000) }
      ]
    )
  }

  _choosePreserveEmailsOrNot () {
    const {
      editItemData: data,
      displayNotification,
      intl
    } = this.props
    const fm = intl.formatMessage
    Alert.alert(
      fm(m.native.Contact.deleteIdentity),
      fm(m.native.Contact.deleteLinkedEmails, { display_name: data.display_name }),
      [
        { text: fm(m.native.Contact.deleteAllEmails), onPress: () => this._deleteIdentity(true) },
        { text: fm(m.native.Contact.saveAllEmails), onPress: () => this._deleteIdentity() },
        { text: fm(m.app.Common.cancel), onPress: () => displayNotification(fm(m.native.Contact.identityNotDeleted), 'info', 3000) }
      ]
    )
  }

  componentWillMount () {
    const { navigation, dirty } = this.props
    navigation.setParams({ dirty })
  }

  _updateNavigationDirtyFrom (nextProps) {
    const { navigation, dirty } = nextProps
    if (navigation.state.params && navigation.state.params.dirty !== undefined && navigation.state.params.dirty !== dirty) {
      setTimeout(() => {
        navigation.setParams({ dirty })
      }, 0)
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

  _isEditing () {
    return !!this.props.editItemData
  }

  componentWillReceiveProps (nextProps) {
    this._updateNavigationDirtyFrom(nextProps)
    this._updateCancelButtonDisabledState(nextProps)
  }

  componentDidMount () {
    const { domainSetIsActiveFilter, useremailSetIsConfirmedFilter } = this.props
    domainSetIsActiveFilter()
    useremailSetIsConfirmedFilter()
  }

  componentWillUnmount () {
    this.props.clearUserEmailSearchResultsData()
    this.props.useremailClearIsConfirmedFilter()
    this.props.clearDomainSearchResultsData()
    this.props.domainClearIsActiveFilter()
  }

  render () {
    const {
      userEmails,
      http_pickup,
      include_signature_compose,
      include_signature_reply,
      useremail_id,
      intl,
      submitting,
      editItemData,
      navigation
    } = this.props
    const fm = intl.formatMessage
    let currentAllowEmailTitle = fm(m.native.Contact.allowAnyoneToMailMe)
    if (this.props.auto_create_contact === false) {
      currentAllowEmailTitle = fm(m.native.Contact.onlyAssociated)
    }

    const isEditing = this._isEditing()
    const isCurrentActionInProgress = !!editItemData && editItemData.actionTypeInProgress === ITEM_UPDATE_TYPES.REMOVE
    const formSubmitting = path(['state', 'params', 'submitting'], navigation)
    const showSpinner = isCurrentActionInProgress || formSubmitting || submitting

    return (
      <View style={{ flex: 1 }}>
        <EditItemView
          editSuccessMessage={fm(m.native.Contact.identitySaved)}
          formValuesToPayload={this._formValuesToPayload}
          disableSubmit={showSpinner}
          {...this.props}
        >
          <FormSectionTitle text={fm(m.native.Contact.identityProfile)} />

          <Field
            name='display_name'
            component={FormTextInput}
            label={fm(m.app.Common.name)}
            returnKeyType='next'
            props={this._focusProp('display_name')}
            onSubmitEditing={isEditing ? this._focusRegion : this._focusDomain}
            blurOnSubmit
          />

          { isEditing ? (
            <Field
              name='email'
              component={FormTextInput}
              label={fm(m.app.Common.email)}
              returnKeyType='next'
              editable={false}
              blurOnSubmit
            />
          ) : (
            <View>
              <Field
                name='domain'
                component={Picker}
                title='Domain'
                initialMessage={fm(m.native.Contact.internetDomain)}
                linkText={fm(m.app.Common.email)}
                returnKeyType='next'
                options={this._getDomainData(this.props.domains)}
                props={this._focusProp('domain')}
                onSubmitEditing={this._focusEmailUsername}
              />

              <Field
                name='emailUsername'
                component={FormTextInput}
                label={fm(m.native.Contact.identityEmail)}
                returnKeyType='next'
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                successMessage={this._getFullEmailMessage()}
                normalize={value => value && value.replace(/[^a-zA-Z0-9\.]/g, '')}
                props={this._focusProp('emailUsername')}
                onSubmitEditing={this._focusRegion}
                blurOnSubmit
              />
            </View>
          )}

          <Field
            name='region'
            component={Picker}
            title={fm(m.native.Contact.selectRegion)}
            initialMessage={fm(m.native.Contact.emailSent)}
            linkText={fm(m.native.Contact.selectRegion)}
            returnKeyType='next'
            options={this._getFullRegionData(this.props.regions)}
            props={this._focusProp('region')}
            onSubmitEditing={this._clearFocus}
          />

          <Field
            name='can_receive_invite'
            component={SwitchInput}
            smallLabel={fm(m.native.Contact.onlineStatus)}
            onHelpText={fm(m.native.Contact.available)}
            offHelpText={fm(m.native.Contact.invisible)}
            values={[false, true]}
          />
          <FormSectionTitle text={fm(m.native.Contact.delivery)} />

          <Field
            name='auto_create_contact'
            component={SwitchInput}
            smallLabel={currentAllowEmailTitle}
            values={[false, true]}
          />

          <Field
            name='strip_html'
            component={SwitchInput}
            smallLabel={fm(m.native.Contact.convertToPlainText)}
            values={[false, true]}
          />

          <Field
            name='http_pickup'
            component={SwitchInput}
            label={fm(m.native.Contact.forwardEmail)}
            values={[true, false]}
            disabled={!userEmails.data.length}
          />

          {/* disabled for now
          <Field
            name='next_hop_exit'
            component={SwitchInput}
            smallLabel='Forward email I receive to my linked email address'
            values={[false, true]}
          />
          */}

          {/*
            http_pickup && !!userEmails.data.length &&
            <Field
              name='http_pickup_send_inbound_notification'
              component={SwitchInput}
              label='Send notifications to linked address'
              onHelpText='Notifications will be sent'
              offHelpText='Notifications off'
              values={[false, true]}
            />
            */
          }

          {
            (!http_pickup && !!userEmails.data.length)
              ? <Field
                name='useremail_id'
                component={Picker}
                title={fm(m.native.Contact.forwardTo)}
                initialMessage={fm(m.native.Contact.emailForwardedTo)}
                linkText={fm(m.native.Contact.selectLinkedEmail)}
                returnKeyType='next'
                options={this._getUserEmailData(this.props.userEmails)}
                disabled={!userEmails.data.length}
              /> : null
          }
          {
            (!http_pickup && !!userEmails.data.length && useremail_id)
              ? <FormSectionTitle text={fm(m.native.Contact.forwardingOptions)} /> : null
          }

          {
            (!http_pickup && !!userEmails.data.length && useremail_id)
              ? <Field
                name='country_flag_emoji'
                component={SwitchInput}
                smallLabel={fm(m.native.Contact.countryFlag)}
                values={[false, true]}
              /> : null
          }
          {
            (!http_pickup && !!userEmails.data.length && useremail_id)
              ? <Field
                name='encrypt_esp_pgp'
                component={SwitchInput}
                smallLabel={fm(m.native.Contact.useGpg)}
                values={[false, true]}
              /> : null
          }
          {
            (!http_pickup && !!userEmails.data.length && useremail_id)
              ? <Field
                name='encrypt_esp_smime'
                component={SwitchInput}
                smallLabel={fm(m.native.Contact.useSmime)}
                values={[false, true]}
              /> : null
          }

          <FormSectionTitle text={fm(m.native.Contact.signature)} />

          <Field
            name='include_signature_compose'
            component={SwitchInput}
            label={fm(m.native.Contact.useComposing)}
            values={[false, true]}
          />

          <Field
            name='include_signature_reply'
            component={SwitchInput}
            label={fm(m.native.Contact.useReplying)}
            values={[false, true]}
          />

          {
            (include_signature_compose || include_signature_reply)
              ? <Field
                name='email_signature'
                component={FormTextInput}
                label={fm(m.native.Contact.signature)}
                returnKeyType='next'
                multiline
                placeholder={fm(m.native.Contact.yourSignatureHere)}
                props={this._focusProp('email_signature')}
              /> : null
          }

          {/*
          <Field
            name='strip_html'
            component={SwitchInput}
            smallLabel='Strip rich text and HTML from email and convert to plaintext ("Markdown")'
            onHelpText='All email sent to this identity will be converted to plaintext'
            offHelpText='Email sent to this identity will not be converted'
            values={[false, true]}
          />
          */}

          {/*
          <FormSectionTitle text='Outgoing' />

          <Field
            name='encrypt_contact_email_pgp'
            component={SwitchInput}
            smallLabel='Encrypt with GPG'
            onHelpText='By default, whenever possible'
            offHelpText='Ask, whenever possible'
            values={[false, true]}
          />

          <Field
            name='encrypt_contact_email_smime'
            component={SwitchInput}
            smallLabel='Encrypt with S/MIME'
            onHelpText='By default, whenever possible'
            offHelpText='Ask, whenever possible'
            values={[false, true]}
          />
          */
          }

          {/* disabled
          <Field
            name='http_pickup_send_inbound_notification'
            component={SwitchInput}
            smallLabel='http_pickup_send_inbound_notification'
            values={[true, false]}
          />
          */}

          {/* disabled
          <Field
            name='http_pickup_sent'
            component={SwitchInput}
            smallLabel='Store email I send in Sent Items'
            values={[false, true]}
          />
          */}

          {/*
          <Field
            name='two_factor_send'
            component={SwitchInput}
            smallLabel='two_factor_send'
            values={[true, false]}
          />

          <Field
            name='two_factor_verify_pgp'
            component={SwitchInput}
            smallLabel='two_factor_verify_pgp'
            values={[false, true]}
          />

          <Field
            name='two_factor_verify_smime'
            component={SwitchInput}
            smallLabel='two_factor_verify_smime'
            values={[false, true]}
          />
          */}

          { isEditing ? (
            <View>
              <FormSectionTitle text={fm(m.native.Contact.countryFlag).toUpperCase()} />

              <View style={commonStyles.deleteContainer}>
                <Text style={commonStyles.deleteEntity} onPress={this._confirmDeletion}>{fm(m.native.Contact.deleteIdentity)}</Text>
              </View>
            </View>
          ) : null}

        </EditItemView>
        {showSpinner && <BatchUpdateProgress />}
      </View>
    )
  }
}

const identityEditFormValidator = createValidator({
  display_name: [i18nize(required, m.app.CommonValidation.identityNameRequired)],
  region: [i18nize(required, m.app.CommonValidation.regionRequired)],
  domain: [i18nize(required, m.app.CommonValidation.domainRequired)],
  emailUsername: [
    i18nize(required, m.app.CommonValidation.identityEmailRequired),
    i18nize(fieldRequired, m.app.CommonValidation.chooseDomainFirst, ['domain']),
    minLength(4),
    i18nize(emailUsername, m.app.CommonValidation.useOnlyLettersNumberPeriod)
  ]
})

const EditIdentityForm = reduxForm({
  form: 'editIdentity',
  asyncValidate: asyncValidateIdentity,
  shouldAsyncValidate: debounce((params) => {
    if (!params.syncValidationPasses) return false
    return params.trigger === 'change'
  }, 500),
  asyncChangeFields: ['emailUsername', 'domain'],
  validate: identityEditFormValidator
})(EditIdentity)
const IntlEditIdentityForm = injectIntl(EditIdentityForm)

IntlEditIdentityForm.navigationOptions = ({ navigation, screenProps }) => {
  const disableCancel = path(['state', 'params', 'disableCancel'], navigation)
  const disableSubmit = path(['state', 'params', 'disableSubmit'], navigation) // this value is set in `EditItemView` component
  const id = path(['state', 'params', 'id'], navigation)
  return {
    ...EditItemView.navigationOptions({ navigation, screenProps }),
    title: id ? screenProps.fm(m.native.Contact.editIdentity) : screenProps.fm(m.native.Contact.addIdentity),
    headerLeft: (
      <HeaderButton
        title={screenProps.fm(m.app.Common.cancel)}
        onPress={promptIfDirty(navigation, screenProps.fm)}
        disabled={disableCancel || disableSubmit} />
    )
  }
}

const creationDefaults = {
  http_pickup: true,
  http_pickup_send_inbound_notification: false,
  can_receive_invite: true,
  strip_html: false,
  auto_create_contact: true
}

const mapStateToProps = (state, ownProps) => {
  const data = getDataItemForId(state.identity, path(['navigation', 'state', 'params', 'id'], ownProps))
  return {
    editItemData: data,
    userEmails: extractUserEmailData(state.useremail),
    regions: extractRegionListFromUser(state.user),
    domains: extractOrderedDomainData(state.domain, path(['user', 'data', 'state', 'pref_domainname'], state)),
    preferredDomainName: state.user.data.state && state.user.data.state.pref_domainname,

    selectedDomain: path(['form', 'editIdentity', 'values', 'domain'], state),
    selectedIdentityEmailUsername: path(['form', 'editIdentity', 'values', 'emailUsername'], state),

    auto_create_contact: path(['form', 'editIdentity', 'values', 'auto_create_contact'], state),
    can_receive_invite: path(['form', 'editIdentity', 'values', 'can_receive_invite'], state),
    encrypt_contact_email_pgp: path(['form', 'editIdentity', 'values', 'encrypt_contact_email_pgp'], state),
    encrypt_contact_email_smime: path(['form', 'editIdentity', 'values', 'encrypt_contact_email_smime'], state),
    encrypt_esp_pgp: path(['form', 'editIdentity', 'values', 'encrypt_esp_pgp'], state),
    encrypt_esp_smime: path(['form', 'editIdentity', 'values', 'encrypt_esp_smime'], state),
    http_pickup: path(['form', 'editIdentity', 'values', 'http_pickup'], state),
    http_pickup_send_inbound_notification: path(['form', 'editIdentity', 'values', 'http_pickup_send_inbound_notification'], state),
    http_pickup_sent: path(['form', 'editIdentity', 'values', 'http_pickup_sent'], state),
    include_signature_compose: path(['form', 'editIdentity', 'values', 'include_signature_compose'], state),
    include_signature_reply: path(['form', 'editIdentity', 'values', 'include_signature_reply'], state),
    next_hop_exit: path(['form', 'editIdentity', 'values', 'next_hop_exit'], state),
    strip_html: path(['form', 'editIdentity', 'values', 'strip_html'], state),
    two_factor_send: path(['form', 'editIdentity', 'values', 'two_factor_send'], state),
    two_factor_verify_pgp: path(['form', 'editIdentity', 'values', 'two_factor_verify_pgp'], state),
    two_factor_verify_smime: path(['form', 'editIdentity', 'values', 'two_factor_verify_smime'], state),
    useremail_id: path(['form', 'editIdentity', 'values', 'useremail_id'], state),

    initialValues: data ? {} : creationDefaults,
    isOnline: state.app.isNetworkOnline
  }
}

const mapDispatchToProps = {
  useremailSetIsConfirmedFilter: UserEmailActions.useremailSetIsConfirmedFilter,
  useremailClearIsConfirmedFilter: UserEmailActions.useremailClearIsConfirmedFilter,
  clearUserEmailSearchResultsData: UserEmailActions.useremailClearSearchData,
  domainSetIsActiveFilter: DomainActions.domainSetIsActiveFilter,
  domainClearIsActiveFilter: DomainActions.domainClearIsActiveFilter,
  clearDomainSearchResultsData: DomainActions.domainClearSearchData,
  deleteIdentityRequest: IdentityActions.identityRemove,
  displayNotification: NotificationActions.displayNotification,
  editItemRequest: IdentityActions.identityEdit,
  createItemRequest: IdentityActions.identityCreate,
  emailCheckForIdentity: UserActions.emailCheckForIdentity
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlEditIdentityForm)
