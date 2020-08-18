import React, { Component } from 'react'
import {
  View,
  Button,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  ActivityIndicator
} from 'react-native'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import EStylesheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'
import { pipe } from 'ramda'

import m from 'commons/I18n'
import ContactActions from 'commons/Redux/ContactRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { CRYPTOAPI } from 'commons/Redux/CryptoRedux'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStylesheet.create({
  container: {
    display: 'flex',
    backgroundColor: palette.white
  },

  buttonsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  button: {
    paddingVertical: '0.5rem',
    paddingHorizontal: '1rem',
    backgroundColor: palette.ceruleanBlue,
    borderRadius: 5
  },

  buttonText: {
    fontSize: '1rem',
    color: palette.white,
    fontWeight: '600'
  },

  textContainer: {
    padding: '1rem'
  },

  text: {
    fontSize: '0.5rem',
    textAlign: 'center'
  },

  inProgressContainer: {
    padding: '1rem'
  }
})

const InProgress = () => (
  <View style={s.inProgressContainer} >
    <ActivityIndicator />
  </View>
)

const navigationOptions = ({ navigation, screenProps: { fm } }) => {
  const { title, text, addKey, savingInProgress } = navigation.state.params
  let headerRight = null
  if (addKey) {
    headerRight = <Button title={fm(m.app.Common.save)} onPress={addKey} disabled={!text} />
  }
  if (savingInProgress) {
    headerRight = <InProgress />
  }
  const options = {
    title,
    tabBarVisible: false,
    headerLeft: <Button title={fm(m.app.Common.cancel)} onPress={() => navigation.goBack()} />,
    headerRight
  }
  return options
}

class KeyAdder extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        params: PropTypes.shape({
          title: PropTypes.string.isRequired,
          email: PropTypes.string.isRequired,
          contactId: PropTypes.number.isRequired,
          encType: PropTypes.number.isRequired,
          ownerType: PropTypes.number.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      text: null
    }

    this._addKey = this._addKey.bind(this)
    this._addKeyResolve = this._addKeyResolve.bind(this)
    this._addKeyReject = this._addKeyReject.bind(this)
    this._handleFromClipboard = this._handleFromClipboard.bind(this)
    this._renderButtons = this._renderButtons.bind(this)
    this._renderText = this._renderText.bind(this)
  }

  _addKey () {
    const {
      email,
      contactId,
      encType,
      ownerType
    } = this.props.navigation.state.params
    this.props.navigation.setParams({ savingInProgress: true, text: null })
    this.props.addCryptoRequest({
      email,
      public: this.state.text,
      contact_id: contactId,
      enc_type: encType,
      owner_type: ownerType
    },
    this._addKeyResolve,
    this._addKeyReject
    )
  }

  _addKeyResolve () {
    const { intl, navigation, displayNotification } = this.props
    const { encType } = navigation.state.params
    const fm = intl.formatMessage
    let message = fm(m.native.Contact.keyAdded, { key: fm(m.native.Crypto.gpgPublicKey) })
    if (encType === CRYPTOAPI.ENC_TYPE.SMIME) {
      message = fm(m.native.Contact.keyAdded, { key: fm(m.native.Crypto.smimePublicCertificate) })
    }
    navigation.setParams({ savingInProgress: false })
    displayNotification(message, 'info', 3000)
    this.props.navigation.goBack()
  }

  _addKeyReject (err) {
    const { intl, navigation, displayNotification } = this.props
    const { encType } = navigation.state.params
    const fm = intl.formatMessage
    let message = fm(m.native.Contact.couldNotAdd, { key: fm(m.native.Crypto.gpgPublicKey), err })
    if (encType === CRYPTOAPI.ENC_TYPE.SMIME) {
      message = fm(m.native.Contact.couldNotAdd, { key: fm(m.native.Crypto.smimePublicCertificate), err })
    }
    navigation.setParams({ savingInProgress: false })
    displayNotification(message, 'danger', 3000)
    this.props.navigation.goBack()
  }

  async _handleFromClipboard () {
    try {
      const text = await Clipboard.getString()
      this.setState({ text })
    } catch (err) {
      console.error('Error pasting from Clipboard:', err)
    }
  }

  _renderButtons () {
    return (
      <View style={s.buttonsContainer}>
        <TouchableOpacity style={s.button} onPress={this._handleFromClipboard}>
          <Text style={s.buttonText}>Paste from Clipboard</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderText () {
    return (
      <View style={s.textContainer}>
        <Text style={s.text}>
          {this.state.text}
        </Text>
      </View>
    )
  }

  componentWillMount () {
    this.props.navigation.setParams({
      addKey: this._addKey,
      text: null
    })
  }

  componentDidUpdate () {
    const { navigation } = this.props
    if (navigation.state.params && navigation.state.params.text !== undefined && navigation.state.params.text !== this.state.text) {
      navigation.setParams({
        text: this.state.text
      })
    }
  }

  render () {
    const { text } = this.state
    let contentStyle = {}
    if (!text) {
      contentStyle.flex = 1
    }
    return (
      <ScrollView style={s.container} contentContainerStyle={contentStyle}>
        {text ? this._renderText() : this._renderButtons()}
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => ({
  addCryptoApi: state.contact.api.addCrypto
})

const mapDispatchToProps = {
  addCryptoRequest: ContactActions.addCryptoRequest,
  displayNotification: NotificationActions.displayNotification
}

KeyAdder = pipe(
  connect(null, mapDispatchToProps),
  injectIntl
)(KeyAdder)

KeyAdder.navigationOptions = navigationOptions

export default KeyAdder
