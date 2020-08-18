import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Button, Alert, ActivityIndicator } from 'react-native'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import * as R from 'ramda'
import { compose, setStatic } from 'recompose'
import { isEmail } from 'validator'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'
import m from 'commons/I18n'
import UserEmailActions from 'commons/Redux/UserEmailRedux'

import Text from 'app/Components/BaseText'
import EmailItem from './components/EmailItem'
// import EmailField from './components/EmailField'
import AdvantagePoint from './components/AdvantagePoint'
import SignupESPCreationForm from './components/SignupESPCreationForm'

import s from './styles'

class SignupESPImported extends Component {
  static propTypes = {
    username: PropTypes.string,
    createESP: PropTypes.func,
    navigation: PropTypes.object,
    setDefaultESP: PropTypes.func,
    intl: PropTypes.object,
    userEmails: PropTypes.object,
    isOnline: PropTypes.bool
  }
  constructor (props) {
    super(props)

    this.state = {
      showLoading: true
    }

    this._setDefaultESP = this._setDefaultESP.bind(this)
    this._enableNextButton = this._enableNextButton.bind(this)
  }

  componentDidMount () {
    const { username } = this.props
    const checkAlreadyAdded = R.compose(
      R.find(R.propEq('email', username)),
      R.values,
      R.path(['data'])
    )

    if (!isEmail(username) || checkAlreadyAdded(username)) {
      this.setState({ showLoading: false })
      return
    }

    this._addDefaultESP(username)
  }

  _addDefaultESP (email) {
    const { createESP } = this.props

    const payload = {
      email,
      display_name: '',
      is_default: true
    }

    createESP(
      payload,
      () => { this._enableNextButton(); this.setState({ showLoading: false }) },
      ({ errors }) => { Alert.alert(errors._error || 'Error occured while creating ESP'); this.setState({ showLoading: false }) }
    )
  }

  _enableNextButton () {
    this.props.navigation.setParams({ nextButtonEnabled: true })
  }

  _setDefaultESP (data) {
    this.props.setDefaultESP(data.id)
  }

  render () {
    const { intl, userEmails, createESP, isOnline } = this.props
    const fm = intl.formatMessage
    const { showLoading } = this.state
    if (showLoading) {
      return (
        <View style={s.spinnerContainer}>
          <ActivityIndicator animating />
        </View>
      )
    }

    return (
      <View style={s.container}>
        <View style={s.emailSection}>
          <Text style={s.emailSectionTitle}>{fm(m.native.Auth.addEmailAddressToMakeItEasy)}</Text>
          {(userEmails.dataOrder || []).map(id => (
            <EmailItem key={id} data={userEmails.data[id]} setDefaultESP={this._setDefaultESP} />
          ))}
          <View style={s.emailSectionDivider} />
          <SignupESPCreationForm
            intl={intl}
            userEmails={userEmails}
            createESP={createESP}
            enableNextButton={this._enableNextButton}
            isOnline={isOnline}
          />
        </View>
        <View style={s.advantagesSection}>
          <Text style={[s.advantagesPointText, s.advantagesTopText]}>
            {fm(m.native.Auth.receiveVerificationEmail)}
          </Text>
          <Text style={s.advantagesSectionTitle}>{fm(m.native.Auth.advantageOfAddingEmailAddress)}</Text>
          <AdvantagePoint>{fm(m.native.Auth.communicateSecurely)}</AdvantagePoint>
          <AdvantagePoint>{fm(m.native.Auth.forwardEncryptedMail)}</AdvantagePoint>
          <AdvantagePoint>{fm(m.native.Auth.recoverYourAccount)}</AdvantagePoint>
          <Text style={[s.advantagesPointText, s.advantagesBottomText]}>
            {fm(m.native.Auth.neverSellOrShareYourInfo)}
          </Text>
        </View>
      </View>
    )
  }
}

const promptForConfirm = (navigation, fm) => () => {
  const nextButtonEnabled = R.path(['state', 'params', 'nextButtonEnabled'], navigation)

  if (nextButtonEnabled) {
    return navigation.navigate('SignupIdentity')
  }

  return Alert.alert(
    fm(m.native.Auth.recoverEmailWarning),
    fm(m.native.Auth.notProvidedEmailAddress),
    [
      {
        text: fm(m.native.Auth.notNow),
        onPress: () => navigation.navigate('SignupIdentity')
      },
      {
        text: fm(m.native.Auth.addEmail),
        style: 'cancel',
        onPress: () => {}
      }
    ]
  )
}

const NextHeaderButton = withNetworkState(({ fm, navigation, networkOnline }) => (
  <Button
    title={R.path(['state', 'params', 'nextButtonEnabled'], navigation) ? fm(m.app.Common.next) : fm(m.app.Common.skip)}
    onPress={promptForConfirm(navigation, fm)}
    style={{ marginRight: 50 }}
    disabled={!networkOnline}
  />
))

const navigationOptions = ({ navigation, screenProps: { fm } }) => ({
  title: fm(m.native.Auth.addYourEmail),
  navBarVisible: true,
  tabBarVisible: false,
  headerLeft: null,
  headerRight: (
    <NextHeaderButton
      fm={fm}
      navigation={navigation}
    />
  ),
  headerMode: 'float'
})

const mapStateToProps = state => ({
  userEmails: state.useremail,
  username: R.path(['user', 'data', 'username'], state),
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  createESP: UserEmailActions.useremailCreate,
  setDefaultESP: UserEmailActions.useremailSetDefault
}

export default compose(
  setStatic('navigationOptions', navigationOptions),
  injectIntl,
  connect(mapStateToProps, mapDispatchToProps)
)(SignupESPImported)
