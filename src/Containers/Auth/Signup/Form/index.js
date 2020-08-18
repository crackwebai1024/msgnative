import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Keyboard, Platform } from 'react-native'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { reduxForm, Field, focus } from 'redux-form'
import { isEmail } from 'validator'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import m from 'commons/I18n'
import UserActions from 'commons/Redux/UserRedux'
import {
  createValidator,
  required,
  minLength,
  maxLength,
  equalTo,
  i18nize,
  accountUsername,
  accountPassword
} from 'commons/Lib/Validators'

import { getCurrentRouteName } from 'app/Navigation/utils'
import Text from 'app/Components/BaseText'

import styles from '../../_Base/styles'
import localStyles from './styles'
import { AuthContainer, AuthTextInputWithIcon, ErrorMessage, AuthActionButton } from '../../_Base'
import BFService from 'modules/BackgroundToForegroundService'

export const FORM_IDENTIFIER = 'signup'

const signupFormValidator = createValidator({
  username: [
    i18nize(required, m.app.AuthValidation.usernameRequired),
    i18nize(minLength, m.app.AuthValidation.usernameMinLength, [5]),
    i18nize(maxLength, m.app.AuthValidation.usernameMaxLength, [30]),
    i18nize(accountUsername, m.app.AuthValidation.usernameRegex)
  ],
  password: [
    i18nize(required, m.app.AuthValidation.passwordRequired),
    i18nize(minLength, m.app.AuthValidation.passwordMinLength, [8]),
    i18nize(maxLength, m.app.AuthValidation.passwordMaxLength, [64]),
    i18nize(accountPassword, m.app.AuthValidation.passwordInvalid)
  ],
  passwordAgain: [
    i18nize(required, m.app.AuthValidation.passwordAgainRequired),
    i18nize(equalTo, m.app.AuthValidation.passwordsDoNotMatch, ['password'])
  ]
})

class SignupForm extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    intl: PropTypes.object,
    activeField: PropTypes.string,
    signupRequest: PropTypes.func,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    error: PropTypes.object,
    currentRouteName: PropTypes.string,
    isOnline: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      focus: null
    }

    this._handlePress = this._handlePress.bind(this)
    this._goToLogin = this._goToLogin.bind(this)
    this._focusPassword = this._setFocus.bind(this, 'password')
    this._focusPasswordAgain = this._setFocus.bind(this, 'passwordAgain')
  }

  _setFocus (key) {
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _goToLogin () {
    const { navigation } = this.props
    navigation.navigate('Login')
  }

  _updateScrollForRef (ref) {
    if (!this.refs[ref] || !this.refs.container) return
    this.refs.container.updateScroll(this.refs[ref].getRenderedComponent())
  }

  _handlePress (values) {
    const payload = {
      display_name: '',
      username: values.username,
      password: values.password
    }
    // here dismiss keyboard
    if (Platform.OS === 'android') {
      BFService.dismissKeyboard()
    } else if (Platform.OS === 'ios') {
      Keyboard.dismiss()
    }

    return new Promise((resolve, reject) => this.props.signupRequest(payload, (...args) => {
      resolve(...args)
      this.props.navigation.navigate('SignupContacts')
    }, reject))
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.activeField && nextProps.activeField !== this.props.activeField) {
      this._updateScrollForRef(nextProps.activeField)
    }
  }

  render () {
    const {
      handleSubmit, submitting, error, intl, currentRouteName, isOnline
    } = this.props
    const fm = intl.formatMessage

    if (currentRouteName !== 'SignupForm') {
      return null
    }

    return (
      <AuthContainer hideFooter ref='container' logoProps={{ align: 'center' }}>
        <View style={localStyles.container}>
          { (error && !submitting) && <ErrorMessage text={error} /> }

          <Text style={styles.pageTitleText}>{fm(m.native.Auth.createNewAccount)}</Text>
          <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
            <Field
              name='username'
              iconName='id-badge'
              iconSize={18}
              iconComponent={FAIcon}
              props={this._focusProp('username')}
              style={[styles.textInput, styles.textInputLight]}
              errorStyle={styles.textInputError}
              component={AuthTextInputWithIcon}
              placeholder={fm(m.app.Auth.username)}
              placeholderTextColor={styles.$lightColor}
              returnKeyType='next'
              autoCorrect={false}
              autoCapitalize='none'
              onSubmitEditing={this._focusPassword}
              ref='username'
              withRef
              selectionColor='#fff'
              blurOnSubmit
            />
            <Text style={styles.fieldHelpText}>{fm(m.native.Auth.usernameMustBeCharacters)}</Text>
          </View>
          <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
            <Field
              name='password'
              iconName='lock-outline'
              iconSize={18}
              iconComponent={MCIcon}
              props={this._focusProp('password')}
              style={[styles.textInput, styles.textInputLight]}
              errorStyle={styles.textInputError}
              component={AuthTextInputWithIcon}
              secureTextEntry
              placeholder={fm(m.app.Auth.password)}
              placeholderTextColor={styles.$lightColor}
              returnKeyType='next'
              autoCorrect={false}
              autoCapitalize='none'
              onSubmitEditing={this._focusPasswordAgain}
              ref='password'
              withRef
              selectionColor='#fff'
              blurOnSubmit
            />
          </View>
          <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
            <Field
              name='passwordAgain'
              iconName='lock-outline'
              iconSize={18}
              iconComponent={MCIcon}
              props={this._focusProp('passwordAgain')}
              style={[styles.textInput, styles.textInputLight]}
              errorStyle={styles.textInputError}
              component={AuthTextInputWithIcon}
              secureTextEntry
              placeholder={fm(m.app.Auth.passwordAgain)}
              placeholderTextColor={styles.$lightColor}
              returnKeyType='done'
              autoCorrect={false}
              autoCapitalize='none'
              onSubmitEditing={handleSubmit(this._handlePress)}
              ref='passwordAgain'
              withRef
              selectionColor='#fff'
              blurOnSubmit
            />
            <Text style={styles.fieldHelpText}>{fm(m.native.Auth.passwordMustHaveMinimum)}</Text>
          </View>
          {/* <ProgressDots activeIndex={0} totalCount={4} style={localStyles.dots} /> */}

          <AuthActionButton
            style={[styles.button]}
            onPress={handleSubmit(this._handlePress)}
            title={fm(m.app.Misc.next).toUpperCase()}
            titleStyle={[styles.buttonText, submitting && styles.buttonTextActive, !isOnline && styles.disabledButtonOpacity]}
            isSpinning={submitting}
            disabled={!isOnline}
          />

          <Text style={styles.altMessage}>
            <Text style={styles.altMessageText}>{fm(m.app.Auth.alreadyHaveAccount)}{' '}</Text>
            <Text style={[styles.altMessageText, styles.altMessageTextUnderlined]} onPress={this._goToLogin}>{fm(m.app.Auth.logIn)}</Text>
          </Text>

        </View>
      </AuthContainer>

    )
  }
}

const SignupFormInstance = reduxForm({
  form: FORM_IDENTIFIER,
  validate: signupFormValidator,
  asyncValidate: (values, dispatch, props) => {
    // Dispatch the request along with resolve & reject
    // and the saga will take care of using the one appropriately

    const promises = []
    const { username } = values

    if (username && props.isOnline) {
      promises.push(new Promise((resolve, reject) => props.usernameCheckRequest(username, resolve, reject)))

      if (isEmail(username)) {
        promises.push(new Promise((resolve, reject) => props.emailCheckForEspRequest(username, resolve, ({ email }) => reject({ username: email }))))
      }
    }
    return new Promise.all(promises)
  },
  shouldAsyncValidate: (params) => {
    if (!params.syncValidationPasses) return false
    return params.trigger === 'blur'
  },
  asyncBlurFields: ['username']
})(SignupForm)

const IntlSignupForm = injectIntl(SignupFormInstance)
IntlSignupForm.navigationOptions = {
  header: null,
  tabBarVisible: false
}

const mapStateToProps = state => ({
  currentRouteName: getCurrentRouteName(state.nav),
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  signupRequest: UserActions.signupRequest,
  usernameCheckRequest: UserActions.usernameCheckRequest,
  emailCheckForEspRequest: UserActions.emailCheckForEspRequest,
  reduxFocus: focus
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlSignupForm)
