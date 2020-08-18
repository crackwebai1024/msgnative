// import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
// import { Button } from 'react-native'
import emojiFlags from 'emoji-flags'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import dismissKeyboard from 'dismissKeyboard'
import moment from 'moment'
import momentTimezones from 'moment-timezone'
// import { path } from 'ramda'
import m from 'commons/I18n'
import ContactActions from 'commons/Redux/ContactRedux'
import locales from 'commons/I18n/locales'
import DomainActions from 'commons/Redux/DomainRedux'
import UserActions from 'commons/Redux/UserRedux'
import { createValidator, required, i18nize } from 'commons/Lib/Validators'
import { extractRegionListFromUser } from 'commons/Selectors/Region'

import { promptIfDirty } from 'app/Navigation/utils'
import EditItemView from 'app/Components/EditView'
import FormTextInput from 'app/Components/Form/FormTextInput'
import SwitchInput from 'app/Components/Form/SwitchInput'
import Picker from 'app/Components/Form/Picker'
import { FormSectionTitle } from 'app/Components/Form/Common'
import HeaderButton from 'app/Components/HeaderButton'

import ListButton from 'app/Components/ListButton'
import ListButtonGroup from 'app/Components/ListButtonGroup'

class EditUserProfile extends Component {
  constructor (props) {
    super(props)

    this.state = {
      focus: null
    }

    this._focusDisplayName = this._setFocus.bind(this, 'display_name')
    this._clearFocus = this._setFocus.bind(this, null)
    this._getLocaleOptions = this._getLocaleOptions.bind(this)
    this._getTimezoneOptions = this._getTimezoneOptions.bind(this)
    this._updateNavigationDirtyFrom = this._updateNavigationDirtyFrom.bind(this)
    this._onContactListUnmount = this._onContactListUnmount.bind(this)

    this.state = {
      focus: null
    }
  }

  formValuesToPayload (values) {
    return {
      display_name: values.display_name,
      timezone: values.timezone,
      locale: values.locale,
      is_default_http_pickup: values.is_default_http_pickup,
      is_default_strip_html: values.is_default_strip_html,
      bypass_port_blocking: values.bypass_port_blocking,
      pref_mail_load_remote_content: values.pref_mail_load_remote_content,
      pref_mail_load_embedded_image: values.pref_mail_load_embedded_image,
      pref_webrtc_udp: values.pref_webrtc_udp,

      region: values.region,
      country_flag_emoji: values.country_flag_emoji
    }
  }

  componentWillReceiveProps (nextProps) {
    this._updateNavigationDirtyFrom(nextProps)
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

  _setFocus (key) {
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _getLocaleOptions () {
    return locales.map(item => ({
      title: item[1],
      value: item[0]
    }))
  }

  _getTimezoneOptions () {
    const guessedTz = moment.tz.guess()
    // First two items with browser time and guessed timezone
    let timeZoneData = [
      { value: '', title: `Device (${moment().format('h:mm a')})` },
      { value: guessedTz, title: `${guessedTz} (${moment.tz(guessedTz).format('h:mm a')})` }
    ]
    // Concatnate with the full timezone list from moment
    timeZoneData = timeZoneData.concat(momentTimezones.tz.names().map(tz => ({ value: tz, title: `${tz} (${moment.tz(tz).format('h:mm a')})` })))
    return timeZoneData
  }

  _onContactListUnmount () {
    this.props.contactSetSearchFilters({})
    this.props.contactClearSearchResultsData()
  }

  render () {
    const {
      navigation,
      contactSetSearchFilters,
      intl
    } = this.props
    const { navigate } = navigation
    const fm = intl.formatMessage
    return (
      <EditItemView
        ref='editView'
        createSuccessMessage={fm(m.native.Preferences.preferenceSaved)}
        editSuccessMessage={fm(m.native.Preferences.preferenceSaved)}
        formValuesToPayload={this.formValuesToPayload}
        onSubmitEditing={dismissKeyboard}
        rightTitle={fm(m.app.Common.save)}
        {...this.props}
      >
        <FormSectionTitle text={fm(m.native.Preferences.application)} />

        <Field
          name='display_name'
          component={FormTextInput}
          label={fm(m.native.Preferences.displayName)}
          props={this._focusProp('display_name')}
          onSubmitEditing={dismissKeyboard}
          blurOnSubmit
        />

        <Field
          name='locale'
          component={Picker}
          title={fm(m.native.Preferences.preferredLanguage)}
          initialMessage={fm(m.native.Preferences.choosePreferredLanguage)}
          linkText={fm(m.native.Preferences.language)}
          options={this._getLocaleOptions()}
          props={this._focusProp('locale')}
          onSubmitEditing={dismissKeyboard}
        />

        <Field
          name='timezone'
          component={Picker}
          title={fm(m.native.Preferences.preferredTimeZone)}
          initialMessage={fm(m.native.Preferences.choosePreferredTimeZone)}
          linkText={fm(m.native.Preferences.timezone)}
          options={this._getTimezoneOptions()}
          props={this._focusProp('timezone')}
          onSubmitEditing={dismissKeyboard}
        />

        <FormSectionTitle text={fm(m.native.Preferences.communication)} />

        <Field
          name='pref_webrtc_udp'
          component={SwitchInput}
          label={fm(m.native.Preferences.bypassPortBlocking)}
          onHelpText={fm(m.native.Preferences.bypassPortBlockingHelpOn)}
          offHelpText={fm(m.native.Preferences.bypassPortBlockingHelpOff)}
          values={[true, false]}
          onSubmitEditing={dismissKeyboard}
        />

        <FormSectionTitle text={fm(m.native.Preferences.emailRendering)} />

        <Field
          name='pref_mail_load_remote_content'
          component={SwitchInput}
          label={fm(m.native.Preferences.remoteContentRendering)}
          onHelpText={fm(m.native.Preferences.remoteContentRenderingHelpOn)}
          offHelpText={fm(m.native.Preferences.remoteContentRenderingHelpOff)}
          values={[false, true]}
          onSubmitEditing={dismissKeyboard}
        />

        {/* Rachel decided to show inline attached image as attachments always */}
        {/* <Field
          name='pref_mail_load_embedded_image'
          component={SwitchInput}
          label={fm(m.native.Preferences.embeddedContentRendering)}
          onHelpText={fm(m.native.Preferences.embeddedContentRenderingHelpOn)}
          offHelpText={fm(m.native.Preferences.embeddedContentRenderingHelpOff)}
          values={[false, true]}
          onSubmitEditing={dismissKeyboard}
        /> */}

        <FormSectionTitle text={fm(m.native.Preferences.newIdentityDefaults)} />

        <Field
          name='region'
          component={Picker}
          title={fm(m.native.Preferences.selectRegion)}
          initialMessage={fm(m.native.Preferences.preferredRegion)}
          linkText={fm(m.native.Preferences.selectRegion)}
          returnKeyType='next'
          options={this._getFullRegionData(this.props.regions)}
          props={this._focusProp('region')}
          onSubmitEditing={dismissKeyboard}
        />

        {/* Does this benefit general defaults? Wylie doesn't think so
        <Field
          name='is_default_http_pickup'
          component={SwitchInput}
          label='Display images already embedded in email'
          values={[false, true]}
          onSubmitEditing={dismissKeyboard}
        />
        */}

        <Field
          name='is_default_strip_html'
          component={SwitchInput}
          label={fm(m.native.Preferences.stripTextLabel)}
          onHelpText={fm(m.native.Preferences.stripTextHelpOn)}
          offHelpText={fm(m.native.Preferences.stripTextHelpOff)}
          values={[false, true]}
          onSubmitEditing={dismissKeyboard}
        />

        <FormSectionTitle text={fm(m.native.Preferences.contactSettings)} />

        <ListButtonGroup style={{ marginTop: -3 }}>
          <ListButton
            textLeft={fm(m.native.Preferences.blockedContacts)}
            iconComponent={FAIcon}
            iconName='book'
            onPress={() => {
              navigate('ContactList', {
                onUnmount: () => this._onContactListUnmount(),
                title: `${fm(m.native.Preferences.blockedContacts)}`,
                hideDeviceContacts: true,
                tabBarVisible: false,
                hideAddContact: true,
                headerLeftProps: { isBack: true }
              })
              contactSetSearchFilters({ state: -1 })
            }}
          />
          <ListButton
            textLeft={fm(m.native.Preferences.ignoredContacts)}
            iconComponent={FAIcon}
            iconName='book'
            onPress={() => {
              navigate('ContactList', {
                onUnmount: () => this._onContactListUnmount(),
                title: `${fm(m.native.Preferences.ignoredContacts)}`,
                tabBarVisible: false,
                hideDeviceContacts: true,
                hideAddContact: true,
                headerLeftProps: { isBack: true }
              })
              contactSetSearchFilters({ state: -2 })
            }}
          />
        </ListButtonGroup>

      </EditItemView>
    )
  }
}

const userProfileEditFormValidator = createValidator({
  display_name: [i18nize(required, m.native.Setting.nameIsRequired)]
})

const EditUserProfileForm = reduxForm({
  form: 'editUserProfile',
  validate: userProfileEditFormValidator
})(EditUserProfile)

const IntlEditUserProfileForm = injectIntl(EditUserProfileForm)

// preferenceTitle: intl.formatMessage(m.native.Preferences.titleMeta), cancel: intl.formatMessage(m.app.Common.cancel)
IntlEditUserProfileForm.navigationOptions = ({ navigation, screenProps }) => ({
  ...EditItemView.navigationOptions({ navigation, screenProps }),
  title: screenProps.fm(m.native.Preferences.titleMeta),
  headerLeft: <HeaderButton title={screenProps.fm(m.app.Common.cancel)} onPress={promptIfDirty(navigation, screenProps.fm)} />
})

const mapStateToProps = state => ({
  regions: extractRegionListFromUser(state.user),

  initialValues: {
    id: state.user.data.id,
    display_name: state.user.data.display_name,
    timezone: state.user.data.timezone,
    locale: state.user.data.locale,
    region: state.user.data.region,
    pref_webrtc_udp: state.user.data.pref_webrtc_udp,

    bypass_port_blocking: state.user.data.bypass_port_blocking,

    pref_mail_load_remote_content: state.user.data.pref_mail_load_remote_content,
    pref_mail_load_embedded_image: state.user.data.pref_mail_load_embedded_image,

    is_default_http_pickup: state.user.data.is_default_http_pickup,
    is_default_strip_html: state.user.data.is_default_strip_html
  }
})

const mapDispatchToProps = {
  createItemRequest: UserActions.updateAccountRequest,
  editItemRequest: UserActions.updateAccountRequest,
  fetchDomains: DomainActions.domainSetIsActiveFilter,
  contactSetSearchFilters: ContactActions.contactSetSearchFilters,
  contactClearSearchResultsData: ContactActions.contactClearSearchData
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlEditUserProfileForm)
