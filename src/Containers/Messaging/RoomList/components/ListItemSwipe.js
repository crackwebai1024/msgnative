import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'
import ChatActions from 'commons/Redux/ChatRedux'

import { ListItemSwipe as swipeStyle } from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'
import Spinner from 'app/Components/Spinner'

class ChatListItemSwipe extends Component {
  static propTypes = {
    dataKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    data: PropTypes.object.isRequired,
    chatDeleteRequest: PropTypes.func.isRequired,
    displayNotification: PropTypes.func.isRequired,
    onCloseSwipeRequested: PropTypes.func,
    intl: PropTypes.object,
    wsOnline: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this._handleDelete = this._handleDelete.bind(this)
  }

  _handleDelete () {
    const {
      dataKey,
      chatDeleteRequest,
      displayNotification,
      intl
    } = this.props
    const resolve = () => displayNotification(intl.formatMessage(m.app.Common.deleted), 'danger', 3000)
    chatDeleteRequest(dataKey, resolve)
  }

  componentWillUnmount () {
    this.props.onCloseSwipeRequested && this.props.onCloseSwipeRequested()
  }

  render () {
    const { wsOnline, data: { isLeavingRoom } } = this.props
    const fm = this.props.intl.formatMessage
    const disabled = !wsOnline || isLeavingRoom

    return (
      <View style={[swipeStyle.container, { justifyContent: 'flex-end' }]}>
        <TouchableOpacity
          style={[swipeStyle.button, swipeStyle.buttonDanger, disabled && swipeStyle.actionDisabledIcon]}
          onPress={this._handleDelete}
          disabled={disabled}
        >
          {!isLeavingRoom && <Icon style={swipeStyle.icon} name='trash' />}
          {!isLeavingRoom && <Text style={swipeStyle.text}>{fm(m.app.Common.delete)}</Text>}
          {isLeavingRoom && <Spinner containerStyle={swipeStyle.spinnerAnimatedContainer} iconStyle={swipeStyle.spinnerIcon} />}
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  wsOnline: state.chat.socketConnected
})

const mapDispatchToProps = {
  chatDeleteRequest: ChatActions.chatLeaveRoomRequest,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ChatListItemSwipe))
