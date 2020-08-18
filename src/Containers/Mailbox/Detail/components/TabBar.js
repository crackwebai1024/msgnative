import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import Tabs from 'react-native-tabs'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import tabbarStyles from 'app/Styles/tabbar'
import m from 'commons/I18n'

class MailboxDetailTabBar extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    displayNotification: PropTypes.func.isRequired,
    trashMail: PropTypes.func.isRequired,
    archiveMail: PropTypes.func.isRequired,
    inboxMail: PropTypes.func.isRequired,
    mailboxReadRequest: PropTypes.func.isRequired,
    mailboxUnreadRequest: PropTypes.func.isRequired,
    filterName: PropTypes.string,
    navigateBack: PropTypes.func,
    intl: PropTypes.object,
    navigate: PropTypes.func,
    networkOnline: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._reply = this._reply.bind(this)
    this._forward = this._forward.bind(this)
    this._onTabSelected = this._onTabSelected.bind(this)
    this._toggleReadStatus = this._toggleReadStatus.bind(this)
    this._trashMail = this._trashMail.bind(this)
    this._trashMailPermanently = this._trashMailPermanently.bind(this)
    this._archiveMail = this._archiveMail.bind(this)
    this._moveToInbox = this._moveToInbox.bind(this)
    this._showNotification = this._showNotification.bind(this)
  }

  _toggleReadStatus (id) {
    const { data } = this.props

    if (data.is_read) {
      this.props.mailboxUnreadRequest(id)
      this._showNotification('emailMarkedUnread')
    } else {
      this.props.mailboxReadRequest(id)
      this._showNotification('emailMarkedRead')
    }
  }

  _trashMail (id) {
    this.props.trashMail(id)
    this._showNotification('emailTrashed', 'danger')
  }

  _trashMailPermanently (id) {
    this.props.trashMail(id)
    this._showNotification('emailDeletedPermanently', 'danger')
  }

  _archiveMail (id) {
    this.props.archiveMail(id)
    this._showNotification('emailArchived')
    this.props.navigateBack()
  }

  _moveToInbox (id) {
    this.props.inboxMail(id)
    this._showNotification('emailMovedToInbox')
    this.props.navigateBack()
  }

  _showNotification (messageKey, messageType = 'info') {
    const { displayNotification } = this.props
    const fm = this.props.intl.formatMessage

    displayNotification(fm(m.native.Mailbox[messageKey]), messageType, 3000)
  }

  _onTabSelected (name) {
    const { data, filterName, networkOnline } = this.props
    console.log('onTabSelected', name, filterName)

    if (!networkOnline) return

    switch (name) {
      case 'trash':
        if (filterName === 'trash') {
          this._trashMailPermanently(data.id)
        } else {
          this._trashMail(data.id)
        }
        break
      case 'inbox':
        this._moveToInbox(data.id)
        break
      case 'archive':
        this._archiveMail(data.id)
        break
      case 'low-vision':
        this._toggleReadStatus(data.id)
        break
      case 'reply':
        this._reply()
        break
      case 'share':
        this._forward()
        break
    }
  }

  _reply () {
    const { data, navigate } = this.props

    if (!data.detail) return

    navigate({
      routeName: 'MailboxCompose',
      params: {
        mailboxReplyId: data.id,
        title: this.props.intl.formatMessage(m.native.Mailbox.reply)
      }
    })
  }

  _forward () {
    const { data, navigate } = this.props
    if (!data.detail) return

    navigate({
      routeName: 'MailboxCompose',
      params: {
        mailboxForwardId: data.id,
        title: this.props.intl.formatMessage(m.native.Mailbox.forward)
      }
    })
  }

  render () {
    const { data, filterName, networkOnline } = this.props
    const styles = [tabbarStyles.icon, !networkOnline && tabbarStyles.iconDisabled]

    return (
      <Tabs
        onSelect={el => this._onTabSelected(el.props.name)}
        style={tabbarStyles.main}>
        <Icon
          name='trash'
          style={styles}
        />
        <Icon
          name={filterName === 'archive' || filterName === 'trash' ? 'inbox' : 'archive'}
          style={styles}
        />
        <Icon
          name='low-vision'
          style={[tabbarStyles.icon, data.is_read && tabbarStyles.iconActive, !networkOnline && tabbarStyles.iconDisabled]}
        />
        <Icon
          name='reply'
          style={[...styles, !networkOnline && tabbarStyles.iconDisabled]}
        />
        <Icon
          name='share'
          style={[...styles, !networkOnline && tabbarStyles.iconDisabled]}
        />
      </Tabs>
    )
  }
}

const mapStateToProps = state => ({
  networkOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  navigateBack: NavigationActions.back,
  navigate: NavigationActions.navigate
}

const ConnectedMailboxDetailTabBar = connect(mapStateToProps, mapDispatchToProps)(injectIntl(MailboxDetailTabBar))

export default ConnectedMailboxDetailTabBar
