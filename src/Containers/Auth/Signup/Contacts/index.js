import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Alert } from 'react-native'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { path } from 'ramda'

import mNative from 'commons/I18n/native'
import UserActions from 'commons/Redux/UserRedux'

import DeviceContactActions from 'app/Redux/DeviceContactRedux'
import Text from 'app/Components/BaseText'

import styles from '../../_Base/styles'
import localStyles from './styles'
import { AuthContainer, AuthActionButton } from '../../_Base'

class SignupContacts extends Component {
  static propTypes = {
    contactsImportRequest: PropTypes.func,
    navigation: PropTypes.object,
    intl: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._skip = this._skip.bind(this)
    this._displaySkipModal = this._displaySkipModal.bind(this)
    this._askPermissionAndProceed = this._askPermissionAndProceed.bind(this)
  }

  _askPermissionAndProceed () {
    this.props.contactsImportRequest()
    this.props.navigation.navigate('SignupESPImported')
  }

  _skip () {
    this.props.navigation.navigate('SignupESPImported')
  }

  _displaySkipModal () {
    const fm = this.props.intl.formatMessage
    Alert.alert(
      fm(mNative.Snackbar.areYouSure),
      fm(mNative.Snackbar.establishCommunicationWithYourFriend),
      [
        { text: fm(mNative.Snackbar.dontAllow), onPress: this._skip },
        { text: fm(mNative.Snackbar.allow), style: 'cancel', onPress: this._askPermissionAndProceed }
      ]
    )
  }

  render () {
    const { contactsImportRequest } = this.props
    const fm = this.props.intl.formatMessage

    return (
      <AuthContainer hideFooter logoProps={{ small: true }}>
        <View style={localStyles.content}>
          <Text style={localStyles.permissionsText}>
            {fm(mNative.Auth.makeSecureCommunication)}
          </Text>
          <Text style={localStyles.permissionsText}>
            {fm(mNative.Auth.pleaseLetUsIntegrate)}
          </Text>

          <AuthActionButton
            style={[styles.button]}
            title={fm(mNative.Snackbar.allow).toUpperCase()}
            titleStyle={[styles.buttonText]}
            onPress={() => {
              contactsImportRequest()
              this.props.navigation.navigate('SignupESPImported')
            }}
          />

          <View style={localStyles.bottomContainer}>
            <Text style={localStyles.bottomAction} onPress={this._displaySkipModal}>
              {fm(mNative.Auth.manuallyAddContacts)}
            </Text>
            {/* <ProgressDots activeIndex={1} totalCount={4} /> */}
          </View>
        </View>
      </AuthContainer>
    )
  }
}

const IntlSignupForm = injectIntl(SignupContacts)
IntlSignupForm.navigationOptions = {
  header: null,
  tabBarVisible: false
}

const mapDispatchToProps = {
  signupRequest: UserActions.signupRequest,
  contactsImportRequest: DeviceContactActions.contactsImportRequest
}

const mapStateToProps = state => ({
  username: path(['user', 'data', 'username'], state)
})

export default connect(mapStateToProps, mapDispatchToProps)(IntlSignupForm)
