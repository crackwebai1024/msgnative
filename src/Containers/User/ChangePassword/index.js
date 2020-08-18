import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm, Field } from 'redux-form'
import dismissKeyboard from 'dismissKeyboard'

import m from 'commons/I18n'
import UserActions from 'commons/Redux/UserRedux'
import {
  createValidator,
  required,
  minLength,
  maxLength,
  equalTo,
  i18nize,
  accountPassword
} from 'commons/Lib/Validators'

import EditItemView from 'app/Components/EditView'
import FormTextInput from 'app/Components/Form/FormTextInput'

export const FORM_IDENTIFIER = 'passwordChange'

class ChangePassword extends Component {
  constructor (props) {
    super(props)

    this.state = {
      focus: null
    }

    this._focusCurrentPassword = this._setFocus.bind(this, 'currentPassword')
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

  formValuesToPayload (values) {
    return {
      old_password: values.currentPassword,
      password: values.password
    }
  }

  componentDidMount () {
    this._focusCurrentPassword()
  }

  render () {
    const { activeField, intl } = this.props
    const fm = intl.formatMessage

    return (
      <EditItemView
        ref='editView'
        createSuccessMessage={fm(m.native.ChangePassword.changePasswordSuccess)}
        editSuccessMessage={fm(m.native.ChangePassword.changePasswordSuccess)}
        formValuesToPayload={this.formValuesToPayload}
        {...this.props}
      >

        <Field
          name='currentPassword'
          component={FormTextInput}
          label={fm(m.native.ChangePassword.currentPassword)}
          secureTextEntry
          returnKeyType='next'
          autoCorrect={false}
          autoCapitalize='none'
          props={this._focusProp('currentPassword')}
          onSubmitEditing={this._focusPassword}
          blurOnSubmit
        />

        <Field
          name='password'
          ref='passwordField'
          label={fm(m.native.ChangePassword.password)}
          component={FormTextInput}
          secureTextEntry
          returnKeyType='next'
          autoCorrect={false}
          autoCapitalize='none'
          props={this._focusProp('password')}
          onSubmitEditing={this._focusPasswordAgain}
          blurOnSubmit
        />
        <Field
          name='passwordAgain'
          ref='passwordAgainField'
          label={fm(m.native.ChangePassword.passwordAgain)}
          component={FormTextInput}
          secureTextEntry
          returnKeyType='done'
          autoCorrect={false}
          autoCapitalize='none'
          props={this._focusProp('passwordAgain')}
          onSubmitEditing={dismissKeyboard}
          blurOnSubmit
        />

      </EditItemView>
    )
  }
}

const passwordChangeFormValidator = createValidator({
  currentPassword: [
    i18nize(required, m.native.ChangePasswordValidation.currentPasswordRequired)
  ],
  password: [
    i18nize(required, m.native.ChangePasswordValidation.passwordRequired),
    i18nize(minLength, m.native.ChangePasswordValidation.passwordMinLength, [8]),
    i18nize(maxLength, m.native.ChangePasswordValidation.passwordMaxLength, [64]),
    i18nize(accountPassword, m.native.ChangePasswordValidation.passwordInvalid)
  ],
  passwordAgain: [
    i18nize(required, m.native.ChangePasswordValidation.passwordAgainRequired),
    i18nize(equalTo, m.native.ChangePasswordValidation.passwordsDoNotMatch, ['password'])
  ]
})

const ChangePasswordForm = reduxForm({
  form: FORM_IDENTIFIER,
  validate: passwordChangeFormValidator
})(ChangePassword)

const IntlChangePasswordForm = injectIntl(ChangePasswordForm)
IntlChangePasswordForm.navigationOptions = (...args) => ({
  ...EditItemView.navigationOptions(...args),
  title: args[0] && args[0].screenProps && args[0].screenProps.fm(m.native.Setting.changePassword)
})

const mapDispatchToProps = {
  createItemRequest: UserActions.updateAccountRequest,
  editItemRequest: UserActions.updateAccountRequest
}

export default connect(null, mapDispatchToProps)(IntlChangePasswordForm)
