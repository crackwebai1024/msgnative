import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { View, ScrollView } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import { path } from 'ramda'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'

import m from 'commons/I18n'
import { getDataItemForId } from 'commons/Redux/_Utils'
import NotificationActions from 'commons/Redux/NotificationRedux'

import Text from 'app/Components/BaseText'
import { Header, Button, ButtonGroup } from 'app/Components/DetailView'
import HeaderButton from 'app/Components/HeaderButton'
import palette from 'app/Styles/colors'
import WebRTCActions from 'app/Redux/WebRTCRedux'

import { pickDeviceContactEmailAddressAsync } from './utils'

const s = EStyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },

  infoContainer: {
    backgroundColor: 'white',
    padding: '0.8rem',
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds
  },

  infoItem: {
    marginBottom: '0.9rem'
  },

  infoTitle: {
    color: palette.asbestos
  },

  infoValue: {
    marginTop: '0.3rem'
  }

})

class DeviceContactDetail extends Component {
  constructor (props) {
    super(props)

    this._composeEmail = this._composeEmail.bind(this)
  }

  _startVideoCallWith = () => this.props.bootCallProcess(this.props.data, false, this.props.intl.formatMessage)
  _startAudioCallWith = () => this.props.bootCallProcess(this.props.data, true, this.props.intl.formatMessage)

  _startTextChatWith = () => this.props.bootChatProcess(
    this.props.data,
    true,
    'ContactList',
    this.props.intl.formatMessage
  )

  async _composeEmail () {
    const { navigation, data, intl } = this.props
    const { email } = await pickDeviceContactEmailAddressAsync(data.emailAddresses, false, intl.formatMessage)

    navigation.navigate('MailboxCompose', { recipientEmail: email })
  }

  _renderPhoneNumbers () {
    const { data } = this.props

    if (!data.phoneNumbers.length) return

    return (
      <View style={s.infoContainer}>
        {data.phoneNumbers.map(n => (
          <View style={s.infoItem} key={`${n.number}${n.label}`}>
            <Text style={s.infoTitle}>{n.label}</Text>
            <Text style={s.infoValue}>{n.number}</Text>
          </View>
        ))}
      </View>
    )
  }

  _renderEmailAddresses () {
    const { data } = this.props

    if (!data.emailAddresses.length) return

    return (
      <View style={s.infoContainer}>
        {data.emailAddresses.map(e => (
          <View style={s.infoItem} key={e.email}>
            <Text style={s.infoTitle}>{e.label}</Text>
            <Text style={s.infoValue}>{e.email}</Text>
          </View>
        ))}
      </View>
    )
  }

  _renderPostalAddresses () {
    const { data } = this.props

    if (!data.postalAddresses.length) return

    return (
      <View style={s.infoContainer}>
        {data.postalAddresses.map(a => (
          <View style={s.infoItem} key={a.label}>
            <Text style={s.infoTitle}>{a.label}</Text>
            <Text style={s.infoValue}>{a.street}{'\n'}{a.city} {a.state} {a.postCode}</Text>
          </View>
        ))}
      </View>
    )
  }

  render () {
    const {
      data, intl, appActionAvailable
    } = this.props
    const fm = intl.formatMessage

    return (
      <ScrollView style={s.main}>
        <Header name={data.display_name} email={data.email} avatar={data.thumbnailPath} />

        <ButtonGroup>
          <Button
            text={fm(m.app.Common.email)}
            iconComponent={EntypoIcon}
            iconName='mail'
            onPress={this._composeEmail}
          />

          { appActionAvailable &&
            <Button
              text={fm(m.native.Chat.call)}
              iconComponent={FontAwesomeIcon}
              iconName='phone'
              onPress={this._startAudioCallWith}
            />
          }

          { appActionAvailable &&
            <Button
              text={fm(m.native.Chat.title)}
              iconComponent={FontAwesomeIcon}
              iconName='video-camera'
              onPress={this._startVideoCallWith}
            />
          }

          { appActionAvailable &&
            <Button
              text={fm(m.native.Chat.chat)}
              iconComponent={FontAwesomeIcon}
              iconName='comment'
              onPress={this._startTextChatWith}
            />
          }
        </ButtonGroup>

        { data.company
          ? <View style={s.infoContainer}>
            <Text style={s.infoTitle}>{fm(m.native.Contact.organization)}</Text>
            <Text style={s.infoValue}>{data.company}</Text>
          </View> : null
        }

        {this._renderPhoneNumbers()}
        {this._renderEmailAddresses()}
        {this._renderPostalAddresses()}
      </ScrollView>
    )
  }
}

const IntlDeviceContactDetail = injectIntl(DeviceContactDetail)
IntlDeviceContactDetail.navigationOptions = ({ navigation, screenProps }) => ({
  tabBarVisible: false,
  title: screenProps.fm(m.native.Contact.deviceContact),
  headerLeft: <HeaderButton isBack onPress={() => navigation.goBack()} />
})

const mapStateToProps = (state, ownProps) => {
  const email = path(['navigation', 'state', 'params', 'id'], ownProps)
  const data = getDataItemForId(state.deviceContact, email)
  const appActionAvailable = data?.is_msgsafe_user

  return {
    email,
    data,
    appActionAvailable
  }
}

const mapDispatchToProps = {
  bootCallProcess: WebRTCActions.bootCallProcess,
  bootChatProcess: WebRTCActions.bootChatProcess,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlDeviceContactDetail)
