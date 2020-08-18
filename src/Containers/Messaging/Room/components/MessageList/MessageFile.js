import PropTypes from 'prop-types'
import React, { Component } from 'react'
import MessageFileReceive from './MessageFileReceive'
import MessageFileSend from './MessageFileSend'

class MessageFile extends Component {
  render () {
    const message = this.props.data.currentMessage
    if (message.is_url) {
      return <MessageFileReceive {...this.props} />
    }
    if (message.message.is_file) {
      return <MessageFileSend {...this.props} />
    }
  }
}

export default MessageFile
