import React, { PureComponent } from 'react'
import { View, TouchableOpacity, Platform } from 'react-native'
import { BlurView } from 'react-native-blur'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { ifIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import palette from 'app/Styles/colors'
import Avatar from 'app/Components/Avatar'
import Text from 'app/Components/BaseText'
import HeaderButton from 'app/Components/HeaderButton'
import { HEADER_HEIGHT, Z_INDEX_HEADER } from '../constants'
import SwitchTabs from './SwitchTabs'

export const s = EStyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    ...ifIphoneX({
      paddingTop: 25 + getStatusBarHeight()
    }, {
      paddingTop: 25
    }),
    zIndex: Z_INDEX_HEADER,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#fff',
    position: 'relative'
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: '1rem'
  },

  blur: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: HEADER_HEIGHT
  },

  chateeZone: {
    marginLeft: Platform.OS === 'ios' ? '1rem' : '-1.8rem',
    flexDirection: 'column',
    alignItems: 'center'
  },

  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.15rem'
  },

  titleText: {
    marginLeft: '.3rem',
    color: '#20305a',
    fontSize: '.79rem',
    fontWeight: '500',
    backgroundColor: 'transparent'
  },

  titleIcon: {
    color: '#20305a'
  },

  avatarContainer: {
    position: 'relative'
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },

  onlineIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: -1,
    right: -1,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgb(238, 242, 246)',
    backgroundColor: 'rgb(58, 206, 1)'
  },

  backButton: {
    marginLeft: '-1rem',
    width: 23
  }
})

const InfoButton = ({ onOpenRoomInfo, style }) => (
  <TouchableOpacity style={style} onPress={onOpenRoomInfo}>
    <Icon name='info' size={23} style={{ color: palette.ceruleanBlue }} />
  </TouchableOpacity>
)
InfoButton.propTypes = {
  onOpenRoomInfo: PropTypes.func,
  style: PropTypes.object
}

class MessagingRoomHeader extends PureComponent {
  static propTypes = {
    onOpenRoomInfo: PropTypes.func.isRequired,
    contact: PropTypes.object,
    navigation: PropTypes.object,
    identity: PropTypes.object,
    turnOnE2ee: PropTypes.func,
    turnOffE2ee: PropTypes.func,
    connected: PropTypes.bool,
    e2ee: PropTypes.bool,
    intl: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._goToContactDetail = this._goToContactDetail.bind(this)
    this._goBack = this._goBack.bind(this)
    this._onTabSelected = this._onTabSelected.bind(this)
  }

  _goToContactDetail () {
    const { contact, navigation, identity } = this.props

    /* TODO: Have to prevent identity: null in props
     * e.g: When the identity is removed after room is created
     */
    if (!identity) {
      console.log('_goToContactDetail: No Identity Id!', this.props)
      return
    }

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

  _goBack () {
    this.props.navigation.goBack()
  }

  // shouldComponentUpdate (nextProps) {
  //   if (this.props.contact && nextProps.contact) { // temporary fix for chatroom header avatar flickering issue when ws reconnecting
  //     return this.props.contact.email === nextProps.contact.email && this.props.contact.display_name === nextProps.contact.display_name
  //   } else {
  //     return false
  //   }
  // }

  _onTabSelected (selectedIndex) {
    if (selectedIndex) {
      this.props.turnOnE2ee()
    } else {
      this.props.turnOffE2ee()
    }
  }

  _renderBlur () {
    if (Platform.OS !== 'ios') {
      return null
    }

    return <BlurView style={s.blur} blurType='xlight' blurAmount={30} />
  }

  _renderChatee () {
    const { contact, connected } = this.props

    return (
      <TouchableOpacity style={s.chateeZone} onPress={this._goToContactDetail}>
        <View style={s.avatarContainer}>
          <Avatar avatarStyle={s.avatar} name={contact.display_name} email={contact.email} />
          {connected && <View style={s.onlineIndicator} />}
        </View>
        <View style={s.titleContainer}>
          <Icon name='lock' style={s.icon} size={13} />
          <Text style={s.titleText}>{contact.display_name}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _generateTabProps () {
    const isOnline = this.props.connected
    const fm = this.props.intl.formatMessage

    const tabs = [
      { label: fm(m.native.Chat.encrypted), unreadCount: isOnline ? path(['data', 'regular', 'unreadCount'], this.props) : 0 },
      { label: fm(m.native.Chat.ephemeral), unreadCount: isOnline ? path(['data', 'e2ee', 'unreadCount'], this.props) : 0 }
    ]

    return {
      tabs,
      selected: this.props.e2ee ? 1 : 0
    }
  }

  render () {
    return (
      <View style={s.container}>
        {this._renderBlur()}
        <View style={s.actionContainer}>
          <HeaderButton isBack onPress={this._goBack} style={s.backButton} />
          {this._renderChatee()}
          <InfoButton onOpenRoomInfo={this.props.onOpenRoomInfo} />
        </View>
        <SwitchTabs {...this._generateTabProps()} onSelect={this._onTabSelected} />
      </View>
    )
  }
}

export default injectIntl(MessagingRoomHeader)
