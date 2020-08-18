import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'

import MailboxActions from 'commons/Redux/MailboxRedux'

import palette from 'app/Styles/colors'

const s = EStyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  actionButton: {
    marginLeft: '0.5rem',
    paddingHorizontal: '1rem',
    paddingVertical: '0.5rem'
  },

  actionIcon: {
    fontSize: '1.25rem',
    color: palette.iosBlue
  },

  actionDisabledIcon: {
    color: palette.concrete
  }
})

class BatchActionsTools extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    disabled: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._handleTrashSelected = this._handleTrashSelected.bind(this)
    this._handleArchiveSelected = this._handleArchiveSelected.bind(this)
    this._handleToggleReadSelected = this._handleToggleReadSelected.bind(this)
    this._handleDeleteSelected = this._handleDeleteSelected.bind(this)
    this._renderActionButtons = this._renderActionButtons.bind(this)
  }

  _handleTrashSelected () {
    if (this.props.inProgress) {
      return
    }
    this.props.trashSelected()
  }

  _handleArchiveSelected () {
    if (this.props.inProgress) {
      return
    }
    this.props.archiveSelected()
  }

  _handleToggleReadSelected () {
    if (this.props.inProgress) {
      return
    }
    const { selectedHasUnread, unreadSelected, readSelected } = this.props
    if (selectedHasUnread) {
      readSelected()
    } else {
      unreadSelected()
    }
  }

  _handleDeleteSelected () {
    if (this.props.inProgress) {
      return
    }
    this.props.deleteSelected()
  }

  _renderActionButtons () {
    const buttons = []
    const { filterName, inProgress, disabled } = this.props
    const iconStyle = [s.actionIcon]
    const buttonDisabled = disabled || inProgress
    let ButtonWrapper = TouchableOpacity
    if (buttonDisabled) {
      iconStyle.push(s.actionDisabledIcon)
      ButtonWrapper = View
    }

    if (filterName === 'trash') {
      buttons.push(
        <ButtonWrapper onPress={this._handleDeleteSelected} style={s.actionButton} key='delete' disabled={buttonDisabled}>
          <Icon name='trash' style={iconStyle} />
        </ButtonWrapper>
      )
    } else {
      buttons.push(
        <ButtonWrapper onPress={this._handleTrashSelected} style={s.actionButton} key='trash' disabled={buttonDisabled}>
          <Icon name='trash' style={iconStyle} />
        </ButtonWrapper>
      )
    }

    if (filterName !== 'archive') {
      buttons.push(
        <ButtonWrapper onPress={this._handleArchiveSelected} style={s.actionButton} key='archive' disabled={buttonDisabled}>
          <Icon name='archive' style={iconStyle} />
        </ButtonWrapper>
      )
    }

    buttons.push(
      <ButtonWrapper onPress={this._handleToggleReadSelected} style={s.actionButton} key='read-unread' disabled={buttonDisabled}>
        <Icon name='low-vision' style={iconStyle} />
      </ButtonWrapper>
    )

    return buttons
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={s.container}>
        {this._renderActionButtons()}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const props = {}
  const data = state.mailbox.searchResultsData || state.mailbox.data
  const unreadEmail = state.mailbox.selectedIds.find((id) => {
    if (data[id] && !data[id].is_read) {
      return true
    }
    return false
  })
  if (unreadEmail) {
    props.selectedHasUnread = true
  } else {
    props.selectedHasUnread = false
  }
  props.filterName = state.mailbox.filterName
  props.inProgress = state.mailbox.selectedUpdateInProgress
  return props
}

const mapDispatchToProps = {
  trashSelected: MailboxActions.mailboxTrashSelectedRequest,
  archiveSelected: MailboxActions.mailboxArchiveSelectedRequest,
  readSelected: MailboxActions.mailboxReadSelectedRequest,
  unreadSelected: MailboxActions.mailboxUnreadSelectedRequest,
  deleteSelected: MailboxActions.mailboxDeleteSelectedRequest
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchActionsTools)
