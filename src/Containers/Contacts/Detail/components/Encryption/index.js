import React, { Component } from 'react'
import {
  View,
  Alert,
  ActivityIndicator
} from 'react-native'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import EStylesheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'
import { pipe } from 'ramda'

import m from 'commons/I18n'
import { chunkStr } from 'commons/Lib/Utils'
import { identifyKeys, isPgp, isSmime } from 'commons/Lib/Crypto'
import ContactActions from 'commons/Redux/ContactRedux'
import { CRYPTOAPI } from 'commons/Redux/CryptoRedux'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

import Title from './components/Title'
import Button from './components/Button'
import Fingerprint from './components/Fingerprint'

const s = EStylesheet.create({
  container: {
    paddingVertical: '1rem',
    paddingHorizontal: '0.5rem'
  },

  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: '0.5rem'
  },

  title: {
    fontSize: '0.6rem',
    fontWeight: '800',
    color: palette.asbestos
  },

  titleIcon: {
    color: palette.asbestos,
    marginRight: '0.25rem'
  },

  errorIcon: {
    fontSize: '1rem',
    color: palette.asbestos,
    alignSelf: 'center'
  },

  keysContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start'
  },

  keyContainer: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: palette.white
  },

  gpgContainer: {
    marginRight: '0.25rem'
  },

  smimeContainer: {
    marginLeft: '0.25rem'
  },

  withOuterShadow: {
    shadowColor: palette.silver,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1
    }
  },

  keyButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.5rem'
  },

  keyButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  noKeyText: {
    fontSize: '0.75rem',
    color: palette.wetAsphalt,
    textAlign: 'center'
  }

})

class Encryption extends Component {
  constructor (props) {
    super(props)

    this.state = {
      gpg: null,
      smime: null
    }

    this._ensureCryptoKeys = this._ensureCryptoKeys.bind(this)
    this._showKey = this._showKey.bind(this)
    this._deleteKey = this._deleteKey.bind(this)
    this._addKey = this._addKey.bind(this)
    this._renderGpgKey = this._renderGpgKey.bind(this)
    this._renderNoGpgKey = this._renderNoGpgKey.bind(this)
    this._renderSmimeKey = this._renderSmimeKey.bind(this)
    this._renderNoSmimeKey = this._renderNoSmimeKey.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
  }

  _ensureCryptoKeys (nextProps) {
    const props = nextProps || this.props
    const { data, cryptoApi, isOnline } = props
    if (cryptoApi.inProgress || cryptoApi.error || !data || !isOnline) {
      return
    }
    const { keys, contacts, email } = data
    if (!email || !contacts) {
      return
    }

    if (keys) {
      const { smimeKey, pgpKey } = identifyKeys(props.data.keys)
      let gpg = null
      let smime = null
      if (pgpKey && isPgp(pgpKey)) {
        gpg = pgpKey
      }
      if (smimeKey && isSmime(smimeKey)) {
        smime = smimeKey
      }
      this.setState({ smime, gpg })
      return
    }

    const contactId = props.data.contacts[0].id

    props.cryptoRequest({
      email,
      filter: {
        contact_id: contactId,
        owner_type: CRYPTOAPI.OWNER_TYPE.CONTACT_EMAIL
      }
    })
  }

  _showKey (key) {
    const { intl } = this.props
    let title = intl.formatMessage(m.native.Crypto.gpgPublicKey)
    if (isSmime(key)) {
      title = intl.formatMessage(m.native.Crypto.smimePublicCertificate)
    }
    return () => this.props.navigation.navigate('ContactKeyViewer', { key, title })
  }

  _deleteKey (key) {
    const { data, intl, deleteCryptoRequest } = this.props
    const { display_name, email } = data
    const { id } = key
    const fm = intl.formatMessage
    let title = fm(m.native.Crypto.gpgPublicKey)
    const contactName = display_name || email
    if (isSmime(key)) {
      title = fm(m.native.Crypto.smimePublicCertificate)
    }
    return () => {
      Alert.alert(
        fm(m.native.Crypto.deleteConfirmation, { title, name: contactName }),
        '',
        [
          {
            text: fm(m.app.Common.delete),
            onPress: () => deleteCryptoRequest({ id, email, cryptoId: id })
          },
          {
            text: fm(m.app.Common.cancel),
            onPress: () => console.log('Cancel'),
            style: 'Cancel'
          }
        ]
      )
    }
  }

  _addKey (encType) {
    const { navigation, data, intl } = this.props
    const { navigate } = navigation
    const { contacts, email } = data
    const fm = intl.formatMessage
    let title = `${fm(m.app.Common.add)} ${fm(m.native.Crypto.gpgPublicKey)}`
    if (encType === CRYPTOAPI.ENC_TYPE.SMIME) {
      title = `${fm(m.app.Common.add)} ${fm(m.native.Crypto.smimePublicCertificate)}`
    }
    return () => navigate('ContactKeyAdder', {
      title,
      email,
      encType,
      contactId: contacts[0].id,
      ownerType: CRYPTOAPI.OWNER_TYPE.CONTACT_EMAIL
    })
  }

  _renderGpgKey () {
    const { intl, deleteCryptoApi } = this.props
    const { gpg } = this.state
    const fm = intl.formatMessage
    const items = []
    if (deleteCryptoApi.inProgress && deleteCryptoApi.payload.cryptoId === gpg.id) {
      items.push(<ActivityIndicator key='loader' />)
    } else {
      items.push(<Fingerprint text={chunkStr(gpg.fingerprint, 4).join(' ')} key='fingerprint' />)
      items.push(<View style={s.keyButtonsContainer} key='buttons'>
        <Button
          text={fm(m.app.Common.show)}
          color={palette.iosBlue}
          onPress={this._showKey(gpg)}
        />
        <Button
          text={fm(m.app.Common.delete)}
          color={palette.pomegranate}
          onPress={this._deleteKey(gpg)}
          danger
        />
      </View>)
    }
    return (
      <View style={[s.keyContainer, s.gpgContainer, s.withOuterShadow]}>
        <Title text={fm(m.native.Crypto.gpgPublicKey)} isLocked />
        {items}
      </View>
    )
  }

  _renderNoGpgKey () {
    const { intl, data, cryptoApi, isOnline } = this.props
    const { keys } = data
    const fm = intl.formatMessage
    const items = []
    if (!keys && !cryptoApi.error && isOnline) {
      items.push(<ActivityIndicator key='loader' />)
    } else if (!keys && (!!cryptoApi.error || !isOnline)) {
      items.push(<Icon style={s.errorIcon} name='exclamation-circle' />)
    } else {
      items.push(<Text style={s.noKeyText} key='message'>
        {fm(m.native.Crypto.noGpgPublicKeySaved)}
      </Text>)
      items.push(<View style={s.keyButtonContainer} key='buttons'>
        <Button
          onPress={this._addKey(CRYPTOAPI.ENC_TYPE.PGP)}
          text={fm(m.app.Common.add)}
        />
      </View>)
    }
    return (
      <View style={[s.keyContainer, s.gpgContainer, s.withOuterShadow]}>
        <Title
          text={fm(m.native.Crypto.gpgPublicKey)}
        />
        {items}
      </View>
    )
  }

  _renderSmimeKey () {
    const { intl, deleteCryptoApi } = this.props
    const { smime } = this.state
    const fm = intl.formatMessage
    const items = []
    if (deleteCryptoApi.inProgress && deleteCryptoApi.payload.cryptoId === smime.id) {
      items.push(<ActivityIndicator key='loader' />)
    } else {
      items.push(<Fingerprint text={chunkStr(smime.fingerprint, 4).join(' ')} key='fingerprint' />)
      items.push(<View style={s.keyButtonsContainer} key='buttons'>
        <Button
          text={fm(m.app.Common.show)}
          onPress={this._showKey(smime)}
        />
        <Button
          text={fm(m.app.Common.delete)}
          onPress={this._deleteKey(smime)}
          danger
        />
      </View>)
    }
    return (
      <View style={[s.keyContainer, s.smimeContainer, s.withOuterShadow]}>
        <Title text={fm(m.native.Crypto.smimePublicCertificate)} isLocked />
        {items}
      </View>
    )
  }

  _renderNoSmimeKey () {
    const { intl, data, cryptoApi, isOnline } = this.props
    const { keys } = data
    const fm = intl.formatMessage
    const items = []
    if (!keys && !cryptoApi.error && isOnline) {
      items.push(<ActivityIndicator key='loader' />)
    } else if (!keys && (!!cryptoApi.error || !isOnline)) {
      items.push(<Icon style={s.errorIcon} name='exclamation-circle' />)
    } else {
      items.push(<Text style={s.noKeyText} key='message'>
        {fm(m.native.Crypto.noSmimePublicCertificateSaved)}
      </Text>)
      items.push(<View style={s.keyButtonContainer} key='button'>
        <Button
          onPress={this._addKey(CRYPTOAPI.ENC_TYPE.SMIME)}
          text={fm(m.app.Common.add)}
        />
      </View>)
    }
    return (
      <View style={[s.keyContainer, s.smimeContainer, s.withOuterShadow]}>
        <Title
          text={fm(m.native.Crypto.smimePublicCertificate)}
        />
        {items}
      </View>
    )
  }

  _renderLoading () {
    return <ActivityIndicator />
  }

  componentWillMount () {
    this._ensureCryptoKeys()
  }

  componentWillReceiveProps (nextProps) {
    this._ensureCryptoKeys(nextProps)
  }

  render () {
    const fm = this.props.intl.formatMessage
    const title = fm(m.native.Crypto.encryption)
    const { keys } = this.props.data
    const { gpg, smime } = this.state
    return (
      <View style={s.container}>
        <View style={s.titleContainer}>
          <Icon style={s.titleIcon} name='lock' />
          <Text style={s.title}>{title.toUpperCase()}</Text>
        </View>
        <View style={s.keysContainer}>
          {gpg ? this._renderGpgKey() : this._renderNoGpgKey()}
          {smime ? this._renderSmimeKey() : this._renderNoSmimeKey()}
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  cryptoApi: state.contact.api.crypto,
  deleteCryptoApi: state.contact.api.deleteCrypto,
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  cryptoRequest: ContactActions.cryptoRequest,
  deleteCryptoRequest: ContactActions.deleteCryptoRequest
}

export default pipe(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(Encryption)
