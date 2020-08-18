import React, { Component } from 'react'
import { View, ActivityIndicator, Image, Keyboard } from 'react-native'
import PropTypes from 'prop-types'
import { path, isNil } from 'ramda'
import { connect } from 'react-redux'

import m from 'commons/I18n'
import { getContactMember, getRoomByMapKey } from 'commons/Selectors/Messaging'
import { getDataItemForId } from 'commons/Redux/_Utils'
import ChatActions from 'commons/Redux/ChatRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'
import UserEmailActions from 'commons/Redux/UserEmailRedux'

import Drawer from 'app/Components/Drawer'

import RoomHeader from './components/RoomHeader'
import RoomInfo from './components/RoomInfo'
import RegularRoom from './components/RegularRoom'
import EphemeralRoom from './components/EphemeralRoom'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { injectIntl, intlShape } from 'react-intl'

import s from './styles'
import { Z_INDEX_ROOM_INFO } from './constants'

class MessagingRoom extends Component {
  static propTypes = {
    data: PropTypes.object,
    ephemeralData: PropTypes.object,
    contact: PropTypes.object,
    identityCache: PropTypes.object,
    getIdentityApi: PropTypes.object,
    getUserEmailApi: PropTypes.object,
    isEphemeral: PropTypes.bool,

    chatGetMessagesRequest: PropTypes.func.isRequired,
    chatCreateRoomRequest: PropTypes.func.isRequired,
    getUserEmail: PropTypes.func.isRequired,
    getIdentity: PropTypes.func.isRequired,
    canMemberChat: PropTypes.func,
    chatLeaveRoom: PropTypes.func,
    displayNotification: PropTypes.func,
    navigation: PropTypes.object.isRequired,
    intl: intlShape,
    connected: PropTypes.bool,
    e2ee: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      e2ee: false,
      roomInfoOpen: false,
      e2eeTerminated: false
    }

    this.regularRoomLastScrollY = null
    this._turnOnE2ee = this._turnOnE2ee.bind(this)
    this._turnOffE2ee = this._turnOffE2ee.bind(this)
    this._openRoomInfo = this._openRoomInfo.bind(this)
    this._closeRoomInfo = this._closeRoomInfo.bind(this)
    this._ensureChatData = this._ensureChatData.bind(this)
    this._ensureIdentity = this._ensureIdentity.bind(this)
    this._getIdentity = this._getIdentity.bind(this)
    this._renderLoader = this._renderLoader.bind(this)
    this._onRegularRoomScroll = this._onRegularRoomScroll.bind(this)
    this._removeChatRoom = this._removeChatRoom.bind(this)
  }

  _removeChatRoom (roomId) {
    const { chatLeaveRoom, displayNotification, intl } = this.props
    const resolve = () => {
      displayNotification(intl.formatMessage(m.native.Contact.identityNotAvailable), 'info', 3000)
      this._goToList()
    }
    chatLeaveRoom(roomId)
  }

  _turnOnE2ee () {
    if (this.state.e2ee) return

    this.setState({ e2ee: true })
    const { navigation } = this.props
    navigation.setParams({ isEphemeral: true })
  }

  _turnOffE2ee () {
    if (!this.state.e2ee) return

    this.setState({ e2ee: false, e2eeTerminated: false })
    const { navigation } = this.props
    navigation.setParams({ isEphemeral: false })
  }

  _openRoomInfo () {
    this.setState({ roomInfoOpen: true })
  }

  _closeRoomInfo () {
    this.setState({ roomInfoOpen: false })
  }

  _goToList () {
    this.props.navigation.navigate({ routeName: 'MessagingRoomList' })
  }

  _ensureChatData (nextProps) {
    const props = nextProps || this.props
    let { data, chatGetMessagesRequest } = props

    if (!data || data.noMoreMessagesAvailable) {
      return
    }

    if (this.state.e2ee) return

    const messageStore = this._getMessageStore()

    if (data.isLoadingMessages) return
    if (messageStore.messageIds) return

    chatGetMessagesRequest(data.room_id)
  }

  _ensureIdentity (nextProps) {
    const props = nextProps || this.props
    const { data } = props
    if (!data || (nextProps && this.props.data && this.props.data.member_email === data.member_email)) {
      return
    }
    const memberEmail = data.member_email
    if (!props.getIdentityApi.inProgress && memberEmail && !props.identity && !props.useremail) {
      props.getIdentity({ search: { identity_email: memberEmail }, limit: 1 })
    }

    if (!props.getUserEmailApi.inProgress && memberEmail && !props.useremail && !props.identity) {
      props.getUserEmail({ search: { email: memberEmail }, limit: 1 })
    }

    // if (nextProps) return
    // const { canMemberChat, contact } = props
    // if (contact && contact.email && data.room_id) {
    //   canMemberChat(
    //     { email: contact.email },
    //     response => response && !response.status && this._removeChatRoom(data.room_id),
    //     () => this._removeChatRoom(data.room_id)
    //   )
    // }
  }

  _getIdentity (nextProps) {
    const props = nextProps || this.props
    const { data } = props

    if (!data) { return null }

    return props.identity || props.useremail || { email: data.member_email, display_name: data.member_display_name }
  }

  _renderLoader () {
    return (
      <View style={s.container}>
        <ActivityIndicator
          color='#777'
          style={{
            flex: 1
          }}
        />
      </View>
    )
  }

  _onRegularRoomScroll (event) {
    this.regularRoomLastScrollY = event.nativeEvent.contentOffset.y
  }

  componentWillReceiveProps (nextProps) {
    if (isNil(this.props.data) && !isNil(nextProps.data)) {
      this._goToList()
      return
    }
    if ((nextProps && nextProps.contact) && (nextProps.connected !== this.props.connected)) {
      if (!nextProps.connected && this.props.connected) {
        this.setState({ e2eeTerminated: true })
      } else {
        this.setState({ e2eeTerminated: false })
      }
    }

    if (nextProps.hasOwnProperty('isEphemeral') && this.state.e2ee !== nextProps.isEphemeral) {
      this.setState({ e2ee: nextProps.isEphemeral })
    }

    if (nextProps.e2ee && !nextProps.connected) {
      Keyboard.dismiss()
    }

    // this._ensureIdentity(nextProps)
  }

  componentDidMount () {
    this._ensureChatData()
    if (this.props.data) {
      this.props.chatForceFetchNewMessages(this.props.data.room_id)
    }
  }

  componentDidUpdate () {
    this._ensureChatData()
  }

  componentWillMount () {
    this._ensureIdentity()
  }

  _getMessageStore () {
    const key = this.state.e2ee ? 'e2ee' : 'regular'
    return this.props.data[key] || {}
  }

  _renderBackground () {
    const { e2eeTerminated, e2ee } = this.state
    const { connected } = this.props

    if (!e2ee || connected || e2eeTerminated) {
      return null
    }

    return <Image source={require('app/Images/auth_bg.jpg')} style={s.background} />
  }

  render () {
    const { data } = this.props
    const { e2eeTerminated, e2ee } = this.state

    if (!data) {
      return this._renderLoader()
    }

    const props = {
      ...this.props,
      e2ee,
      roomInfoOpen: this.state.roomInfoOpen,
      turnOnE2ee: this._turnOnE2ee,
      turnOffE2ee: this._turnOffE2ee,
      identity: this._getIdentity()
    }

    return (
      <View style={s.container}>
        {this._renderBackground()}
        <RoomHeader {...props} onOpenRoomInfo={this._openRoomInfo} />
        <Drawer
          open={this.state.roomInfoOpen}
          onClose={this._closeRoomInfo}
          containerStyle={{ zIndex: Z_INDEX_ROOM_INFO }}
        >
          <RoomInfo {...props} />
        </Drawer>
        { !e2ee &&
        <RegularRoom
          {...props}
          messageStore={this._getMessageStore()}
          e2eeTerminated={e2eeTerminated}
          turnOffE2ee={this._turnOffE2ee}
          initialScrollPosition={this.regularRoomLastScrollY}
          onScroll={this._onRegularRoomScroll}
        />
        }
        {e2ee &&
        <EphemeralRoom
          {...props}
          messageStore={this._getMessageStore()}
          e2eeTerminated={e2eeTerminated}
          turnOffE2ee={this._turnOffE2ee}
        />
        }
      </View>
    )
  }
}
const injectMessagingRoom = injectIntl(MessagingRoom)
injectMessagingRoom.navigationOptions = ({ navigation }) => ({
  tabBarVisible: false,
  header: null
})

const mapStateToProps = (state, ownProps) => {
  let data

  const isEphemeral = path(['navigation', 'state', 'params', 'isEphemeral'], ownProps)
  const roomId = path(['navigation', 'state', 'params', 'roomId'], ownProps)
  const roomsMapKey = path(['navigation', 'state', 'params', 'roomsMapKey'], ownProps)

  if (roomId) {
    data = path(['chat', 'data', roomId], state)
  } else if (roomsMapKey) {
    data = getRoomByMapKey(state, roomsMapKey)
  } /* todo: else {
    // Either of roomId or roomsMapKey must present
    // Can use Flow to do this checking
  } */

  const contact = data && getContactMember(data)
  const contactPublicKey = contact ? !!path(['chat', 'memberPublicKey', contact.email], state) : null
  return {
    data,
    contact,
    isEphemeral,
    identity: data ? getDataItemForId(state.identity, data.member_email) : null,
    useremail: data ? getDataItemForId(state.useremail, data.member_email) : null,
    getIdentityApi: path(['identity', 'api', 'getIdentity'], state),
    getUserEmailApi: path(['useremail', 'api', 'getUserEmail'], state),
    connected: Boolean(contact && contactPublicKey)
  }
}

const mapDispatchToProps = {
  chatGetMessagesRequest: ChatActions.chatGetMessagesRequest,
  chatForceFetchNewMessages: ChatActions.chatForceFetchNewMessages,
  chatCreateRoomRequest: ChatActions.chatCreateRoomRequest,
  getIdentity: IdentityActions.identityGetFromCacheOrRequest,
  getUserEmail: UserEmailActions.useremailGetFromCacheOrRequest,
  canMemberChat: ChatActions.canMemberChatRequest,
  chatLeaveRoom: ChatActions.chatLeaveRoomRequest,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(injectMessagingRoom)
