import React, { Component } from 'react'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'
import { find, propEq } from 'ramda'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import { path } from 'ramda'
import UserActions from 'commons/Redux/UserRedux'
import DomainActions from 'commons/Redux/DomainRedux'
import { extractOrderedDomainData } from 'commons/Selectors/Domain'

import { ringtones, notifications } from 'app/Lib/Audio'
import { promptIfDirty } from 'app/Navigation/utils'
import palette from 'app/Styles/colors'
import WaitFor from 'app/Components/WaitFor'
import EditItemView from 'app/Components/EditView'
import SwitchInput from 'app/Components/Form/SwitchInput'
import ForeignItemSelectionInput from 'app/Components/Form/ForeignItemSelectionInput'
import ForeignItemSelectionInputAlt from 'app/Components/Form/ForeignItemSelectionInputAlt'
import { FormSectionTitle } from 'app/Components/Form/Common'
import Picker from 'app/Components/Form/Picker'
import ListButton from 'app/Components/ListButton'
import ListButtonGroup from 'app/Components/ListButtonGroup'
import Text from 'app/Components/BaseText'
import HeaderButton from 'app/Components/HeaderButton'

const s = EStyleSheet.create({
  resetDescription: {
    color: palette.concrete,
    paddingHorizontal: '1rem',
    paddingTop: '0.25rem',
    paddingBottom: '1rem'
  }
})

const DEFAULT_SETTINGS = {
  notifications_show_on: true,
  incoming_calls_alert_on: true,
  in_app_sounds_on: true,
  in_app_vibrate_on: false
}

const FORM_IDENTIFIER = 'notificationSettings'

class NotificationSettings extends Component {
  constructor (props) {
    super(props)

    this._formValuesToPayload = this._formValuesToPayload.bind(this)
    this._selectVideoCallRingtone = this._selectVideoCallRingtone.bind(this)
    this._selectNotificationSound = this._selectNotificationSound.bind(this)
    this._resetValues = this._resetValues.bind(this)
    this._updateNavigationDirtyFrom = this._updateNavigationDirtyFrom.bind(this)
  }

  _formValuesToPayload (values) {
    return values
  }

  _renderSelectedVideoCallRingtone (value) {
    const selected = ringtones.find(item => item.filename === value)
    if (selected) {
      return selected.title || selected.filename
    }
  }

  _selectVideoCallRingtone () {
    const { navigation } = this.props
    navigation.navigate('SoundSelection', {
      form: FORM_IDENTIFIER,
      field: 'video_call_ringtone',
      sounds: ringtones
    })
  }

  _renderSelectedNotificationSound (value) {
    const selected = notifications.find(item => item.filename === value)
    if (selected) {
      return selected.title || selected.filename
    }
  }

  _selectNotificationSound () {
    const { navigation } = this.props
    navigation.navigate('SoundSelection', {
      form: FORM_IDENTIFIER,
      field: 'notification_sound',
      sounds: notifications
    })
  }

  _resetValues () {
    const { change } = this.props
    change('notifications_show_on', true)
    change('incoming_calls_alert_on', true)
    change('in_app_sounds_on', true)
    change('in_app_vibrate_on', false)
  }

  _updateNavigationDirtyFrom (nextProps) {
    const { navigation, dirty } = nextProps
    if (navigation.state.params && navigation.state.params.dirty !== undefined && navigation.state.params.dirty !== dirty) {
      setTimeout(() => {
        navigation.setParams({ dirty })
      }, 0)
    }
  }

  componentWillReceiveProps (nextProps) {
    this._updateNavigationDirtyFrom(nextProps)
  }

  componentWillMount () {
    const { navigation, dirty } = this.props
    navigation.setParams({ dirty })
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <EditItemView
        createSuccessMessage={fm(m.native.Preferences.notificationUpdated)}
        formValuesToPayload={this._formValuesToPayload}
        {...this.props}
      >

        {/* CHAT NOTIFICATIONS */}
        <FormSectionTitle text={fm(m.native.Preferences.chatNotifications)} />
        <Field
          name='notifications_show_on'
          component={SwitchInput}
          label={fm(m.native.Preferences.showNotifications)}
          values={[false, true]}
        />
        <Field
          name='notification_sound'
          type='select'
          component={ForeignItemSelectionInputAlt}
          goToItemSelectionView={this._selectNotificationSound}
          renderSelectedValue={this._renderSelectedNotificationSound}
          label={fm(m.native.Preferences.sound)}
        />

        {/* INCOMING CALLS */}
        <FormSectionTitle text={fm(m.native.Preferences.incomingCalls)} />
        <Field
          name='incoming_calls_alert_on'
          component={SwitchInput}
          label={fm(m.native.Preferences.alert)}
          values={[false, true]}
        />
        <Field
          name='video_call_ringtone'
          type='select'
          component={ForeignItemSelectionInputAlt}
          renderSelectedValue={this._renderSelectedVideoCallRingtone}
          goToItemSelectionView={this._selectVideoCallRingtone}
          label={fm(m.native.Preferences.sound)}
        />

        {/* IN-APP NOTIFICATIONS */}
        <FormSectionTitle text={fm(m.native.Preferences.inAppNotifications)} />
        <Field
          name='in_app_sounds_on'
          component={SwitchInput}
          label={fm(m.native.Preferences.inAppSounds)}
          values={[false, true]}
        />
        <Field
          name='in_app_vibrate_on'
          component={SwitchInput}
          label={fm(m.native.Preferences.inAppVibrate)}
          values={[false, true]}
        />

        {/* IN-APP NOTIFICATIONS */}
        <FormSectionTitle text='' />
        <ListButtonGroup style={{ marginTop: -3 }}>
          <ListButton
            textLeft={fm(m.native.Preferences.resetAllNotifications)}
            iconComponent={FAIcon}
            iconName='book'
            onPress={this._resetValues}
          />
          <Text style={s.resetDescription}>
            {fm(m.native.Preferences.undoAllNotificationSettings)}
          </Text>
        </ListButtonGroup>

      </EditItemView>
    )
  }
}

const NotificationSettingsForm = reduxForm({
  form: FORM_IDENTIFIER
})(NotificationSettings)

const IntlNotificationSettingsForm = injectIntl(NotificationSettingsForm)

IntlNotificationSettingsForm.navigationOptions = ({ navigation, screenProps }) => ({
  ...EditItemView.navigationOptions({ navigation, screenProps }),
  title: screenProps.fm(m.native.Preferences.notification),
  headerLeft: <HeaderButton title={screenProps.fm(m.app.Common.cancel)} onPress={promptIfDirty(navigation, screenProps.fm)} />
})

const mapStateToProps = state => ({
  // Pre-populate identity display name with user's display name
  initialValues: {
    notifications_show_on: state.user.data.notifications_show_on,
    incoming_calls_alert_on: state.user.data.incoming_calls_alert_on,
    in_app_sounds_on: state.user.data.in_app_sounds_on,
    in_app_vibrate_on: state.user.data.in_app_vibrate_on,
    notification_sound: state.user.data.notification_sound,
    video_call_ringtone: state.user.data.video_call_ringtone
  }
})

const mapDispatchToProps = {
  createItemRequest: UserActions.updateAccountRequest
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlNotificationSettingsForm)
