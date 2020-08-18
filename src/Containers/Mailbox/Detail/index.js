import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import { isEmpty, isNil } from 'ramda'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import ContactActions from 'commons/Redux/ContactRedux'
import palette from 'app/Styles/colors'
import MailboxActions from 'commons/Redux/MailboxRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { getDataItemForId } from 'commons/Redux/_Utils'

import HeaderButton from 'app/Components/HeaderButton'
import Header from './components/Header'
import TabBar from './components/TabBar'
import Body from './components/Body'
import AttachmentList from './components/AttachmentList'
import AnalyticsMap from './components/AnalyticsMap'

const styles = EStyleSheet.create({
  main: {
    backgroundColor: 'white',
    flex: 1,
    paddingBottom: '3.125rem'
  },

  navButtons: {
    flexDirection: 'row'
  },

  navButton: {
    marginLeft: '0.7rem'
  },

  navButtonIcon: {
    fontSize: '1.7rem',
    marginRight: '0.7rem',
    color: palette.link
  },

  navButtonIconDisabled: {
    color: palette.asbestos
  }
})

/**
 * Mailbox Detail component.
 *
 * The id of the mailbox item that is to be displayed
 * can be passed through the redux store, which is plucked
 * out as props.navigation.state.id. Once mounted, the component
 * then keeps track of this id in the state.
 *
 */
class MailboxDetail extends Component {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    headerLeft: <HeaderButton isBack onPress={() => navigation.goBack()} />,
    headerRight: (
      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={navigation.state.params.goToNextMail}>
          <EntypoIcon
            name='chevron-thin-down'
            style={[
              styles.navButtonIcon,
              !navigation.state.params.nextId && styles.navButtonIconDisabled
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={navigation.state.params.goToPreviousMail}>
          <EntypoIcon
            name='chevron-thin-up'
            style={[
              styles.navButtonIcon,
              !navigation.state.params.prevId && styles.navButtonIconDisabled
            ]}
          />
        </TouchableOpacity>
      </View>
    )
  })

  constructor (props) {
    super(props)

    this._showImages = this._showImages.bind(this)
    this._getMailData = this._getMailData.bind(this)
    this._getContact = this._getContact.bind(this)
    this._goToPreviousMail = this._goToPreviousMail.bind(this)
    this._goToNextMail = this._goToNextMail.bind(this)
    this._trashMail = this._trashMail.bind(this)
    this._archiveMail = this._archiveMail.bind(this)
    this._inboxMail = this._inboxMail.bind(this)
    this._handleMailRemoval = this._handleMailRemoval.bind(this)
    this._updateRemoteContentRules = this._updateRemoteContentRules.bind(this)

    this.state = {
      currentId: props.navigation.state.params.id,
      imagesVisible: false,
      embeddedVisible: false
    }
  }

  _getMailData (props = this.props, state = this.state) {
    const { currentId } = state

    return props.mailboxData[currentId] || props.mailboxCacheData[currentId]
  }

  _getContact () {
    const { contactState } = this.props
    const data = this._getMailData()
    if (!data) { return null }

    const contactEmail = data[data.direction === 1 ? 'msg_to' : 'msg_from']

    return getDataItemForId(contactState, contactEmail)
  }

  _updateRemoteContentRules (props = this.props) {
    // NOTE: Contact-level remote content rendering setting deprecated.
    // Maybe it can be brought back later
    const data = this._getMailData(props)
    if (!data) { return }

    this.setState({ imagesVisible: props.loadRemoteContent })
    // this.setState({ embeddedVisible: props.loadEmbeddedImage })

    // const contact = this._getContact()
    // const contactKey = data.direction === 1 ? 'msg_to' : 'msg_from'

    // if (contact && contact.email === data[contactKey]) {
    //   if (isNil(contact.pref_mail_load_remote_content)) {
    //     this.setState({ imagesVisible: props.loadRemoteContent })
    //   } else {
    //     this.setState({ imagesVisible: contact.pref_mail_load_remote_content })
    //   }
    //
    //   if (isNil(contact.pref_mail_load_embedded_image)) {
    //     this.setState({ embeddedVisible: props.loadEmbeddedImage })
    //   } else {
    //     this.setState({ embeddedVisible: contact.pref_mail_load_embedded_image })
    //   }
    // } else if (!props.contactRequestInProgress) { // fetch contact details if not in redux store
    //   this.props.getContact({ search: {contact_email: data[contactKey]}, limit: 1 })
    // }
  }

  _showImages () {
    this.setState({ imagesVisible: true })
  }

  _goToPreviousMail () {
    this.props.prevId && this.setState({ currentId: this.props.prevId })
  }

  _goToNextMail () {
    this.props.nextId && this.setState({ currentId: this.props.nextId })
  }

  _handleMailRemoval (cb) {
    const { prevId, nextId } = this.props

    if (prevId || nextId) {
      this.setState({ currentId: prevId || nextId }, cb)
    } else {
      this.props.navigation.goBack()
      typeof cb === 'function' && cb()
    }
  }

  _trashMail (id) {
    this._handleMailRemoval(() => {
      this.props.mailboxTrashRequest(id)
      this.props.setMailboxIterationIds(this.state.currentId)
    })
  }

  _archiveMail (id) {
    this._handleMailRemoval(() => {
      this.props.mailboxArchiveRequest(id)
      this.props.setMailboxIterationIds(this.state.currentId)
    })
  }

  _inboxMail (id) {
    this._handleMailRemoval(() => {
      this.props.mailboxMoveToInboxRequest(id)
      this.props.setMailboxIterationIds(this.state.currentId)
    })
  }

  _updateIteratorIcons (props) {
    props = props || this.props
    const { nextId, prevId } = props

    props.navigation.setParams({
      nextId: nextId,
      prevId: prevId,
      goToNextMail: this._goToNextMail,
      goToPreviousMail: this._goToPreviousMail
    })
  }

  componentDidMount () {
    const { currentId } = this.state
    const thisData = this._getMailData()

    if (!thisData) {
      return
    }

    // Set the mailbox iteration ids
    this.props.setMailboxIterationIds(currentId)

    // Request pickup data
    if (thisData && !thisData.detail && thisData.is_msgsafe_store) {
      this.props.mailboxDetailRequest(currentId)
    }

    // Request analytics data
    if (thisData && !thisData.analytics) {
      this.props.mailboxAnalyticsRequest(currentId)
    }

    // Mark the email read
    if (currentId && !thisData.is_read) {
      this.props.mailboxReadRequest(currentId)
    }

    this._updateIteratorIcons()
    this._updateRemoteContentRules()
  }

  componentWillReceiveProps (nextProps) {
    // If the mailboxDetailId passed as a prop has changed,
    // then update the currentId in state
    if (this.props.navigation.state.params.id !== nextProps.navigation.state.params.id) {
      this.setState({ currentId: nextProps.navigation.state.params.id })
    }

    // If the next or the previous IDs have changed, update the iterator icons
    if ((this.props.nextId !== nextProps.nextId) || (this.props.prevId !== nextProps.prevId)) {
      this._updateIteratorIcons(nextProps)
    }

    const thisData = this._getMailData()
    const nextData = this._getMailData(nextProps)

    // If the pickup data has just come in, then mark the email read
    if (thisData && nextData && nextData.detail && !nextData.is_read && thisData.detail !== nextData.detail) {
      nextProps.mailboxReadRequest(this.state.currentId)
    }

    this._updateRemoteContentRules(nextProps)
  }

  componentWillUpdate (nextProps, nextState) {
    if (!this.props.mailboxCacheData[this.state.currentId] && nextProps.mailboxCacheData[this.state.currentId]) {
      this.props.clearMailboxIterationIds()
    }
    if (this.state.currentId === nextState.currentId || !nextState.currentId) return

    // If the currentId has changed in state then update the
    // iteration ids in redux store
    this.props.setMailboxIterationIds(nextState.currentId)

    const nextData = this._getMailData(nextProps, nextState)
    if (!nextData) return

    // Make the mailbox detail data request
    if (
      nextData.is_msgsafe_store && // and mail is meant for webmail
      !nextData.detail && // and mail detail data is not present
      // and the detail data is not already in progress
      (nextData.detailStatus ? !nextData.detailStatus.inProgress : true)
    ) {
      // then make the mailbox detail request
      this.props.mailboxDetailRequest(nextState.currentId)
    }

    // Make the mailbox analytics data request
    if (
      !nextData.analytics && // and mail analytics data is not present
      // and the detail data is not already in progress
      (nextData.analyticsStatus ? !nextData.analyticsStatus.inProgress : true)
    ) {
      // then make the mailbox detail request
      this.props.mailboxAnalyticsRequest(nextState.currentId)
    }
  }

  componentWillUnmount () {
    this.props.clearMailboxIterationIds()
  }

  render () {
    const data = this._getMailData()

    if (isEmpty(data) || isNil(data)) return null

    return (
      <View style={styles.main}>
        <ScrollView style={{ flex: 1 }}>
          <Header
            fromName={data.msg_from_displayname}
            toName={data.msg_to_displayname}
            subject={data.msg_subject}
            time={data.created_on}
            fromEmail={data.msg_from}
            toEmail={data.msg_to}
            isRead={data.is_read}
          />
          <AttachmentList {...data.detail} />
          { data && data.is_msgsafe_store &&
            <AnalyticsMap analyticsData={data.analytics} />
          }
          <Body
            data={data}
            imagesVisible={this.state.imagesVisible}
            // embeddedVisible={this.state.embeddedVisible}
            showImages={this._showImages}
          />
          { data && !data.is_msgsafe_store &&
            <AnalyticsMap analyticsData={data.analytics} defaultOpen withTopBorder />
          }
        </ScrollView>
        <TabBar
          data={data}
          trashMail={this._trashMail}
          archiveMail={this._archiveMail}
          inboxMail={this._inboxMail}
          displayNotification={this.props.displayNotification}
          mailboxReadRequest={this.props.mailboxReadRequest}
          mailboxUnreadRequest={this.props.mailboxUnreadRequest}
          filterName={this.props.filterName}
        />
      </View>
    )
  }
}

MailboxDetail.propTypes = {
  mailboxReadRequest: PropTypes.func,
  displayNotification: PropTypes.func,
  mailboxUnreadRequest: PropTypes.func,
  filterName: PropTypes.string,
  clearMailboxIterationIds: PropTypes.func,
  mailboxDetailRequest: PropTypes.func,
  mailboxAnalyticsRequest: PropTypes.func,
  mailboxArchiveRequest: PropTypes.func,
  mailboxTrashRequest: PropTypes.func,
  mailboxMoveToInboxRequest: PropTypes.func,
  setMailboxIterationIds: PropTypes.func,
  navigation: PropTypes.object,
  mailboxData: PropTypes.object,
  contactState: PropTypes.object,
  prevId: PropTypes.number,
  nextId: PropTypes.number
}

const mapStateToProps = state => ({
  isListDataAvailable: !!(state.mailbox.data || state.mailbox.searchResultsData),
  mailboxData: state.mailbox.searchResultsData || state.mailbox.data,
  mailboxCacheData: state.mailbox.cache,
  nextId: state.mailbox.nextId,
  prevId: state.mailbox.prevId,
  loadRemoteContent: state.user.data.pref_mail_load_remote_content,
  // loadEmbeddedImage: state.user.data.pref_mail_load_embedded_image,  // Render inline in content is deprecated, maybe can bbs
  contactRequestInProgress: state.contact.api.getContact.inProgress,
  contactState: state.contact,
  filterName: state.mailbox.filterName
})

const mapDispatchToProps = {
  mailboxDetailRequest: MailboxActions.mailboxDetailRequest,
  mailboxAnalyticsRequest: MailboxActions.mailboxAnalyticsRequest,
  mailboxReadRequest: MailboxActions.mailboxReadRequest,
  mailboxUnreadRequest: MailboxActions.mailboxUnreadRequest,
  mailboxTrashRequest: MailboxActions.mailboxTrashRequest,
  mailboxArchiveRequest: MailboxActions.mailboxArchiveRequest,
  mailboxMoveToInboxRequest: MailboxActions.mailboxMoveToInboxRequest,
  setMailboxIterationIds: MailboxActions.mailboxSetIterationIds,
  clearMailboxIterationIds: MailboxActions.mailboxClearIterationIds,
  displayNotification: NotificationActions.displayNotification,
  getContact: ContactActions.contactGetFromCacheOrRequest
}

export default connect(mapStateToProps, mapDispatchToProps)(MailboxDetail)
