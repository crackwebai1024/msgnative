import React, { Component } from 'react'
import { View, Keyboard, Platform } from 'react-native'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { injectIntl } from 'react-intl'
import { NavigationActions, StackActions } from 'react-navigation'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { compose } from 'recompose'

import m from 'commons/I18n'
import UserActions from 'commons/Redux/UserRedux'
import { createValidator, i18nize, required } from 'commons/Lib/Validators'
import { getCurrentRouteName } from 'app/Navigation/utils'
import Text from 'app/Components/BaseText'
import NotificationWithActions from 'app/Components/NotificationWithActions'
import styles from './_Base/styles'
import { AuthContainer, AuthTextInputWithIcon, AuthActionButton } from './_Base'
import BFService from 'modules/BackgroundToForegroundService'

export const FORM_IDENTIFIER = 'login'

const loginFormValidator = createValidator({
  username: [
    i18nize(required, m.app.AuthValidation.usernameRequired)
  ],
  password: [
    i18nize(required, m.app.Auth.passwordIsRequired)
  ]
})

class LoginForm extends Component {
  constructor (props) {
    super(props)

    this.state = {
      errorShown: false,
      focus: null
    }

    this._focusPassword = this._setFocus.bind(this, 'password')
    this._goToSignup = this._goToSignup.bind(this)
    this._goToPassResetRequest = this._goToPassResetRequest.bind(this)
    this._updateScrollForRef = this._updateScrollForRef.bind(this)
  }

  _setFocus (key) {
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _goToSignup () {
    const { resetNavigation } = this.props
    resetNavigation({
      index: 0,
      actions: [ NavigationActions.navigate({ routeName: 'SignupForm' }) ]
    })
  }

  _goToPassResetRequest () {
    const { navigation } = this.props
    navigation.navigate('PasswordResetRequest')
  }

  _updateScrollForRef (ref) {
    if (!this.refs[ref]) return
    this.props.updateScroll(this.refs[ref].getRenderedComponent())
  }

  _handlePress = (values) => {
    // here dismiss keyboard
    if (Platform.OS === 'android') {
      BFService.dismissKeyboard()
    } else if (Platform.OS === 'ios') {
      Keyboard.dismiss()
    }

    // make sure to blur the focused field on redux-form state
    // otherwise the `activeField` prop will trigger focus on a
    // field, which in turn open the keyboard and will lead to
    // focus/blur loop
    // this.props.blur(this.props.activeField)

    return new Promise((resolve, reject) => this.props.loginRequest(values.username, values.password, resolve, reject))
  }

  _renderError () {
    const { intl, error } = this.props
    const fm = intl.formatMessage
    const visible = this.state.errorShown
    const hideFn = () => this.setState({ errorShown: false })
    let errorText = error
    let actions = {}
    if (error === 'Incorrect credentials') {
      errorText = fm(m.app.Auth[error])
      actions = {
        primaryAction: {
          text: fm(m.app.Auth.yesRecover),
          onPress: () => {
            hideFn()
            this._goToPassResetRequest()
          }
        },

        secondaryAction: {
          text: fm(m.app.Auth.noTryAgain),
          onPress: hideFn
        }
      }
    }

    // const errorText = 'Sorry, you provided incorrect credentials. Can we help you recover your password?'
    return (
      <NotificationWithActions
        type='danger'
        content={errorText}
        visible={!!visible}
        onClose={hideFn}
        {...actions}
      />
    )
  }

  componentWillReceiveProps (nextProps) {
    const needShowError = props => !props.submitting && props.error

    if (nextProps.activeField && nextProps.activeField !== this.props.activeField) {
      this._updateScrollForRef(nextProps.activeField)
    }

    if (needShowError(this.props) !== needShowError(nextProps) && needShowError(nextProps)) {
      this.setState({
        errorShown: needShowError(nextProps)
      })
    }
  }

  render () {
    const { handleSubmit, submitting, intl, isOnline } = this.props
    const fm = intl.formatMessage
    return (
      <View style={[styles.form, styles.loginForm]}>
        {this._renderError()}
        <View style={[styles.authFieldContainer, styles.loginFieldWrapper]}>
          <Field
            name='username'
            iconName='id-badge'
            iconSize={18}
            iconComponent={FAIcon}
            props={this._focusProp('username')}
            style={[styles.textInput, styles.textInputLight]}
            component={AuthTextInputWithIcon}
            errorStyle={styles.textInputError}
            placeholder={fm(m.app.Auth.username)}
            placeholderTextColor={styles.$lightColor}
            autoCorrect={false}
            autoCapitalize='none'
            returnKeyType='next'
            onSubmitEditing={this._focusPassword}
            ref='username'
            withRef
            selectionColor='#fff'
            blurOnSubmit
          />
        </View>
        <View style={[styles.authFieldContainer, styles.loginFieldWrapper]}>
          <Field
            name='password'
            iconName='lock-outline'
            iconSize={18}
            iconComponent={MCIcon}
            props={this._focusProp('password')}
            style={[styles.textInput, styles.textInputLight]}
            component={AuthTextInputWithIcon}
            errorStyle={styles.textInputError}
            secureTextEntry
            placeholder={fm(m.app.Auth.password)}
            returnKeyType='done'
            placeholderTextColor={styles.$lightColor}
            autoCorrect={false}
            autoCapitalize='none'
            onSubmitEditing={handleSubmit(this._handlePress)}
            ref='password'
            withRef
            selectionColor='#fff'
            blurOnSubmit
          />
        </View>
        <AuthActionButton
          style={styles.button}
          onPress={handleSubmit(this._handlePress)}
          title={fm(m.app.Auth.logIn).toUpperCase()}
          titleStyle={[styles.buttonText, submitting && styles.buttonTextActive, !isOnline && styles.disabledButtonOpacity]}
          isSpinning={submitting}
          disabled={!isOnline}
        />
        <Text style={styles.belowButtonMessage} onPress={this._goToPassResetRequest}>
          {fm(m.app.Auth.forgotPassword).toUpperCase()}
        </Text>

        <Text style={styles.altMessage}>
          <Text style={styles.altMessageText}>{fm(m.app.Auth.dontHaveAccount)}{' '}</Text>
          <Text style={[styles.altMessageText, styles.altMessageTextUnderlined]} onPress={this._goToSignup}>{fm(m.app.Auth.signUp)}</Text>
        </Text>

      </View>
    )
  }
}

const EnhancedLoginForm = compose(
  injectIntl,
  reduxForm({
    form: FORM_IDENTIFIER,
    validate: loginFormValidator
  })
)(LoginForm)

class LoginScreen extends Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false
  }

  updateScroll (...args) {
    this.refs.container.updateScroll(...args)
  }

  render () {
    if (this.props.currentRouteName !== 'Login') {
      return null
    }
    return (
      <AuthContainer ref='container'>
        <EnhancedLoginForm {...this.props} updateScroll={this.updateScroll.bind(this)} />
      </AuthContainer>
    )
  }
}

const mapStateToProps = state => ({
  currentRouteName: getCurrentRouteName(state.nav),
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  loginRequest: UserActions.loginRequest,
  resetNavigation: StackActions.reset
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)
