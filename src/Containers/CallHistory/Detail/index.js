import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { NavigationActions, StackActions } from 'react-navigation'
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { withStateHandlers, compose, setStatic } from 'recompose'
import * as R from 'ramda'
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import m from 'commons/I18n'
import ChatActions from 'commons/Redux/ChatRedux'
import ContactActions from 'commons/Redux/ContactRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'
import WebrtcActions from 'commons/Redux/WebrtcRedux'
import { getDataItemForId, getDataItemForIdWithCacheFirst } from 'commons/Redux/_Utils'

import { showIdentitySelectAndCallback } from 'app/Lib/Identity'
import { checkMicCamPermissions, showNoMicCamPermissionModal } from 'app/Lib/Device'
import { Header, Button, ButtonGroup } from 'app/Components/DetailView'
import HeaderButton from 'app/Components/HeaderButton'
import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'
import { getRelativeCallDate, getRelativeCallTime, getCallType, getCallStateTranslationKey } from 'app/Containers/CallHistory/_Utils'
import BatchUpdateProgress from 'app/Containers/Mailbox/List/components/BatchUpdateProgress'

const styles = EStyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },

  buttonWidth: {
    maxWidth: '25%'
  },

  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttonSectionSpinnerContainer: {
    height: '4rem'
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

  relativeDate: {
    marginBottom: '0.5rem'
  },

  timeStatus: {
    alignItems: 'center',
    flexDirection: 'row'
  },

  time: {
    width: '20%'
  },

  status: {
    width: '45%'
  },

  type: {
    textAlign: 'right'
  },

  typeIcon: {
    marginRight: 3
  },

  label: {
    marginTop: '0.25rem',
    fontSize: '0.9rem',
    color: palette.wetAsphalt
  },
  viewContact: {
    color: palette.peterRiver,
    fontWeight: '700'
  },
  blockContact: {
    color: palette.pomegranate,
    fontWeight: '700'
  },
  disabledBlockContact: {
    color: palette.concrete
  }
})

class CallDetail extends Component {
  static propTypes = {
    videoCallRequest: PropTypes.func.isRequired,
    resetNavigation: PropTypes.func.isRequired,
    chatCreateRoomRequest: PropTypes.func.isRequired,
    chatSetupExistingRoomRequest: PropTypes.func.isRequired,
    toggleContactUpdateInProgress: PropTypes.func.isRequired,
    updateContactRequest: PropTypes.func.isRequired,
    contactGetFullObject: PropTypes.func.isRequired,
    navigation: PropTypes.object,
    roomsMap: PropTypes.object,
    email: PropTypes.string.isRequired,
    intl: PropTypes.object,
    contact: PropTypes.object,
    timezone: PropTypes.string,
    data: PropTypes.object,
    contactUpdateInProgress: PropTypes.bool,
    hasCamera: PropTypes.bool,
    hasMicrophone: PropTypes.bool,
    isOnline: PropTypes.bool,
    socketConnected: PropTypes.bool
  }
  constructor (props) {
    super(props)

    this._ensureVerboseContactData = this._ensureVerboseContactData.bind(this)

    this._chatWithIdentity = this._chatWithIdentity.bind(this)
    this._chat = this._chat.bind(this)

    this._videoCallWithIdentity = this._videoCallWithIdentity.bind(this)
    this._videoCall = this._videoCall.bind(this)

    this._audioCallWithIdentity = this._audioCallWithIdentity.bind(this)
    this._audioCall = this._audioCall.bind(this)

    this._blockContact = this._blockContact.bind(this)
    this._unblockContact = this._unblockContact.bind(this)
    this._navigateToContactDetail = this._navigateToContactDetail.bind(this)
    this._navigateToIdentityDetail = this._navigateToIdentityDetail.bind(this)

    this.state = {
      selectedIdentityIdForChat: null
    }
  }

  _ensureVerboseContactData (nextProps) {
    const props = nextProps || this.props

    const { email, getContactApi, contact } = props

    if (getContactApi.inProgress || (contact && contact.identities) || (contact && contact.is_deleted)) {
      return
    }

    if (!nextProps || !R.equals(contact, this.props.contact)) {
      this.props.contactGetFullObject(email)
    }
  }

  _selectIdentity (callback) {
    const { contact, intl } = this.props
    if (!contact.identities) return null
    showIdentitySelectAndCallback(contact.identities, callback, intl.formatMessage)
  }

  _audioCallWithIdentity (identity) {
    const { contact } = this.props
    if (!contact) return

    const audioOnly = true
    this.props.videoCallRequest(identity.email, this.props.email, contact.display_name, audioOnly)
  }

  _audioCall () {
    const { identities } = this.props.contact

    checkMicCamPermissions().then((r) => {
      if (!r) {
        showNoMicCamPermissionModal()
        return
      }

      if (identities.length === 1) {
        this._audioCallWithIdentity(identities[0])
      } else {
        this._selectIdentity(this._audioCallWithIdentity)
      }
    })
  }

  _videoCallWithIdentity (identity) {
    const { contact } = this.props
    if (!contact) return

    const audioOnly = false
    this.props.videoCallRequest(identity.email, this.props.email, contact.display_name, audioOnly)
  }

  _videoCall () {
    const { identities } = this.props.contact

    checkMicCamPermissions().then((r) => {
      if (!r) {
        showNoMicCamPermissionModal()
        return
      }

      if (identities.length === 1) {
        this._videoCallWithIdentity(identities[0])
      } else {
        this._selectIdentity(this._videoCallWithIdentity)
      }
    })
  }

  _chatWithIdentity (identity) {
    const {
      navigation, roomsMap, chatCreateRoomRequest, chatSetupExistingRoomRequest, email
    } = this.props
    const roomId = roomsMap[`${identity.email}__${email}`] || roomsMap[`${email}__${identity.email}`]
    // Room already exists
    if (roomId) {
      chatSetupExistingRoomRequest(roomId, identity.email, identity.display_name, email)
    } else {
      chatCreateRoomRequest(identity.email, identity.display_name, email, false)
    }
    this.props.resetNavigation({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'CallHistoryList' })
      ]
    })
    navigation.navigate({ routeName: 'MessagingRoom', params: { roomId } })
  }

  _chat () {
    const { identities } = this.props.contact
    if (identities.length === 1) {
      this._chatWithIdentity(identities[0])
    } else {
      this._selectIdentity(this._chatWithIdentity)
    }
  }

  _navigateToContactDetail () {
    const { contact, navigation } = this.props
    const identity = this._getIdentity()
    navigation.navigate({
      routeName: 'ContactDetail',
      params: {
        id: contact.email,
        createIfNotExisting: {
          email: contact.email,
          identity_id: identity.id,
          identity_email: identity.email,
          display_name: contact.display_name
        }
      }
    })
  }

  _goToList () {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'CallHistoryList' })]
    }))
  }
  _navigateToIdentityDetail () {
    const { navigation } = this.props
    const identity = this._getIdentity()
    navigation.navigate('IdentityDetail', { id: identity.id, email: identity.email })
  }

  _blockContact () {
    this.props.toggleContactUpdateInProgress()
    this.props.updateContactRequest(
      { ...this.props.contact, state: -1 },
      this.props.toggleContactUpdateInProgress,
      this.props.toggleContactUpdateInProgress
    )
  }

  _unblockContact () {
    this.props.toggleContactUpdateInProgress()
    this.props.updateContactRequest(
      { ...this.props.contact, state: 1 },
      this.props.toggleContactUpdateInProgress,
      this.props.toggleContactUpdateInProgress
    )
  }

  _ensureIdentityData (props = this.props) {
    const identityEmail = props.data.user_email
    if (!props.identity && !props.getIdentityApi.inProgress && identityEmail && !props.identity) {
      props.getIdentity({ search: { identity_email: identityEmail }, limit: 1 })
    }
  }

  _getIdentity (nextProps) {
    const props = nextProps || this.props
    const { data } = props

    if (!data) return null
    return props.identity || { email: data.user_email }
  }

  componentDidMount () {
    this._ensureIdentityData()
    this._ensureVerboseContactData()
  }

  componentWillReceiveProps (nextProps) {
    this._ensureVerboseContactData(nextProps)
    if (!R.isNil(this.props.data) && R.isNil(nextProps.data)) {
      this._goToList()
    }
  }

  render () {
    const {
      contact, navigation, intl, email, data, contactUpdateInProgress, hasMicrophone, hasCamera, isOnline, socketConnected
    } = this.props
    const fm = intl.formatMessage

    let _contact = contact
    const identity = this._getIdentity()

    if (!contact) {
      _contact = { email, display_name: email }
    }

    if (!data) {
      return (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator animating />
        </View>
      )
    }
    const hasIsMsgsafeUser = !R.isNil(_contact.is_msgsafe_user)
    const isPlatformUser = hasIsMsgsafeUser && _contact.is_msgsafe_user && !_contact.is_deleted
    const isIdentitiesloaded = hasIsMsgsafeUser && !R.isNil(_contact.identities)

    const callTypeDetails = getCallType(data)
    const callStateTraslationKey = getCallStateTranslationKey(data)

    return (
      <ScrollView style={styles.main}>
        <Header name={_contact.display_name} email={email} />
        <View style={styles.section}>
          <Text style={[styles.label, styles.relativeDate]}>
            {fm(m.native.Chat.withYourIdentity)}
          </Text>
          <TouchableOpacity onPress={this._navigateToIdentityDetail} disabled={!identity.id}>
            <Text style={[styles.label, styles.viewContact]}>
              {identity.display_name ? identity.display_name : null} {`<${identity.email}>`}
            </Text>
          </TouchableOpacity>
        </View>

        <ButtonGroup>
          { !hasIsMsgsafeUser &&
            <View style={[styles.spinnerContainer, styles.buttonSectionSpinnerContainer]}>
              <ActivityIndicator animating />
            </View>
          }
          { hasIsMsgsafeUser &&
            <Button
              text={fm(m.app.Common.email)}
              iconComponent={EntypoIcon}
              iconName='mail'
              style={styles.buttonWidth}
              onPress={() => {
                navigation.goBack()
                navigation.navigate('MailboxCompose', { recipientEmail: email })
              }}
              disabled={!isOnline}
            />
          }

          { isPlatformUser &&
            <Button
              text={fm(m.native.Chat.call)}
              iconComponent={FontAwesomeIcon}
              iconName='phone'
              style={styles.buttonWidth}
              onPress={() => this._audioCall()}
              disabled={!socketConnected || !hasMicrophone || !isIdentitiesloaded}
            />
          }

          { isPlatformUser &&
            <Button
              text={fm(m.native.Chat.title)}
              iconComponent={FontAwesomeIcon}
              iconName='video-camera'
              style={styles.buttonWidth}
              onPress={() => this._videoCall()}
              disabled={!socketConnected || !hasMicrophone || !hasCamera || !isIdentitiesloaded}
            />
          }

          { isPlatformUser &&
            <Button
              text={fm(m.native.Chat.chat)}
              iconComponent={FontAwesomeIcon}
              iconName='comment'
              style={styles.buttonWidth}
              onPress={this._chat}
              disabled={!socketConnected || !isIdentitiesloaded}
            />
          }
        </ButtonGroup>
        <View style={styles.section}>
          <Text style={[styles.label, styles.relativeDate]}>
            {getRelativeCallDate(data.call_id, this.props.timezone, false, fm(m.app.Chat.yesterday), fm(m.app.Chat.today))}
          </Text>
          <View style={[styles.timeStatus]}>
            <Text style={[styles.label, styles.time]}>{getRelativeCallTime(data.call_id, this.props.timezone)}</Text>
            <Text style={[styles.label, styles.status]}>{fm(m.native.CallHistory[callStateTraslationKey])}</Text>
            <View style={[styles.timeStatus]}>
              <MaterialIcons style={[styles.label, styles.typeIcon, callTypeDetails.iconStyle]} name={callTypeDetails.icon} />
              <Text style={[styles.label, styles.type, callTypeDetails.textStyle]}>
                {fm(m.native.CallHistory[callTypeDetails.callTypeTranslationKey])}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={this._navigateToContactDetail}>
            <Text style={[styles.label, styles.viewContact]}>
              {fm(m.native.Contact.viewContact)}
            </Text>
          </TouchableOpacity>
        </View>

        { (!R.isNil(_contact.state) && !_contact.is_deleted) &&
          <View style={styles.section}>
            <TouchableOpacity onPress={_contact.state === 1 ? this._blockContact : this._unblockContact} disabled={!isOnline}>
              <Text style={[styles.label, styles.blockContact, !isOnline && styles.disabledBlockContact]}>
                {_contact.state === 1 ? fm(m.native.Contact.blockContact) : fm(m.native.Contact.unblockContact)}
              </Text>
            </TouchableOpacity>
          </View>
        }

        {contactUpdateInProgress && <BatchUpdateProgress />}

      </ScrollView>
    )
  }
}

const navigationOptions = ({ navigation, screenProps: { fm } }) => {
  const data = {
    tabBarVisible: false,
    title: fm(m.native.CallHistory.detailsTitle),
    headerLeft: <HeaderButton isBack onPress={() => navigation.goBack()} />
  }
  return data
}

const mapStateToProps = (state, ownProps) => {
  const callId = R.path(['navigation', 'state', 'params', 'callId'], ownProps)
  const data = getDataItemForId(state.callHistory, callId)

  const email = data ? data.contact_user_email : null
  return {
    callId,
    data,
    email,
    avatarImage: R.path(['avatar', 'emails', email], state),
    contact: getDataItemForIdWithCacheFirst(state.contact, email),
    getContactApi: state.contact.api.getContactUnique,
    roomsMap: state.chat.roomsMap,
    rooms: state.chat.data,
    timezone: state.user.data.timezone || null,
    hasMicrophone: state.device.has_microphone,
    hasCamera: state.device.has_camera,
    isOnline: state.app.isNetworkOnline,
    socketConnected: state.chat.socketConnected,
    identity: data ? getDataItemForId(state.identity, data.user_email) : null,
    getIdentityApi: R.path(['identity', 'api', 'getIdentity'], state)
  }
}

const mapDispatchToProps = {
  getIdentity: IdentityActions.identityGetFromCacheOrRequest,
  contactGetFullObject: ContactActions.contactGetFullObject,
  videoCallRequest: WebrtcActions.makeOutboundVideoCallOffer,
  chatCreateRoomRequest: ChatActions.chatCreateRoomRequest,
  chatSetupExistingRoomRequest: ChatActions.chatSetupExistingRoomRequest,
  updateContactRequest: ContactActions.contactEdit,
  resetNavigation: StackActions.reset
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

export default enhance(CallDetail)
