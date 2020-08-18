import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { withStateHandlers, compose, setStatic } from 'recompose'
import { connect } from 'react-redux'
import { NavigationActions, StackActions } from 'react-navigation'
import { View, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native'
import * as R from 'ramda'
import EStyleSheet from 'react-native-extended-stylesheet'
import moment from 'moment'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { getActiveParentRouteName } from 'app/Navigation/utils'
import m from 'commons/I18n'
import { getDataItemForIdWithCacheFirst } from 'commons/Redux/_Utils'
import { isMyIdentityEmail } from 'commons/Selectors/Identity'
import ContactActions from 'commons/Redux/ContactRedux'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'
import WebRTCActions from 'app/Redux/WebRTCRedux'
import SimpleTiles from 'app/Components/SimpleTiles'
import { Header, Button, ButtonGroup } from 'app/Components/DetailView'
import HeaderButton from 'app/Components/HeaderButton'
import palette from 'app/Styles/colors'
import Encryption from './components/Encryption'

import BatchUpdateProgress from 'app/Containers/Mailbox/List/components/BatchUpdateProgress'

const styles = EStyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },

  buttonWidth: {
    maxWidth: '25%'
  },

  buttonSectionSpinnerContainer: {
    height: '4rem'
  },

  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  section: {
    backgroundColor: 'white',
    flexDirection: 'column',
    alignSelf: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: palette.clouds,
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds,
    width: '100%',
    justifyContent: 'flex-start'
  },
  label: {
    marginTop: '0.25rem',
    fontSize: '0.9rem',
    color: palette.wetAsphalt
  },
  blockContact: {
    color: palette.pomegranate,
    fontWeight: '700'
  },
  disabledBlockContact: {
    color: palette.concrete
  }
})

class ContactDetail extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    intl: PropTypes.object,
    bootCallProcess: PropTypes.func,
    bootChatProcess: PropTypes.func,
    toggleContactUpdateInProgress: PropTypes.func.isRequired,
    updateContactRequest: PropTypes.func.isRequired,
    data: PropTypes.object,
    activeRootNavRouteName: PropTypes.string,
    appActionAvailable: PropTypes.bool,
    hasCamera: PropTypes.bool,
    hasMicrophone: PropTypes.bool,
    isOnline: PropTypes.bool,
    socketConnected: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._createIfNotExistingSelector = R.path(['navigation', 'state', 'params', 'createIfNotExisting'])
    this._ensureVerboseContactData = this._ensureVerboseContactData.bind(this)
    this._saveContact = this._saveContact.bind(this)
    this._blockContact = this._blockContact.bind(this)
    this._unblockContact = this._unblockContact.bind(this)
  }

  _ensureVerboseContactData (nextProps) {
    const props = nextProps || this.props

    const {
      email, getContactApi, data, navigation, intl
    } = props
    const fm = intl.formatMessage
    // No need to invoke get contact API if:
    // api request is already in progress, or
    // `data.contacts` is present, or
    // `data.is_deleted` is `true` - which means that the contact is no more in the contact list.

    // `is_deleted` is set for the contacts with whom the user has active chat rooms but are not in user's contact list
    if (getContactApi.inProgress || (data && data.contacts && !data.is_deleted)) {
      return
    }

    if ((!nextProps || !R.equals(email, this.props.email)) && !(data && data.is_deleted)) {
      this.props.contactGetFullObject(email)
      return
    }

    if (data && data.is_deleted) {
      if (this._createIfNotExistingSelector(props) && !this.didPrompt) {
        Alert.alert(
          fm(m.native.Contact.notExistingContact),
          fm(m.native.Contact.addToYourContactList),
          [
            {
              text: fm(m.app.Common.later),
              onPress: () => {
                navigation.setParams({
                  createIfNotExisting: null
                })
              },
              style: 'cancel'
            }, {
              text: fm(m.app.Common.yes),
              onPress: () => {
                this._saveContact()
              }
            }
          ],
          { cancelable: false }
        )
        this.didPrompt = true
      }
    }
  }

  _startVideoCallWith = () => this.props.bootCallProcess(this.props.data, false, this.props.intl.formatMessage)
  _startAudioCallWith = () => this.props.bootCallProcess(this.props.data, true, this.props.intl.formatMessage)
  _startTextChatWith = () => {
    this.props.bootChatProcess(
      this.props.data,
      true,
      this.props.activeRootNavRouteName,
      this.props.intl.formatMessage
    )
  }

  _getHistoryData () {
    const { data, intl } = this.props
    const fm = intl.formatMessage
    return [
      { title: fm(m.app.Common.lastActivity), description: `${moment.utc(data.last_activity_on).fromNow()}` },
      { title: fm(m.app.Common.modified), description: `${moment.utc(data.modified_on).fromNow()}` },
      { title: fm(m.app.Common.created), description: `${moment.utc(data.created_on).fromNow()}` }
    ]
  }

  _saveContact () {
    const { navigation } = this.props
    const params = this._createIfNotExistingSelector(this.props) || {}
    navigation.navigate('EditContact', {
      id: navigation.state.params.id,
      identity_id: params.identity_id,
      identity_email: params.identity_email,
      createForm: true,
      dirty: true
    })
  }

  _blockContact () {
    this.props.toggleContactUpdateInProgress()
    this.props.updateContactRequest(
      { ...this.props.data, state: -1 },
      this.props.toggleContactUpdateInProgress,
      this.props.toggleContactUpdateInProgress
    )
  }

  _unblockContact () {
    this.props.toggleContactUpdateInProgress()
    this.props.updateContactRequest(
      { ...this.props.data, state: 1 },
      this.props.toggleContactUpdateInProgress,
      this.props.toggleContactUpdateInProgress
    )
  }

  _getEmailsCountData () {
    const { data, intl } = this.props
    const fm = intl.formatMessage
    return [
      {
        title: fm(m.app.Common.received),
        description: data.lt_mail_recv
        // footerButtonText: 'View All'
      },
      {
        title: fm(m.app.Common.sent),
        description: data.lt_mail_sent
        // footerButtonText: 'View All'
      },
      {
        title: fm(m.app.Common.blocked),
        description: data.lt_mail_recv_blocked
        // footerButtonText: 'View All'
      }
    ]
  }

  _goToList () {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'ContactList' })]
    }))
  }

  _updateNavigationIsOnline (nextProps) {
    const { navigation, isOnline } = nextProps
    setTimeout(() => {
      if (R.path(['state', 'params', 'isOnline'], navigation) !== isOnline) {
        navigation.setParams({ isOnline })
      }
    }, 100)
  }

  componentDidMount () {
    this._updateNavigationIsOnline(this.props)
    this._ensureVerboseContactData()
    if (this.props.data && this.props.data.is_deleted) {
      this.props.navigation.setParams({ hideEditButton: true })
    }
  }

  componentDidUpdate (prevProps) {
    if (!R.equals(prevProps.data, this.props.data) && this.props.data && this.props.data.is_deleted) {
      this.props.navigation.setParams({ hideEditButton: true })
    }
  }

  componentWillReceiveProps (nextProps) {
    this._updateNavigationIsOnline(this.props)
    this._ensureVerboseContactData(nextProps)
    if (!R.isNil(this.props.data) && R.isNil(nextProps.data)) {
      // to avoid route doesnot exists error, simply goback and let the previous page handle the null data state
      this.props.navigation.goBack()
    }
  }

  render () {
    const {
      data, navigation, intl, appActionAvailable, contactUpdateInProgress,
      hasMicrophone, hasCamera, isOnline, socketConnected, callInProgress
    } = this.props
    const fm = intl.formatMessage

    if (!data) {
      return (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator animating />
        </View>
      )
    }

    const hasIsMsgsafeUser = !R.isNil(data.is_msgsafe_user)
    const isInMsgSafeContactList = hasIsMsgsafeUser && !data.is_deleted
    const isIdentitiesloaded = hasIsMsgsafeUser && !R.isNil(data.identities)
    const disabled = !isIdentitiesloaded || !isOnline

    return (
      <ScrollView style={styles.main}>
        <Header name={data.display_name} email={data.email} />
        <ButtonGroup>
          {!hasIsMsgsafeUser &&
            <View style={[styles.spinnerContainer, styles.buttonSectionSpinnerContainer]}>
              <ActivityIndicator animating />
            </View>
          }
          {hasIsMsgsafeUser &&
            <Button
              text={fm(m.app.Common.email)}
              iconComponent={EntypoIcon}
              iconName='mail'
              style={styles.buttonWidth}
              onPress={() => navigation.navigate('MailboxCompose', { recipientEmail: data.email })}
              disabled={!isOnline}
            />
          }

          {!isInMsgSafeContactList &&
            <Button
              text={fm(m.native.Chat.saveContact)}
              iconComponent={FontAwesomeIcon}
              iconName='user-plus'
              style={styles.buttonWidth}
              onPress={this._saveContact}
              disabled={!isOnline}
            />
          }

          {(appActionAvailable && isInMsgSafeContactList) &&
            <Button
              text={fm(m.native.Chat.call)}
              iconComponent={FontAwesomeIcon}
              iconName='phone'
              style={styles.buttonWidth}
              onPress={this._startAudioCallWith}
              disabled={disabled || !socketConnected || !hasMicrophone || callInProgress}
            />
          }

          {(appActionAvailable && isInMsgSafeContactList) &&
            <Button
              text={fm(m.native.Chat.title)}
              iconComponent={FontAwesomeIcon}
              iconName='video-camera'
              style={styles.buttonWidth}
              onPress={this._startVideoCallWith}
              disabled={disabled || !socketConnected || !hasMicrophone || !hasCamera || callInProgress}
            />
          }

          {(appActionAvailable && isInMsgSafeContactList) &&
            <Button
              text={fm(m.native.Chat.chat)}
              iconComponent={FontAwesomeIcon}
              iconName='comment'
              style={styles.buttonWidth}
              onPress={this._startTextChatWith}
              disabled={disabled || !socketConnected}
            />
          }
        </ButtonGroup>

        { isInMsgSafeContactList &&
          <SimpleTiles
            title={fm(m.native.Chat.history).toUpperCase()}
            titleIconComponent={FontAwesomeIcon}
            titleIconName='history'
            tilesData={this._getHistoryData()}
          />
        }

        { isInMsgSafeContactList &&
          <SimpleTiles
            title={fm(m.native.Chat.emails).toUpperCase()}
            titleIconComponent={FontAwesomeIcon}
            titleIconName='envelope'
            tilesData={this._getEmailsCountData()}
          />
        }

        {(data.notes && isInMsgSafeContactList)
          ? <SimpleTiles
            title={fm(m.native.Chat.notes).toUpperCase()}
            titleIconComponent={FontAwesomeIcon}
            titleIconName='file-text-o'
            tilesData={[{ title: null, description: data.notes }]}
          /> : null
        }

        { isInMsgSafeContactList && <Encryption {...this.props} /> }
        { (!R.isNil(data.state) && !data.is_deleted) &&
          <View style={styles.section}>
            <TouchableOpacity onPress={data.state === 1 ? this._blockContact : this._unblockContact} disabled={!isOnline}>
              <Text style={[styles.label, styles.blockContact, !isOnline && styles.disabledBlockContact]}>
                {data.state === 1 ? fm(m.native.Contact.blockContact) : fm(m.native.Contact.unblockContact)}
              </Text>
            </TouchableOpacity>
          </View>
        }
        {contactUpdateInProgress && <BatchUpdateProgress />}
      </ScrollView>
    )
  }
}

const EditHeaderButton = withNetworkState(({ fm, navigation, networkOnline }) => (
  <HeaderButton
    title={fm(m.app.Common.edit)}
    onPress={() => navigation.navigate('EditContact', { id: navigation.state.params.id })}
    color={palette.link}
    disabled={!networkOnline}
  />
))

const navigationOptions = ({ navigation, screenProps }) => {
  const data = {
    tabBarVisible: false,
    title: screenProps.fm(m.native.Contact.contact),
    headerLeft: <HeaderButton isBack onPress={() => navigation.goBack()} />
  }

  const hideEditButton = R.path(['state', 'params', 'hideEditButton'], navigation)
  if (!hideEditButton) {
    data.headerRight = (
      <EditHeaderButton
        fm={screenProps.fm}
        navigation={navigation}
      />
    )
  }
  return data
}

const mapStateToProps = (state, ownProps) => {
  const email = R.path(['navigation', 'state', 'params', 'id'], ownProps)
  const data = getDataItemForIdWithCacheFirst(state.contact, email)
  const appActionAvailable = data && !!data.is_msgsafe_user && !isMyIdentityEmail(email, state)
  const activeRootNavRouteName = getActiveParentRouteName(state.nav)
  return {
    email,
    data,
    appActionAvailable,
    activeRootNavRouteName,
    avatarImage: R.path(['avatar', 'emails', email], state),
    getContactApi: state.contact.api.getContactUnique,
    hasMicrophone: state.device.has_microphone,
    hasCamera: state.device.has_camera,
    socketConnected: state.chat.socketConnected,
    isOnline: state.app.isNetworkOnline,
    callInProgress: state.webrtc.inProgress
  }
}

const mapDispatchToProps = {
  contactGetFullObject: ContactActions.contactGetFullObject,
  updateContactRequest: ContactActions.contactEdit,
  bootCallProcess: WebRTCActions.bootCallProcess,
  bootChatProcess: WebRTCActions.bootChatProcess
}

const enhance = compose(
  setStatic('navigationOptions', navigationOptions),
  connect(mapStateToProps, mapDispatchToProps),
  withStateHandlers(
    {
      contactUpdateInProgress: false
    },
    {
      toggleContactUpdateInProgress:
        ({ contactUpdateInProgress }) =>
          () => ({ contactUpdateInProgress: !contactUpdateInProgress })
    }
  ),
  injectIntl
)

export default enhance(ContactDetail)
