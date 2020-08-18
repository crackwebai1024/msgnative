import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { injectIntl } from 'react-intl'
import { NavigationActions, StackActions } from 'react-navigation'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import m from 'commons/I18n'
import UserActions from 'commons/Redux/UserRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { createValidator, required, equalTo, uuid, i18nize } from 'commons/Lib/Validators'

import Text from 'app/Components/BaseText'

import styles from './_Base/styles'
import { AuthContainer, AuthTextInputWithIcon, AuthActionButton, ErrorMessage } from './_Base'

const passwordResetValidator = createValidator({
  passwordUUID: [
    i18nize(required, m.app.Auth.passwordResetCodeRequired),
    i18nize(uuid, m.app.Auth.invalidCode)
  ],
  username: [
    i18nize(required, m.app.AuthValidation.usernameRequired)
  ],
  password: [
    i18nize(required, m.app.Auth.passwordIsRequired)
  ],
  passwordAgain: [
    i18nize(required, m.app.AuthValidation.passwordAgainRequired),
    i18nize(equalTo, m.app.AuthValidation.passwordsDoNotMatch, ['password'])
  ]
})

export const FORM_IDENTIFIER = 'passwordReset'

class PasswordReset extends Component {
  static propTypes = {
    intl: PropTypes.object,
    isOnline: PropTypes.bool,
    passwordResetRequest: PropTypes.func,
    resetNavigation: PropTypes.func,
    submitSucceeded: PropTypes.bool,
    displayNotification: PropTypes.func,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    error: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      focus: null
    }

    this._handlePress = this._handlePress.bind(this)
    this._focusUsername = this._setFocus.bind(this, 'username')
    this._focusPassword = this._setFocus.bind(this, 'password')
    this._focusPasswordAgain = this._setFocus.bind(this, 'passwordAgain')
    this._goToLogin = this._goToLogin.bind(this)
  }

  _setFocus (key) {
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  componentWillReceiveProps (nextProps) {
    const { intl } = nextProps
    const fm = intl.formatMessage
    if (!this.props.submitSucceeded && nextProps.submitSucceeded) {
      this._goToLogin()
      nextProps.displayNotification(fm(m.app.Auth.resetPasswordSuccess), 'info', 2000)
    }
  }

  _goToLogin () {
    const { resetNavigation } = this.props
    resetNavigation({
      index: 0,
      actions: [ NavigationActions.navigate({ routeName: 'Login' }) ]
    })
  }

  _handlePress (values) {
    return new Promise((resolve, reject) => this.props.passwordResetRequest({
      password_uuid: values.passwordUUID,
      new_password: values.password,
      username: values.username
    }, resolve, reject))
  }

  render () {
    const { handleSubmit, submitting, error, intl, isOnline } = this.props
    const fm = intl.formatMessage
    return (
      <View style={styles.form}>
        { (error && !submitting) && <ErrorMessage text={error} /> }
        <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
          <Field
            name='passwordUUID'
            iconName='lock-outline'
            iconSize={18}
            iconComponent={MCIcon}
            style={[styles.textInput, styles.textInputLight]}
            component={AuthTextInputWithIcon}
            errorStyle={styles.textInputError}
            placeholder={fm(m.app.Auth.passwordResetCode)}
            placeholderTextColor={styles.$lightColor}
            autoCorrect={false}
            autoCapitalize='none'
            returnKeyType='next'
            props={this._focusProp('passwordUUID')}
            onSubmitEditing={this._focusUsername}
            selectionColor='#fff'
          />
        </View>
        <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
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
            props={this._focusProp('username')}
            onSubmitEditing={this._focusPassword}
            ref='username'
            widthRef
            selectionColor='#fff'
          />
        </View>
        <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
          <Field
            name='password'
            iconName='lock-outline'
            iconSize={18}
            iconComponent={MCIcon}
            style={[styles.textInput, styles.textInputLight]}
            errorStyle={styles.textInputError}
            component={AuthTextInputWithIcon}
            secureTextEntry
            returnKeyType='next'
            placeholder={fm(m.app.Auth.password)}
            placeholderTextColor={styles.$lightColor}
            autoCorrect={false}
            autoCapitalize='none'
            props={this._focusProp('password')}
            onSubmitEditing={this._focusPasswordAgain}
            ref='password'
            widthRef
            selectionColor='#fff'
          />
        </View>
        <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
          <Field
            name='passwordAgain'
            iconName='lock-outline'
            iconSize={18}
            iconComponent={MCIcon}
            style={[styles.textInput, styles.textInputLight]}
            errorStyle={styles.textInputError}
            component={AuthTextInputWithIcon}
            secureTextEntry
            placeholder={fm(m.app.Auth.passwordAgain)}
            placeholderTextColor={styles.$lightColor}
            returnKeyType='done'
            autoCorrect={false}
            autoCapitalize='none'
            props={this._focusProp('passwordAgain')}
            onSubmitEditing={handleSubmit(this._handlePress)}
            ref='passwordAgain'
            widthRef
            selectionColor='#fff'
          />
        </View>
        <AuthActionButton
          style={styles.button}
          title={fm(m.app.Auth.resetPassword).toUpperCase()}
          titleStyle={[styles.buttonText, submitting && styles.buttonTextActive, !isOnline && styles.disabledButtonOpacity]}
          isSpinning={submitting}
          onPress={handleSubmit(this._handlePress)}
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

const PasswordResetForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: passwordResetValidator
})(PasswordReset)

const IntlPasswordReset = injectIntl(PasswordResetForm)

class PasswordResetScreen extends Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false
  }

  render () {
    return (
      <AuthContainer>
        <IntlPasswordReset {...this.props} />
      </AuthContainer>
    )
  }
}

const mapStateToProps = state => ({
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  passwordResetRequest: UserActions.passwordResetRequest,
  displayNotification: NotificationActions.displayNotification,
  resetNavigation: StackActions.reset
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordResetScreen)
