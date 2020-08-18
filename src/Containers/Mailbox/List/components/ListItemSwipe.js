import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import { compose, pure } from 'recompose'
import { equals } from 'ramda'
import Icon from 'react-native-vector-icons/FontAwesome'
import MailboxActions, { MAIL_ITEM_UPDATE_TYPES } from 'commons/Redux/MailboxRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import Text from 'app/Components/BaseText'
import Spinner from 'app/Components/Spinner'
import { ListItemSwipe as s } from 'app/Components/ListView/styles'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'

class MailboxListItemSwipe extends PureComponent {
  static propTypes = {
    dataKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    filterName: PropTypes.string,
    mailboxArchiveRequest: PropTypes.func.isRequired,
    mailboxUnarchiveRequest: PropTypes.func.isRequired,
    mailboxMoveToInboxRequest: PropTypes.func.isRequired,
    mailboxTrashRequest: PropTypes.func.isRequired,
    mailboxUntrashRequest: PropTypes.func.isRequired,
    mailboxDeleteRequest: PropTypes.func.isRequired,
    displayNotification: PropTypes.func.isRequired,
    onCloseSwipeRequested: PropTypes.func,
    intl: PropTypes.object,
    data: PropTypes.object,
    isOnline: PropTypes.bool
  }

  static defaultProps = {
    filterName: 'inbox'
  }

  constructor (props) {
    super(props)

    this._handleArchive = this._handleArchive.bind(this)
    this._handleTrash = this._handleTrash.bind(this)
    this._handleDelete = this._handleDelete.bind(this)
    this._handleMoveToInbox = this._handleMoveToInbox.bind(this)
    this._handleLeftAction = this._handleLeftAction.bind(this)
    this._handleRightAction = this._handleRightAction.bind(this)
    this._displayEmailSentNotification = this._displayEmailSentNotification.bind(this)
  }

  _handleArchive () {
    const {
      dataKey,
      // onCloseSwipeRequested,
      mailboxArchiveRequest,
      displayNotification,
      intl
    } = this.props
    // onCloseSwipeRequested && onCloseSwipeRequested()
    const resolve = () => {
      displayNotification(intl.formatMessage(m.native.Mailbox.emailArchived), 'info', 3000)
    }
    mailboxArchiveRequest(dataKey, resolve)
  }

  _handleTrash () {
    const {
      dataKey,
      // onCloseSwipeRequested,
      mailboxTrashRequest,
      displayNotification,
      intl
    } = this.props
    // onCloseSwipeRequested && onCloseSwipeRequested()
    const resolve = () => {
      displayNotification(intl.formatMessage(m.native.Mailbox.emailTrashed), 'danger', 3000)
    }
    mailboxTrashRequest(dataKey, resolve)
  }

  _handleUntrash () {
    const {
      dataKey,
      data,
      // onCloseSwipeRequested,
      mailboxUntrashRequest,
      displayNotification,
      intl
    } = this.props
    // onCloseSwipeRequested && onCloseSwipeRequested()
    const resolve = () => {
      const fm = intl.formatMessage
      const { direction, treatment, is_msgsafe_store: isMsgsafeStore, is_archive: isArchive } = data
      let message = null
      if (isArchive) {
        message = fm(m.native.Mailbox.emailArchived)
      } else if (direction === 1 && treatment === 0 && isMsgsafeStore && !isArchive) {
        message = fm(m.native.Mailbox.emailMovedToSent)
      } else if (direction === 2) {
        message = fm(m.native.Mailbox.emailMovedToInbox)
      }
      displayNotification(message, 'info', 3000)
    }
    mailboxUntrashRequest(dataKey, resolve)
  }

  _handleDelete () {
    const {
      dataKey,
      // onCloseSwipeRequested,
      mailboxDeleteRequest,
      displayNotification,
      intl
    } = this.props
    // onCloseSwipeRequested && onCloseSwipeRequested()
    const resolve = () => {
      displayNotification(intl.formatMessage(m.native.Mailbox.emailDeleted), 'danger', 3000)
    }
    mailboxDeleteRequest(dataKey, resolve)
  }

  _handleMoveToInbox () {
    const {
      dataKey,
      onCloseSwipeRequested,
      mailboxMoveToInboxRequest
    } = this.props
    onCloseSwipeRequested && onCloseSwipeRequested()
    const resolve = () => {
      this._displayEmailSentNotification()
    }
    mailboxMoveToInboxRequest(dataKey, resolve)
  }

  _handleUnarchive () {
    const {
      dataKey,
      // onCloseSwipeRequested,
      mailboxUnarchiveRequest
    } = this.props
    // onCloseSwipeRequested && onCloseSwipeRequested()
    const resolve = () => {
      this._displayEmailSentNotification()
    }
    mailboxUnarchiveRequest(dataKey, resolve)
  }

  _displayEmailSentNotification () {
    const {
      displayNotification,
      intl,
      data: {
        direction, treatment, is_msgsafe_store: isMsgsafeStore
      }
    } = this.props
    if (direction === 1 && treatment === 0 && isMsgsafeStore) {
      displayNotification(intl.formatMessage(m.native.Mailbox.emailMovedToSent), 'info', 3000)
    } else {
      displayNotification(intl.formatMessage(m.native.Mailbox.emailMovedToInbox), 'info', 3000)
    }
  }

  _handleLeftAction () {
    const { filterName } = this.props
    if (filterName === 'archive') {
      return this._handleUnarchive()
    } else if (filterName === 'trash') {
      return this._handleUntrash()
    }
    return this._handleArchive()
  }

  _handleRightAction () {
    const { filterName } = this.props
    if (filterName === 'trash') {
      return this._handleDelete()
    }
    return this._handleTrash()
  }

  _renderLeftSwipe () {
    const { filterName, intl, data, isOnline } = this.props
    const fm = intl.formatMessage
    let icon = 'archive'
    let actionType = MAIL_ITEM_UPDATE_TYPES.ARCHIVE
    let text = fm(m.native.Mailbox.archive)

    if (filterName === 'archive' || filterName === 'trash') {
      actionType = filterName === 'archive' ? MAIL_ITEM_UPDATE_TYPES.UNARCHIVE : MAIL_ITEM_UPDATE_TYPES.UNTRASH

      // is_archive: false, is_trash: false, direction: 1, treatment: 0, is_msgsafe_store: true
      const { direction, treatment, is_msgsafe_store: isMsgsafeStore, is_archive: isArchive, is_trash: isTrash } = data

      // for items which where moved to trash from archive
      if (isTrash && isArchive) {
        icon = 'archive'
        text = fm(m.native.Mailbox.moveToArchive)
      } else if (direction === 1 && treatment === 0 && isMsgsafeStore) {
        // for sent
        icon = 'envelope-o'
        text = fm(m.native.Mailbox.moveToSent)
      } else if (direction === 2) {
        icon = 'inbox'
        text = fm(m.native.Mailbox.moveToInbox)
      }
    }

    const isActionInProgress = !!data.actionTypeInProgress
    const isCurrentActionInProgress = equals(actionType, data.actionTypeInProgress)
    const disabled = !isOnline || isActionInProgress || isCurrentActionInProgress

    const iconStyle = [s.button, s.buttonPrimary]
    if (disabled) {
      iconStyle.push(s.actionDisabledIcon)
    }
    return (
      <TouchableOpacity
        style={iconStyle}
        onPress={this._handleLeftAction}
        disabled={disabled}
      >
        {!isCurrentActionInProgress && <Icon name={icon} style={s.icon} />}
        {!isCurrentActionInProgress && <Text style={s.text}>{text}</Text>}
        {isCurrentActionInProgress && <Spinner containerStyle={s.spinnerAnimatedContainer} iconStyle={s.spinnerIcon} />}
      </TouchableOpacity>
    )
  }

  _renderRightSwipe () {
    const { data, filterName, intl, isOnline } = this.props
    const fm = intl.formatMessage
    const iconStyle = [s.button, s.buttonDanger]

    const actionType = filterName === 'trash' ? MAIL_ITEM_UPDATE_TYPES.DELETE : MAIL_ITEM_UPDATE_TYPES.TRASH
    const isActionInProgress = !!data.actionTypeInProgress
    const isCurrentActionInProgress = equals(actionType, data.actionTypeInProgress)
    const disabled = !isOnline || isActionInProgress || isCurrentActionInProgress
    if (disabled) {
      iconStyle.push(s.actionDisabledIcon)
    }
    return (
      <TouchableOpacity
        style={iconStyle}
        onPress={this._handleRightAction}
        disabled={disabled}
      >
        {!isCurrentActionInProgress && <Icon name='trash' style={s.icon} /> }
        {!isCurrentActionInProgress && <Text style={s.text}>{filterName === 'trash' ? fm(m.app.Common.delete) : fm(m.native.Mailbox.trash)}</Text>}
        {isCurrentActionInProgress && <Spinner containerStyle={s.spinnerAnimatedContainer} iconStyle={s.spinnerIcon} />}
      </TouchableOpacity>
    )
  }

  componentWillUnmount () {
    this.props.onCloseSwipeRequested && this.props.onCloseSwipeRequested()
  }

  render () {
    return (
      <View style={s.container}>
        {this._renderLeftSwipe()}
        {this._renderRightSwipe()}
      </View>
    )
  }
}

const mapStateToProps = state => ({
  filterName: state.mailbox.filterName,
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  mailboxArchiveRequest: MailboxActions.mailboxArchiveRequest,
  mailboxUnarchiveRequest: MailboxActions.mailboxUnarchiveRequest,
  mailboxMoveToInboxRequest: MailboxActions.mailboxMoveToInboxRequest,
  mailboxUntrashRequest: MailboxActions.mailboxUntrashRequest,
  mailboxTrashRequest: MailboxActions.mailboxTrashRequest,
  mailboxDeleteRequest: MailboxActions.mailboxDeleteRequest,
  displayNotification: NotificationActions.displayNotification
}

export default compose(
  pure,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(MailboxListItemSwipe)
