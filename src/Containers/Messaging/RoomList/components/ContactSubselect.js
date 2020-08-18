import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { change } from 'redux-form'
import { DataPicker } from 'rnkit-actionsheet-picker'
import { NavigationActions, StackActions } from 'react-navigation'
import { Alert } from 'react-native'
import { injectIntl } from 'react-intl'
import { path, equals } from 'ramda'
import m from 'commons/I18n'
import ChatActions from 'commons/Redux/ChatRedux'
import ContactActions from 'commons/Redux/ContactRedux'

import DeviceContactActions from 'app/Redux/DeviceContactRedux'
import { pickDeviceContactEmailAddress } from 'app/Containers/Contacts/DeviceContactDetail/utils'
import { getDataItemForIdWithCacheFirst } from 'commons/Redux/_Utils'

export const FORM_IDENTIFIER = 'chat-contact-select'

class ContactSubselect extends Component {
  static propTypes = {
    contact: PropTypes.object,
    change: PropTypes.func.isRequired,
    chatCreateRoomRequest: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    toggleContactMsgsafeUsersFilter: PropTypes.func.isRequired,
    clearContactMsgsafeUsersFilter: PropTypes.func.isRequired,
    resetNavigation: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      selectedValue: 0
    }

    this.hasUnmounted = false
    this._handleCancel = this._handleCancel.bind(this)
    this._showIdentityPicker = this._showIdentityPicker.bind(this)
  }

  _showIdentityPicker (contact) {
    if (this.hasUnmounted) return

    const { selectedValue } = this.state
    const fm = this.props.intl.formatMessage

    const dataSource = contact.identities.map(this._getLabelForIdentity)
    const titleText = fm(m.native.Chat.selectIdentity)

    DataPicker.show({
      dataSource,
      titleText,
      defaultSelected: selectedValue ? [dataSource[selectedValue]] : [dataSource[0]],
      doneText: fm(m.app.Common.done),
      cancelText: fm(m.app.Common.cancel),
      numberOfComponents: 1,
      onPickerConfirm: (selectedData, selectedIndex) => {
        this._setIdentity(selectedIndex, () => {
          this._handleSubmit()
        })
      },
      onPickerCancel: this._handleCancel
    })
  }

  _getLabelForIdentity (identity) {
    return identity.email
  }

  _setIdentity (identityIndex, cb) {
    this.setState({
      selectedValue: identityIndex
    }, cb)
  }

  _handleCancel () {
    const { change } = this.props

    change(FORM_IDENTIFIER, 'data', null)
    this.setState({ selectedValue: 0 })
  }

  _handleSubmit (nextProps) {
    const props = nextProps || this.props
    const { contact } = props
    const identity = contact.identities[this.state.selectedValue]
    this._setupChat(identity, contact.email)
  }

  _setupChat (identity, contactEmail) {
    const {
      chatCreateRoomRequest,
      chatSetupExistingRoomRequest,
      goBack,
      roomsMap,
      navigate,
      identities,
      intl
    } = this.props

    var isMyIdentity = false
    // check if contactEmail is my email
    if (identities && (typeof identities === 'object')) {
      for (let id in identities) {
        if (identities[id].email === contactEmail) {
          isMyIdentity = true
          Alert.alert(
            intl.formatMessage(m.app.Common.warning),
            intl.formatMessage(m.native.Chat.cantChatWithYourself),
            [
              { text: intl.formatMessage(m.app.Common.ok), onPress: () => {} }
            ],
            { cancelable: true }
          )
          return
        }
      }
    }
    const roomId = roomsMap[`${contactEmail}__${identity.email}`] || roomsMap[`${identity.email}__${contactEmail}`]
    if (roomId) {
      chatSetupExistingRoomRequest(roomId, identity.email, identity.display_name, contactEmail)
      this.props.resetNavigation({
        index: 1,
        actions: [
          NavigationActions.navigate({ routeName: 'MessagingRoomList' }),
          NavigationActions.navigate({ routeName: 'MessagingRoom', params: { roomId } })
        ]
      })
    } else {
      chatCreateRoomRequest(identity.email, identity.display_name, contactEmail, false)
      navigate({ routeName: 'MessagingRoom', params: { roomId } })
    }
  }

  _handleContactSelect (props) {
    if (equals(this.props.contact, props.contact)) {
      return
    }
    if (this.props.contact && props.contact && props.contact.email === this.props.contact.email) {
      return
    }

    const { contact, navigate, goBack } = props
    if (!contact) return

    if (!contact.emailAddresses) {
      const resolve = (_contact) => {
        if (_contact.is_deleted) return
        if (_contact.identities.length === 1) {
          this._handleSubmit({ ...props, contact: _contact })
        } else {
          this._showIdentityPicker(_contact)
        }
      }
      this.props.contactGetFullObject(contact.email, resolve)
    } else if (contact.emailAddresses) {
      // If it's a device contact with .emailAddresses
      // make user pick an email address (if there are multiple)
      pickDeviceContactEmailAddress(contact, selectedEmail => {
        // Then make user pick an identity
        navigate({
          routeName: 'IdentitySelection',
          params: {
            disableSwipe: true,
            selectItemAndPop: identity => {
              goBack()
              this._setupChat(identity, selectedEmail)
            }
          }
        })
      }, this._handleCancel)
    }
  }

  componentWillMount () {
    const { toggleContactMsgsafeUsersFilter, enablePlatformUserFilter } = this.props
    toggleContactMsgsafeUsersFilter()
    enablePlatformUserFilter()
  }

  componentWillReceiveProps (nextProps) {
    this._handleContactSelect(nextProps)

    if (this.props.deviceContactTotalLength !== nextProps.deviceContactTotalLength) {
      this.props.enablePlatformUserFilter()
    }
  }

  componentWillUnmount () {
    const { clearContactMsgsafeUsersFilter, clearPlatformUserFilter, contactClearSearchData } = this.props

    contactClearSearchData()
    clearContactMsgsafeUsersFilter()
    clearPlatformUserFilter()
    this.hasUnmounted = true
  }

  render () {
    return null
  }
}

const mapStateToProps = state => {
  const contact = path(['form', FORM_IDENTIFIER, 'values', 'data'], state)
  return {
    identities: state.identity.data,
    roomsMap: state.chat.roomsMap,
    rooms: state.chat.data,
    deviceContactTotalLength: path(['deviceContact', 'searchResultsDataTotalCount'], state),
    contact: contact ? getDataItemForIdWithCacheFirst(state.contact, contact.email) : null
  }
}

const mapDispatchToProps = {
  change,
  contactGetFullObject: ContactActions.contactGetFullObject,
  chatCreateRoomRequest: ChatActions.chatCreateRoomRequest,
  chatSetupExistingRoomRequest: ChatActions.chatSetupExistingRoomRequest,
  goBack: NavigationActions.back,
  navigate: NavigationActions.navigate,
  resetNavigation: StackActions.reset,
  toggleContactMsgsafeUsersFilter: ContactActions.toggleContactMsgsafeUsersFilter,
  clearContactMsgsafeUsersFilter: ContactActions.clearContactMsgsafeUsersFilter,
  contactClearSearchData: ContactActions.contactClearSearchData,
  enablePlatformUserFilter: DeviceContactActions.enablePlatformUserFilter,
  clearPlatformUserFilter: DeviceContactActions.clearPlatformUserFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ContactSubselect))
