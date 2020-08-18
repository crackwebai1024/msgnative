import React, { Component } from 'react'
import { View } from 'react-native'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import Text from 'app/Components/BaseText'
import styles from './_Base/styles'
import { AuthContainer, AuthActionButton } from './_Base'

class LoginScreen extends Component {
  updateScroll (...args) {
    this.refs.container.updateScroll(...args)
  }

  render () {
    const { intl, navigation } = this.props
    const fm = intl.formatMessage
    return (
      <AuthContainer ref='container'>
        <View style={styles.initialScreenTopTextContainer}>
          <Text style={styles.initialScreenTopText}>{fm(m.app.Auth.privateEncryptedOnlineCommunication)}</Text>
          <Text style={styles.initialScreenTopText}>{fm(m.app.Auth.forEveryone)}</Text>
        </View>
        <AuthActionButton
          style={[styles.button, styles.buttonAlt]}
          underlayColor='rgba(255, 255, 255, 1)'
          onPress={() => navigation.navigate('SignupForm')}
          titleStyle={[styles.buttonText, styles.buttonTextAlt, styles.signUpButton]}
          title={fm(m.app.Auth.signUp).toUpperCase()}
        />
        <View style={styles.horizontalRuleContainer}>
          <View style={styles.horizontalRule} />
          <Text style={styles.horizontalRuleText}>&nbsp; {fm(m.native.Auth.or)} &nbsp;</Text>
          <View style={styles.horizontalRule} />
        </View>
        <AuthActionButton
          style={[styles.button, styles.buttonLogin]}
          onPress={() => navigation.navigate('Login')}
          titleStyle={styles.buttonText}
          title={fm(m.app.Auth.logIn).toUpperCase()}
        />
      </AuthContainer>
    )
  }
}

const IntlLoginScreen = injectIntl(LoginScreen)
IntlLoginScreen.navigationOptions = {
  header: null,
  tabBarVisible: false
}

export default IntlLoginScreen
