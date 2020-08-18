import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import { GiftedChat, Bubble, Day, Send } from 'react-native-gifted-chat'
import EStyleSheet from 'react-native-extended-stylesheet'
import ImagePicker from 'react-native-image-picker'
import RNFS from 'react-native-fs'
import uuidv1 from 'uuid/v1'
import PropTypes from 'prop-types'
import { path, reverse, equals } from 'ramda'
import mime from 'react-native-mime-types'
import { injectIntl } from 'react-intl'
import debounce from 'lodash.debounce'
import { compose, withPropsOnChange } from 'recompose'
import { isIphoneX } from 'react-native-iphone-x-helper'

import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'
import ChatActions from 'commons/Redux/ChatRedux'
import { uuidv1ToDate } from 'commons/Lib/Utils'
import { convertBase64StrToUint8Array } from 'commons/Lib/Encoding'
import { isWhitespace } from 'commons/Lib/Messaging'

import Text from 'app/Components/BaseText'
import ActionsButton from './ActionsButton'
import MessageText from './MessageText'
import EphemeralEarlierMessage from './EphemeralEarlierMessage'

const s = EStyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#e9f1f7'
  },

  chatEpContainer: {
    // position: 'relative'
  },

  loadEarlierContainer: {
    height: 180,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },

  loadEarlierInner: {
    height: 30,
    backgroundColor: '#aaa',
    paddingHorizontal: 10,
    paddingVertical: 6.5,
    borderRadius: 30,
    marginBottom: 10
  },

  loadEarlierText: {
    color: '#fff',
    fontSize: '0.75rem'
  },

  noMoreContainer: {
    height: 170,
    paddingBottom: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  noMoreText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: '0.8rem'
  },

  text: {
    textAlign: 'center',
    fontSize: '1.0rem',
    lineHeight: '1.3rem',
    backgroundColor: 'transparent',
    color: 'rgba(32,48,90,0.4)'
    // letterSpacing: -0.1
  },

  isTypingMessage: {
    color: '#808080',
    marginLeft: 6,
    marginBottom: 3
  },

  textDay: {
    fontSize: 12,
    '@media android': {
      fontFamily: 'sans-serif'
    }
  },

  sendButton: {
    color: '#0084ff',
    fontWeight: '600',
    fontSize: 17,
    backgroundColor: 'transparent',
    marginBottom: 12,
    marginLeft: 10,
    marginRight: 10
  }
})

class MessageList extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    messageStore: PropTypes.shape({
      messageIds: PropTypes.array,
      messages: PropTypes.object
    }),
    messages: PropTypes.array,
    e2ee: PropTypes.bool,
    chatGetMessagesRequest: PropTypes.func.isRequired,
    chatSendMessageRequest: PropTypes.func.isRequired,
    chatAckMessage: PropTypes.func.isRequired,
    chatSendFileRequest: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    e2eeTerminated: PropTypes.bool,
    connected: PropTypes.bool,
    turnOffE2ee: PropTypes.func,
    onScroll: PropTypes.func,
    setRef: PropTypes.func
  }

  constructor (props) {
    super(props)

    // this._didMessageAppend = this._didMessageAppend.bind(this)
    // this._didMessagePrepend = this._didMessagePrepend.bind(this)
    this._getLastMessageId = this._getLastMessageId.bind(this)
    // this._getFirstMessageId = this._getFirstMessageId.bind(this)
    this._onSend = this._onSend.bind(this)
    this._handleImage = this._handleImage.bind(this)
    this._handleUploadProgress = this._handleUploadProgress.bind(this)
    this._handleInputTextChanged = this._handleInputTextChanged.bind(this)
    this._handleStopTyping = debounce(this._handleStopTyping.bind(this), 1000)
    this._onLoadEarlier = this._onLoadEarlier.bind(this)
    this._updateLastMessageRead = this._updateLastMessageRead.bind(this)
    this._handleActions = this._handleActions.bind(this)
    this._renderLoadEarlier = this._renderLoadEarlier.bind(this)
    this._renderFooter = this._renderFooter.bind(this)
    this._renderActions = this._renderActions.bind(this)
    this._renderDay = this._renderDay.bind(this)
    this._renderMessageText = this._renderMessageText.bind(this)
    this._renderSend = this._renderSend.bind(this)

    this._user = {
      _id: props.data.member_email,
      name: props.data.member_email
    }
    this._listViewProps = props.onScroll ? {
      onScroll: props.onScroll,
      scrollEventThrottle: 16
    } : null
  }

  // _didMessageAppend (nextProps) {
  //   nextProps = nextProps || this.props
  //   const { messageIds } = nextProps.messageStore
  //   if (!messageIds || !messageIds.length) return false
  //   const lastMessageIdIndex = messageIds.indexOf(this._getLastMessageId())
  //   if (lastMessageIdIndex === -1) return false
  //   if (lastMessageIdIndex < messageIds.length - 1) return true
  // }
  //
  // _didMessagePrepend (nextProps) {
  //   nextProps = nextProps || this.props
  //   const { messageIds } = nextProps.messageStore
  //   if (!messageIds || !messageIds.length) return false
  //   const firstMessageIdIndex = messageIds.indexOf(this._getFirstMessageId())
  //   if (firstMessageIdIndex === -1) return false
  //   if (firstMessageIdIndex > 0) return true
  // }

  _getLastMessageId () {
    const { messages } = this.props
    if (!messages || !messages.length) return 0

    return messages[0]._id
  }

  // _getFirstMessageId () {
  //   if (!this.state.messageIds || !this.state.messageIds.length) return 0
  //   return this.state.messageIds[0]
  // }

  _onSend (messages = []) {
    this.props.chatSendMessageRequest(this.props.data.room_id, messages[0].text, this.props.e2ee)
  }

  _handleImage (response) {
    const {
      data,
      chatSendFileRequest,
      displayNotification,
      chatMessageReceived,
      intl
    } = this.props
    if (response.didCancel) {
      return
    }

    // in case the user takes a live photo, give it a generic filename
    response.fileName = response.fileName || 'Photo.jpg'

    const uploadMessage = {
      message_id: uuidv1(),
      room_id: data.room_id,
      user_from: data.member_email,
      body: null,
      is_file: true,
      progress: null,
      data: response
    }
    chatMessageReceived(uploadMessage, true)
    RNFS.readFile(response.uri, 'base64')
      .then((content) => {
        const uint8Array = convertBase64StrToUint8Array(content)
        chatSendFileRequest(data.room_id, {
          name: response.fileName,
          type: mime.lookup(response.fileName),
          size: response.fileSize,
          data: uint8Array
        }, this._handleUploadProgress(uploadMessage))
      })
      .catch((err) => {
        displayNotification(intl.formatMessage(m.native.Chat.couldNotSendImage), 'danger', 3000)
        console.error('Error sending an image', err)
      })
  }

  _handleUploadProgress (uploadMessage) {
    const { chatMessageModified } = this.props
    return function (event) {
      if (event.percent) {
        chatMessageModified({ ...uploadMessage, progress: event.percent / 100 }, true)
      }
    }
  }

  _onLoadEarlier () {
    this.props.chatGetMessagesRequest(this.props.data.room_id, true)
  }

  _updateLastMessageRead () {
    const { data, e2ee } = this.props
    if (!data) return

    const latestMessageId = this._getLastMessageId()
    if (!latestMessageId) return

    if (
      // Either there's no last_read_message_id at all
      !data.last_read_message_id ||
      (
        data.regular &&
        data.regular.unreadCount > 0
      ) ||
      (
        data.e2ee &&
        data.e2ee.unreadCount > 0
      ) ||
      // Or the latest message's timestamp is greater than last_read_message_id
      (
        latestMessageId !== data.last_read_message_id &&
        uuidv1ToDate(latestMessageId) > uuidv1ToDate(data.last_read_message_id)
      )
    ) {
      this.props.chatAckMessage(data.room_id, latestMessageId, e2ee)
    }
  }

  _handleActions () {
    ImagePicker.showImagePicker({
      noData: true
    }, this._handleImage)
  }

  _renderLoadEarlier () {
    const { data, e2ee, connected, intl, messages } = this.props
    if (e2ee && connected) {
      return (
        <EphemeralEarlierMessage {...this.props} />
      )
    }

    if (data.noMoreMessagesAvailable) {
      return (
        <View style={s.noMoreContainer}>
          <Text style={s.noMoreText}>{messages && messages.length ? intl.formatMessage(m.native.Chat.noMoreMessages) : intl.formatMessage(m.native.Chat.noMoreHistory)}</Text>
        </View>
      )
    }

    return (
      <View style={s.loadEarlierContainer}>
        {data.isLoadingMessages ? <View style={s.loadEarlierInner}>
          <Text style={s.loadEarlierText}>{intl.formatMessage(m.app.Common.loadingEllipses)}</Text></View>
          : <TouchableOpacity style={s.loadEarlierInner} onPress={this._onLoadEarlier}>
            <Text style={s.loadEarlierText}>{intl.formatMessage(m.native.Chat.loadEarlierMessages)}</Text>
          </TouchableOpacity>
        }
      </View>
    )
  }

  _renderFooter () {
    const { data, connected, e2ee, intl } = this.props
    const membersTyping = path([!e2ee ? 'regular' : 'e2ee', 'membersTyping'], data)

    if (!(connected && membersTyping)) {
      return null
    }

    const membersTypingList = Object.keys(membersTyping).filter(u => membersTyping[u] && !equals(u, data.member_email))

    if (!membersTypingList.length) return null
    return (
      <Text style={s.isTypingMessage}>
        {membersTypingList.join(', ')} {intl.formatMessage(m.native.Chat.isTyping)}
      </Text>
    )
  }

  _renderActions () {
    const { e2ee, data } = this.props
    if (!e2ee) return null
    if (process.env.NODE_ENV === 'production') return null

    return (
      <ActionsButton
        data={data}
        onPress={this._handleActions}
      />
    )
  }

  _renderMessageText (data) {
    return <MessageText data={data} />
  }

  _renderBubble (props) {
    return (
      <Bubble {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#fff'
          },
          right: {
            backgroundColor: 'rgb(0, 131, 232)'
          }
        }}
      />
    )
  }

  _renderDay (props) {
    return <Day {...props} textStyle={s.textDay} />
  }

  _handleStartTyping () {
    const { data, chatStartedTyping, e2ee } = this.props
    if (!data.room_id || this._isTyping) return
    this._isTyping = true
    chatStartedTyping(data.room_id, Boolean(e2ee))
  }

  _handleStopTyping () {
    const { data, chatStoppedTyping, e2ee } = this.props
    if (!data.room_id || !this._isTyping) return
    this._isTyping = false
    chatStoppedTyping(data.room_id, Boolean(e2ee))
  }

  _renderSend (props) {
    return (
      <Send {...props}>
        <Text style={s.sendButton}>{this.props.intl.formatMessage(m.native.Mailbox.send)}</Text>
      </Send>
    )
  }

  _handleInputTextChanged (text) {
    if (isWhitespace(text || '')) return
    this._handleStartTyping()
    this._handleStopTyping()
  }

  componentDidMount () {
    this._updateLastMessageRead()
  }

  componentDidUpdate () {
    this._updateLastMessageRead()
  }

  render () {
    const { data, intl, messages, setRef } = this.props
    if (!data) return null

    // const readonly = !!data.is_identity_deleted

    return (
      <View style={s.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={this._onSend}
          loadEarlier
          renderLoadEarlier={this._renderLoadEarlier}
          isLoadingEarlier={data.isLoadingMessages}
          renderFooter={this._renderFooter}
          renderAvatar={null}
          renderActions={this._renderActions}
          renderMessageText={this._renderMessageText}
          renderBubble={this._renderBubble}
          user={this._user}
          listViewProps={this._listViewProps}
          onInputTextChanged={this._handleInputTextChanged}
          // textInputProps={{ editable: !readonly }}
          ref={setRef}
          placeholder={intl.formatMessage(m.native.Chat.typeAMessage)}
          renderDay={this._renderDay}
          renderSend={this._renderSend}
          bottomOffset={isIphoneX() ? 35 : 0}
        />
      </View>
    )
  }
}

const mapDispatchToProps = {
  chatGetMessagesRequest: ChatActions.chatGetMessagesRequest,
  chatSendMessageRequest: ChatActions.chatSendMessageRequest,
  chatAckMessage: ChatActions.chatAckMessage,
  chatSendFileRequest: ChatActions.chatSendFileRequest,
  chatMessageReceived: ChatActions.chatMessageReceived,
  chatMessageModified: ChatActions.chatMessageModified,
  chatStartedTyping: ChatActions.chatStartedTyping,
  chatStoppedTyping: ChatActions.chatStoppedTyping,
  displayNotification: NotificationActions.displayNotification
}

const shouldMapOrKeys = ['messageStore', 'data']
const createProps = (props) => {
  if (!props.messageStore) return

  let { messageIds, messages } = props.messageStore
  const { last_delivered_message_id } = props.data

  if (!messageIds || !messageIds.length) return

  const transformed = reverse(messageIds)
    // map those new message ids to messages
    .map((messageId) => messages[messageId])
    // retrive timestamps from uuidv1 for each message
    .map((message) => message.setIn(['timestamp'], uuidv1ToDate(message.message_id)))
    // cache messages
    .map((message) => {
      const isDelivered = (
        last_delivered_message_id &&
        (
          last_delivered_message_id === message.message_id ||
          uuidv1ToDate(last_delivered_message_id) >= uuidv1ToDate(message.message_id)
        )
      )

      const giftedMessage = {
        message,
        _id: message.message_id,

        // gifted-chat won't render the message if body is null
        // which will result our custom file messages not being rendered
        text: message.body || 'file',
        createdAt: message.timestamp,
        user: {
          _id: message.user_from,
          name: message.user_from
        },
        // sent: isDelivered,
        received: isDelivered
      }
      if (message.is_image) {
        giftedMessage.is_image = true
        giftedMessage.image = `data:${message.data.mime_type};base64,${message.image_data}`
        giftedMessage.text = message.data.file_name
      }
      if (message.is_url) {
        giftedMessage.text = 'data_url'
        giftedMessage.is_url = true
        giftedMessage.url = message.data.data_url
        giftedMessage.filename = message.data.file_name
      }

      return giftedMessage
    })

  return { messages: transformed }
}

const ConnectedMessageList = compose(
  withPropsOnChange(shouldMapOrKeys, createProps),
  connect(null, mapDispatchToProps, null),
  injectIntl
)(MessageList)

export default ConnectedMessageList
