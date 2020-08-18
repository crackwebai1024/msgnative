import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { injectIntl } from 'react-intl'

import WebRTCActions from 'app/Redux/WebRTCRedux'
import ContactActions from 'commons/Redux/ContactRedux'

import { ContactListItemLite } from 'app/Components/ContactListItem'

import { ListItem as s } from './styles'

class ContactListItem extends PureComponent {
  static propTypes = {
    data: PropTypes.object.isRequired,
    // function to check whether the row is open (in swipe list view)
    isRowOpen: PropTypes.func.isRequired,
    // function to close row if opened or navigate to contact details screen -- passed from ListViewSwipeableRow
    onPress: PropTypes.func.isRequired,
    contactGetFullObject: PropTypes.func.isRequired,
    myIdentities: PropTypes.object,
    hasMcrophone: PropTypes.bool,
    socketConnected: PropTypes.bool,
    callInProgress: PropTypes.bool
  }

  _startAudioCallWith = () => {
    const resolve = contact => this.props.bootCallProcess(contact, true, this.props.intl.formatMessage)
    this.props.contactGetFullObject(this.props.data.email, resolve)
  }
  _startTextChatWith = () => {
    const resolve = contact => this.props.bootChatProcess(contact, false, 'ContactList', this.props.intl.formatMessage)
    this.props.contactGetFullObject(this.props.data.email, resolve)
  }

  renderActions () {
    const { data, isRowOpen, onPress, myIdentities, hasMcrophone, socketConnected, callInProgress } = this.props
    if (!data.is_msgsafe_user || myIdentities[data.email]) { // self identity
      return null
    }

    const canCall = socketConnected && hasMcrophone && !callInProgress

    return (
      <View style={s.actions}>
        <TouchableOpacity
          onPress={() => isRowOpen() ? onPress() : this._startAudioCallWith()}
          style={[s.callAction, !canCall && s.disabled]}
          disabled={!canCall}
        >
          <FontAwesomeIcon name='phone' style={s.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => isRowOpen() ? onPress() : this._startTextChatWith()}
          style={[s.chatAction, !socketConnected && s.disabled]}
          disabled={!socketConnected}
        >
          <FontAwesomeIcon name='comment' style={s.icon} />
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    const { data } = this.props
    return ContactListItemLite({
      data,
      Component: TouchableOpacity,
      onPress: !data.actionTypeInProgress ? this.props.onPress : null,
      children: this.renderActions()
    })
  }
}

ContactListItem.propTypes = {
  intl: PropTypes.object,
  bootCallProcess: PropTypes.func,
  bootChatProcess: PropTypes.func
}

const mapDispatchToProps = {
  bootCallProcess: WebRTCActions.bootCallProcess,
  bootChatProcess: WebRTCActions.bootChatProcess,
  contactGetFullObject: ContactActions.contactGetFullObject
}

const mapStateToProps = (state) => {
  let dicIdentities = {}
  let dicEmails = {}

  if (state.identity && state.identity.data) {
    dicIdentities = state.identity.data
  }

  for (let key in dicIdentities) {
    if (dicIdentities[key] && dicIdentities[key].email) {
      dicEmails[dicIdentities[key].email] = true
    }
  }
  return {
    myIdentities: dicEmails, // { 'email@email.com': true or false }
    hasMcrophone: state.device.has_microphone,
    socketConnected: state.chat.socketConnected,
    callInProgress: state.webrtc.inProgress
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ContactListItem))
