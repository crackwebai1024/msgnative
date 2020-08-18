import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View } from 'react-native'
import moment from 'moment'
import { injectIntl } from 'react-intl'
import { uuidv1ToDate } from 'commons/Lib/Utils'
import {
  getRoomTitle,
  getContactMember,
  getTotalUnreadForRoomId
} from 'commons/Selectors/Messaging'
import m from 'commons/I18n/app/Chat'
import Text from 'app/Components/BaseText'
import { ListItemStyle as s } from './style'
import { ContactListItemLite } from 'app/Components/ContactListItem'

class ChatListItem extends PureComponent {
  static propTypes = {
    timezone: PropTypes.string,
    totalUnread: PropTypes.number,
    data: PropTypes.object,
    intl: PropTypes.object,
    contactMember: PropTypes.object,
    isContactOnline: PropTypes.bool
  }

  _getMomentTime (dateTime) {
    if (!dateTime) return ''

    const { timezone } = this.props

    if (timezone) {
      return moment.tz(dateTime, timezone)
    }

    const offset = (-1 * (new Date()).getTimezoneOffset())

    return moment(dateTime).utcOffset(offset)
  }

  _formatRelative (momentTime) {
    const fm = this.props.intl.formatMessage
    if (momentTime.format('YYYY-MMM-DD') === moment().format('YYYY-MMM-DD')) {
      return momentTime.format('h:mm a')
    }
    if (momentTime.format('YYYY-MMM-DD') === moment().subtract(1, 'days').format('YYYY-MMM-DD')) {
      return fm(m['yesterday'])
    }

    return momentTime.format('M/D/YY')
  }

  _renderTimestamp () {
    const { data } = this.props
    let lastTime = uuidv1ToDate(data.last_message_id || data.room_id)

    lastTime = this._getMomentTime(lastTime)
    lastTime = this._formatRelative(lastTime)

    return (
      <View style={s.timestamp}>
        <Text>
          {lastTime}
        </Text>
      </View>
    )
  }

  _renderUnreadCount () {
    const { totalUnread } = this.props
    if (!totalUnread) return null
    return (
      <View style={s.unreadCount}>
        <View style={s.unreadCountInner}>
          <Text style={s.unreadCountText}>{totalUnread}</Text>
        </View>
      </View>
    )
  }

  render () {
    const { data, contactMember, isContactOnline } = this.props

    const liteData = {
      display_name: getRoomTitle(data, data.member_email),
      email: contactMember.email,
      isOnline: isContactOnline
    }

    return ContactListItemLite({
      data: liteData,
      children: this._renderUnreadCount() || this._renderTimestamp()
    })
  }
}

// ContactListItemLite

const mapStateToProps = (state, ownProps) => {
  const totalUnread = getTotalUnreadForRoomId(state, ownProps.data.room_id)
  const contactMember = getContactMember(ownProps.data)
  const isContactOnline = contactMember ? !!state.chat.memberPublicKey[contactMember.email] : false
  return {
    timezone: state.user.data.timezone || null,
    totalUnread,
    contactMember,
    isContactOnline
  }
}
const IntlChatListItem = injectIntl(ChatListItem)
const ConnectedChatListItem = connect(mapStateToProps)(IntlChatListItem)

export default ConnectedChatListItem
