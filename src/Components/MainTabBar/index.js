import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  View,
  TouchableOpacity
} from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome'

import { getTotalUnreadRooms } from 'commons/Selectors/Messaging'
import { getTotalUnread as getTotalUnreadEmails } from 'commons/Selectors/Mailbox'

import Text from '../BaseText'
import s from './style'

class MainTabBar extends PureComponent {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    totalUnreadRooms: PropTypes.number,
    totalUnreadEmails: PropTypes.number
  }

  constructor (props) {
    super(props)

    this._goToDashboard = this._goToDashboard.bind(this)
    this._goToMailbox = this._goToMailbox.bind(this)
    this._goToMessaging = this._goToMessaging.bind(this)
    this._goToCallHistory = this._goToCallHistory.bind(this)
    this._goToContact = this._goToContact.bind(this)
    this._goToAccount = this._goToAccount.bind(this)
    this._renderUnreadRoomsCount = this._renderUnreadRoomsCount.bind(this)
    this._renderUnreadEmailsCount = this._renderUnreadEmailsCount.bind(this)
  }

  _goToDashboard () {
    this.props.navigation.navigate('Dashboard')
  }
  _goToMailbox () {
    this.props.navigation.navigate('MailboxList')
  }
  _goToMessaging () {
    this.props.navigation.navigate('MessagingRoomList')
  }
  _goToCallHistory () {
    this.props.navigation.navigate('CallHistoryList', { missed: false })
  }
  _goToContact () {
    this.props.navigation.navigate('ContactList', { device: false })
  }
  _goToAccount () {
    this.props.navigation.navigate('UserAccount')
  }

  _renderUnreadRoomsCount () {
    const { totalUnreadRooms } = this.props
    if (!totalUnreadRooms) {
      return null
    }
    return (
      <View style={s.unreadCounter}>
        <Text style={s.unreadCounterText}>{totalUnreadRooms}</Text>
      </View>
    )
  }

  _renderUnreadEmailsCount () {
    const { totalUnreadEmails } = this.props
    if (!totalUnreadEmails) {
      return null
    }
    return (
      <View style={s.unreadCounter}>
        <Text style={s.unreadCounterText}>{totalUnreadEmails}</Text>
      </View>
    )
  }

  render () {
    const {
      navigation
    } = this.props
    const { state } = navigation
    const actRouteName = state.routes[state.index].routeName
    return (
      <View style={s.container}>

        {/*
        <TouchableOpacity style={s.tabItem} onPress={this._goToDashboard}>
          <Icon style={[s.icon, actRouteName === 'Dashboard' ? s.activeIcon : {}]} name='dashboard' />
        </TouchableOpacity>
      */}

        <TouchableOpacity style={s.tabItem} onPress={this._goToMailbox}>
          <View style={s.iconContainer}>
            <Icon style={[s.icon, actRouteName === 'Mailbox' ? s.activeIcon : {}]} name='envelope' />
            {this._renderUnreadEmailsCount()}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.tabItem} onPress={this._goToMessaging}>
          <View style={s.iconContainer}>
            <Icon style={[s.icon, actRouteName === 'Messaging' ? s.activeIcon : {}]} name='comments' />
            {this._renderUnreadRoomsCount()}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.tabItem} onPress={this._goToCallHistory}>
          <View style={s.iconContainer}>
            <Icon style={[s.icon, actRouteName === 'CallHistory' ? s.activeIcon : {}]} name='phone' />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.tabItem} onPress={this._goToContact}>
          <Icon style={[s.icon, actRouteName === 'Contact' ? s.activeIcon : {}]} name='users' />
        </TouchableOpacity>

        <TouchableOpacity style={s.tabItem} onPress={this._goToAccount}>
          <Icon style={[s.icon, actRouteName === 'Account' ? s.activeIcon : {}]} name='gear' />
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  totalUnreadRooms: getTotalUnreadRooms(state),
  totalUnreadEmails: getTotalUnreadEmails(state)
})

export default connect(mapStateToProps)(MainTabBar)
