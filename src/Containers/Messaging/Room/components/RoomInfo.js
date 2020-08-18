import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Switch, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import debounce from 'lodash.debounce'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import ChatActions from 'commons/Redux/ChatRedux'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'
import Avatar from 'app/Components/Avatar'

const s = EStyleSheet.create({
  container: {
    paddingTop: 20
  },

  section: {
    paddingVertical: '1rem',
    paddingHorizontal: '1rem',
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds
  },

  group: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  contactDisplayName: {
    marginTop: '0.25rem',
    color: palette.iosBlue
  },

  contactEmail: {
    color: palette.asbestos,
    marginTop: '0.25rem',
    fontSize: '0.75rem'
  },

  doNotDisturb: {
    marginRight: '1rem'
  },

  identityDisplayName: {
    marginTop: '0.5rem',
    fontSize: '1rem',
    color: palette.iosBlue
  },

  identityEmail: {
    marginTop: '0.25rem',
    color: palette.asbestos,
    fontSize: '0.75rem'
  },

  avatarStatus: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: -1,
    right: -1,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgb(238, 242, 246)',
    backgroundColor: 'rgb(58, 206, 1)'
  }

})

class MessagingRoomInfo extends Component {
  static propTypes = {
    data: PropTypes.object,
    updateRoomSettings: PropTypes.func,
    contact: PropTypes.object,
    navigation: PropTypes.object,
    identity: PropTypes.object,
    connected: PropTypes.bool,
    intl: PropTypes.object
  }
  constructor (props) {
    super(props)

    this.state = {
      doNotDisturb: props.data.is_muted
    }

    this._handleDoNotDisturbChange = this._handleDoNotDisturbChange.bind(this)
    this._updateIsMuted = debounce(this._updateIsMuted.bind(this), 1000)
    this._goToContact = this._goToContact.bind(this)
    this._goToIdentity = this._goToIdentity.bind(this)
    this._renderHeader = this._renderHeader.bind(this)
    this._renderDoNotDisturb = this._renderDoNotDisturb.bind(this)
    this._renderSummary = this._renderSummary.bind(this)
  }

  _handleDoNotDisturbChange (value) {
    this.setState({ doNotDisturb: !this.state.doNotDisturb }, this._updateIsMuted)
  }

  _updateIsMuted () {
    const { updateRoomSettings, data } = this.props
    if (!data || !data.room_id) {
      return
    }
    updateRoomSettings(data.room_id, { is_muted: this.state.doNotDisturb })
  }

  _goToContact () {
    const { contact, navigation, identity } = this.props
    navigation.navigate('ContactDetail', {
      // Todo: Change id -> email
      id: contact.email,
      createIfNotExisting: {
        email: contact.email,
        identity_id: identity.id,
        identity_email: identity.email,
        display_name: contact.display_name
      }
    })
  }

  _goToIdentity () {
    const { identity, navigation } = this.props
    navigation.navigate('IdentityDetail', { id: identity.id, email: identity.email })
  }

  _renderHeader () {
    const {
      contact, connected
    } = this.props
    return (
      <View style={s.section}>
        <TouchableOpacity
          style={[s.group, { flexDirection: 'column' }]}
          onPress={this._goToContact}
        >
          <View>
            <Avatar name={contact.display_name} email={contact.email} />
            {connected && <View style={s.avatarStatus} />}
          </View>
          <Text style={s.contactDisplayName}>{contact.display_name}</Text>
          <Text style={s.contactEmail}>{contact.email}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderDoNotDisturb () {
    const fm = this.props.intl.formatMessage
    return (
      <View style={s.section}>
        <View style={[s.group, { justifyContent: 'space-between' }]}>
          <Text style={s.doNotDisturb}>{fm(m.native.Chat.notDisturb).toUpperCase()}</Text>
          <Switch
            value={this.state.doNotDisturb}
            onValueChange={this._handleDoNotDisturbChange}
          />
        </View>
      </View>
    )
  }

  _renderSummary () {
    const { identity, intl } = this.props
    const fm = intl.formatMessage
    return (
      <View style={s.section}>
        <Text>{fm(m.native.Chat.communicationAs)}</Text>
        <TouchableOpacity onPress={this._goToIdentity} disabled={!identity.id}>
          <Text style={s.identityDisplayName}>{identity.display_name}</Text>
          <Text style={s.identityEmail}>{identity.email}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    return (
      <View style={s.container}>
        {this._renderHeader()}
        {this._renderDoNotDisturb()}
        {this._renderSummary()}
      </View>
    )
  }
}

const mapDispatchToProps = {
  updateRoomSettings: ChatActions.chatUpdateRoomSettingsRequest
}

export default connect(null, mapDispatchToProps)(injectIntl(MessagingRoomInfo))
