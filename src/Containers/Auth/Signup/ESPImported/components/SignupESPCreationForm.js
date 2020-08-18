import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { reduxForm, Field } from 'redux-form'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Text from 'app/Components/BaseText'
import { createValidator, email, required, i18nize } from 'commons/Lib/Validators'
import m from 'commons/I18n'
import EmailField from './EmailField'
import styles from '../styles'

class _SignupESPCreationForm extends Component {
  static propTypes = {
    userEmails: PropTypes.object,
    createESP: PropTypes.func,
    reset: PropTypes.func,
    enableNextButton: PropTypes.func,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    error: PropTypes.object,
    isOnline: PropTypes.bool,
    intl: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._handleSubmit = this._handleSubmit.bind(this)
  }

  _handleSubmit (values) {
    const payload = {
      email: values.email,
      display_name: ''
    }
    if (!this.props.userEmails.dataOrder || !this.props.userEmails.dataOrder.length) {
      payload.is_default = true
    }
    return new Promise((resolve, reject) => this.props.createESP(payload, () => {
      resolve()
      this.props.reset()
      this.props.enableNextButton()
    }, reject))
  }

  render () {
    const {
      handleSubmit, submitting, error, intl, isOnline
    } = this.props
    const fm = intl.formatMessage

    return (
      <View style={styles.addEmail}>
        <View>
          <Text style={styles.addEmailText}>{fm(m.native.Auth.addEmailAddress)}</Text>
          <Field
            name='email'
            style={styles.addEmailField}
            component={EmailField}
            placeholder='you@mail.com'
            // placeholderTextColor="#34495e"
            returnKeyType='go'
            keyboardType='email-address'
            autoCorrect={false}
            autoCapitalize='none'
            enablesReturnKeyAutomatically
            onSubmitEditing={handleSubmit(this._handleSubmit)}
            blurOnSubmit
          />
          { error && <Text style={styles.addEmailError}>{error}</Text> }
        </View>
        <View style={styles.addEmailAction}>
          { submitting ? <ActivityIndicator animating /> : (
            <TouchableOpacity onPress={handleSubmit(this._handleSubmit)}
              activeOpacity={0.7}
              disabled={!isOnline}
            >
              <FontAwesome name='plus-circle' style={[styles.addEmailButtonIcon, !isOnline && styles.disabledButtonOpacity]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }
}

const validator = createValidator({
  email: [
    i18nize(required, m.app.CommonValidation.emailRequired),
    i18nize(email, m.app.CommonValidation.emailInvalid)
  ]
})

export default reduxForm({
  form: 'SignupESPCreationForm',
  validate: validator
})(_SignupESPCreationForm)
