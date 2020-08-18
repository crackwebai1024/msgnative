import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { StackActions } from 'react-navigation'
import FAIcon from 'react-native-vector-icons/FontAwesome'

import m from 'commons/I18n'
import UserActions from 'commons/Redux/UserRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { createValidator, i18nize, required } from 'commons/Lib/Validators'

import Text from 'app/Components/BaseText'
// import Spinner from 'app/Components/Spinner'

import styles from './_Base/styles'
import { AuthContainer, AuthTextInputWithIcon, AuthActionButton, ErrorMessage } from './_Base'

class PasswordResetRequest extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    intl: PropTypes.object,
    isOnline: PropTypes.bool,
    passwordResetRequestRequest: PropTypes.func,
    submitSucceeded: PropTypes.bool,
    displayNotification: PropTypes.func,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    error: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._handlePress = this._handlePress.bind(this)
    this._goToLogin = this._goToLogin.bind(this)

    this.state = {
      focus: null
    }
  }

  _handlePress (values) {
    return new Promise((resolve, reject) =>
      this.props.passwordResetRequestRequest({ username: values.username }, resolve, reject))
  }

  _goToLogin () {
    const { navigation } = this.props

    navigation.goBack()
  }

  componentWillReceiveProps (nextProps) {
    const { intl } = nextProps
    const fm = intl.formatMessage
    if (!this.props.submitSucceeded && nextProps.submitSucceeded) {
      nextProps.navigation.navigate('PasswordReset')
      nextProps.displayNotification(fm(m.app.Auth.pleaseCheckYourMailbox), 'info', 3000)
    }
  }

  render () {
    const { handleSubmit, submitting, error, intl, isOnline } = this.props
    const fm = intl.formatMessage
    return (
      <View style={styles.form}>
        { (error && !submitting) && <ErrorMessage text={error} /> }
        <View style={[styles.authFieldContainer, styles.loginFieldWrapper]}>
          <Field
            name='username'
            iconName='id-badge'
            iconSize={18}
            iconComponent={FAIcon}
            style={[styles.textInput, styles.textInputLight]}
            component={AuthTextInputWithIcon}
            errorStyle={styles.textInputError}
            placeholder={fm(m.app.Auth.username)}
            placeholderTextColor={styles.$lightColor}
            autoCorrect={false}
            autoCapitalize='none'
            returnKeyType='next'
            onSubmitEditing={handleSubmit(this._handlePress)}
            selectionColor='#fff'
          />
        </View>
        <AuthActionButton
          style={styles.button}
          onPress={handleSubmit(this._handlePress)}
          title={fm(m.app.Auth.resetPassword).toUpperCase()}
          titleStyle={[styles.buttonText, submitting && styles.buttonTextActive, !isOnline && styles.disabledButtonOpacity]}
          isSpinning={submitting}
          disabled={!isOnline}
        />

        <Text style={[styles.altMessage, styles.altMessageText]}>
          {fm(m.app.Auth.alreadyHaveAccount)}{'\n'}
        </Text>

        <Text style={styles.altMessageSignUp} onPress={this._goToLogin}>
          <Text style={[styles.altMessageText, styles.altMessageSignUp]}>
            {fm(m.app.Auth.signIn)}
          </Text>
        </Text>

      </View>
    )
  }
}

const passwordResetRequestValidator = createValidator({
  username: [
    i18nize(required, m.app.AuthValidation.usernameRequired)
  ]
})

const PasswordResetRequestForm = reduxForm({
  form: 'passwordResetRequest',
  validate: passwordResetRequestValidator
})(PasswordResetRequest)

const IntlPasswordResetRequest = injectIntl(PasswordResetRequestForm)

class PasswordResetRequestScreen extends Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false
  }

  render () {
    return (
      <AuthContainer>
        <IntlPasswordResetRequest {...this.props} />
      </AuthContainer>
    )
  }
}

const mapStateToProps = state => ({
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  passwordResetRequestRequest: UserActions.passwordResetRequestRequest,
  displayNotification: NotificationActions.displayNotification,
  resetNavigation: StackActions.reset
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordResetRequestScreen)
