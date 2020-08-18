import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import * as R from 'ramda'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import MIcon from 'react-native-vector-icons/MaterialIcons'
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import m from 'commons/I18n'
import IdentityActions from 'commons/Redux/IdentityRedux'
import UserActions from 'commons/Redux/UserRedux'
import AppActions from 'commons/Redux/AppRedux'
import { createValidator, required, minLength, emailUsername, i18nize } from 'commons/Lib/Validators'
import { getCurrentRouteName } from 'app/Navigation/utils'
import Text from 'app/Components/BaseText'

import styles from '../../_Base/styles'
import localStyles from './styles'
import { AuthContainer, AuthPicker, AuthTextInputWithIcon, AuthActionButton } from '../../_Base'

export const FORM_IDENTIFIER = 'SignupIdentity'
const DEFAULT_DOMAIN = typeof __DEV__ !== 'undefined' && __DEV__ ? 'stage.msgsafe.io' : 'msgsafe.io'

const signupFormValidator = createValidator({
  localpart: [
    i18nize(required, m.app.AuthValidation.mailboxIsRequired),
    i18nize(minLength, m.native.Auth.emailUsernameMinLength, [4]),
    i18nize(emailUsername, m.native.Auth.emailUsernameValid)
  ]
})

class SignupForm extends Component {
  static propTypes = {
    createIdentity: PropTypes.func,
    onBoardingComplete: PropTypes.func,
    intl: PropTypes.object,
    formLocalpart: PropTypes.string,
    formDomain: PropTypes.string,
    valid: PropTypes.bool,
    asyncValidate: PropTypes.func,
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    asyncValidating: PropTypes.any,
    currentRouteName: PropTypes.string,
    domains: PropTypes.any,
    activeField: PropTypes.any,
    isOnline: PropTypes.bool
  }
  constructor (props) {
    super(props)

    this.state = {
      focus: null,
      identityLoading: false
    }

    this._handlePress = this._handlePress.bind(this)
    this._focusDomain = this._setFocus.bind(this, 'domain')
    this._focusLocalpart = this._setFocus.bind(this, 'localpart')
  }

  _setFocus (key) {
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _updateScrollForRef (ref) {
    if (!this.refs[ref] || !this.refs.container) return
    this.refs.container.updateScroll(this.refs[ref].getRenderedComponent())
  }

  _getDomainData (domains) {
    if (!domains) return []
    return domains.map(d => ({
      title: d.name,
      value: d.name
    }))
  }

  _handlePress (values) {
    const { createIdentity, onBoardingComplete } = this.props

    const p = {
      display_name: values.display_name,
      region: 'cw',
      email: `${values.localpart}@${values.domain}`,
      http_pickup: true,
      next_hop_exit: false
    }

    return new Promise((resolve, reject) => createIdentity(p, () => {
      resolve()
      onBoardingComplete()
    }, reject))
  }

  _renderFullEmailAddress () {
    const {
      formLocalpart, formDomain, valid, intl
    } = this.props
    if (!valid || !formLocalpart || !formDomain) return null

    return (
      <View>
        <Text style={styles.fieldHelpText}>{intl.formatMessage(m.native.Auth.yourEmailAddressWillBe)}</Text>
        <Text style={[styles.fieldHelpText, localStyles.fieldHelpTextHighlighted]}>{formLocalpart}@{formDomain}</Text>
      </View>
    )
  }

  async _tryGetAvailableIdentity () {
    const { validateIdentityRequest, initialValues } = this.props
    const identityEmail = `${initialValues.localpart}@${initialValues.domain}`
    const possibleIdentityEmails = [identityEmail].concat(R.compose(
      R.map(n => (`${initialValues.localpart}${n}@${initialValues.domain}`)),
      R.slice(0, 5),
      R.sort(() => Math.random() - 0.5)
    )(R.range(1, 50))) // Generate random number appended possible identity emails

    const identityAsyncValidate = email => new Promise((resolve, reject) => validateIdentityRequest({ email }, () => resolve(email), reject))
    // const IDENTITY_NOT_AVAILABLE_MSG = 'The email address is not available'
    let availableEmail

    this.setState({ identityLoading: true })

    for (const email of possibleIdentityEmails) {
      if (!availableEmail) {
        try {
          const ret = await identityAsyncValidate(email)
          if (ret) {
            availableEmail = ret
          }
        } catch (e) {
          continue
        }
      }
    }

    if (availableEmail) {
      availableEmail !== identityEmail && this.props.change('localpart', availableEmail.replace(/@.*$/, ''))
    } else {
      this.props.asyncValidate()
    }

    this.setState({ identityLoading: false })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.activeField && nextProps.activeField !== this.props.activeField) {
      this._updateScrollForRef(nextProps.activeField)
    }

    // if (this.props.formLocalpart !== nextProps.formLocalpart && nextProps.formLocalpart) {
    //   this.props.asyncValidate()
    // }
  }

  componentDidMount () {
    // this.props.asyncValidate()
    // this.props.touch('localpart')
    this._tryGetAvailableIdentity()
  }

  render () {
    const {
      handleSubmit, submitting, intl, valid, asyncValidating, currentRouteName, isOnline
    } = this.props
    const { identityLoading } = this.state

    const fm = intl.formatMessage

    const disabled = (!valid || asyncValidating || identityLoading)

    if (currentRouteName !== 'SignupIdentity') {
      return null
    }

    return (
      <AuthContainer hideFooter ref='container' logoProps={{ align: 'center', small: true }}>
        <View style={localStyles.container}>

          <Text style={styles.pageTitleText}>{fm(m.native.Auth.createFirstEmailAndIdentity)}</Text>
          <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
            <Field
              name='display_name'
              iconName='person-outline'
              iconSize={20}
              iconComponent={MIcon}
              props={this._focusProp('display_name')}
              style={[styles.textInput, styles.textInputLight]}
              errorStyle={styles.textInputError}
              component={AuthTextInputWithIcon}
              placeholder={fm(m.native.Preferences.displayName)}
              placeholderTextColor={styles.$lightColor}
              returnKeyType='next'
              onSubmitEditing={this._focusLocalpart}
              ref='display_name'
              withRef
              selectionColor='#fff'
              blurOnSubmit
            />
            { this._renderFullEmailAddress() }
          </View>

          <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
            <Field
              name='localpart'
              iconName='id-badge'
              iconSize={18}
              iconComponent={FAIcon}
              props={this._focusProp('localpart')}
              style={[styles.textInput, styles.textInputLight]}
              errorStyle={styles.textInputError}
              component={AuthTextInputWithIcon}
              placeholder='...'
              placeholderTextColor={styles.$lightColor}
              returnKeyType='next'
              autoCorrect={false}
              autoCapitalize='none'
              onSubmitEditing={this._focusDomain}
              ref='localpart'
              withRef
              selectionColor='#fff'
              loading={identityLoading}
              blurOnSubmit
            />
          </View>
          <View style={[styles.authFieldContainer, styles.onboardingFieldWrapper]}>
            <Field
              name='domain'
              iconName='web'
              iconSize={18}
              iconComponent={MCIcon}
              component={AuthPicker}
              title={fm(m.native.Preferences.selectDomain)}
              initialMessage={fm(m.native.Auth.selectYourChoiceOfDomain)}
              linkText={fm(m.native.Preferences.selectDomain)}
              returnKeyType='next'
              props={this._focusProp('domain')}
              options={this._getDomainData(this.props.domains)}
            />
          </View>
          <AuthActionButton
            style={[
              styles.button,
              disabled && styles.buttonDisabled
            ]}
            onPress={(...args) => !disabled && handleSubmit(this._handlePress)(...args)}
            title={fm(m.native.Snackbar.next).toUpperCase()}
            titleStyle={[
              styles.buttonText,
              submitting && styles.buttonTextActive,
              disabled && styles.buttonTextDisabled,
              !isOnline && styles.disabledButtonOpacity
            ]}
            isSpinning={submitting}
            disabled={!isOnline}
          />
          <Text style={localStyles.fieldHelpText}>{fm(m.native.Auth.signupFormHelpText)}</Text>
          {/* <ProgressDots activeIndex={3} totalCount={4} style={localStyles.dots} /> */}
        </View>
      </AuthContainer>

    )
  }
}

const NewSignupForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: signupFormValidator,
  asyncValidate: (values, dispatch, props) => {
    // Dispatch the request along with resolve & reject
    // and the saga will take care of using the one appropriately

    if (values.localpart && values.domain && props.isOnline) {
      return new Promise((resolve, reject) => props.emailCheckForIdentity(
        `${values.localpart}@${values.domain}`, resolve, ({ email }) => reject({ localpart: email })
      ))
    }

    // use Promise.all to work with multiple promises
    return Promise.resolve()
  },
  shouldAsyncValidate: (params) => {
    if (!params.syncValidationPasses) return false
    return params.trigger === 'blur'
  },
  asyncBlurFields: ['localpart', 'domain']
})(SignupForm)

const IntlSignupForm = injectIntl(NewSignupForm)
IntlSignupForm.navigationOptions = {
  header: null,
  tabBarVisible: false
}

const mapDispatchToProps = {
  onBoardingComplete: AppActions.onBoardingComplete,
  createIdentity: IdentityActions.identityCreate,
  validateIdentityRequest: IdentityActions.validateIdentityRequest,
  emailCheckForIdentity: UserActions.emailCheckForIdentity
}

const localpart = R.pipe(
  R.path(['user', 'data', 'username']), // Prepopulate from username
  R.replace(/[^0-9a-z]/gi, ''), // Strip away any non-alphanumeric characters
  R.replace(/@.*$/, '')
)

const mapStateToProps = (state) => ({
  initialValues: {
    // email consists of localpart@domain
    localpart: localpart(state),
    domain: DEFAULT_DOMAIN
  },
  domains: R.path(['user', 'data', 'system_domains'], state),
  formLocalpart: R.path(['form', FORM_IDENTIFIER], state) && R.path(['form', FORM_IDENTIFIER, 'values', 'localpart'], state),
  formDomain: R.path(['form', FORM_IDENTIFIER], state) && R.path(['form', FORM_IDENTIFIER, 'values', 'domain'], state),
  currentRouteName: getCurrentRouteName(state.nav),
  isOnline: state.app.isNetworkOnline
})

export default connect(mapStateToProps, mapDispatchToProps)(IntlSignupForm)
