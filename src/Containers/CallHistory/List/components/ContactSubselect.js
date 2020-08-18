import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { change } from 'redux-form'
import { DataPicker } from 'rnkit-actionsheet-picker'
import { NavigationActions, StackActions } from 'react-navigation'
import { Alert } from 'react-native'
import { injectIntl } from 'react-intl'
import { path, equals } from 'ramda'
import m from 'commons/I18n'
import WebrtcActions from 'commons/Redux/WebrtcRedux'
import ContactActions from 'commons/Redux/ContactRedux'

import { checkMicCamPermissions, showNoMicCamPermissionModal } from 'app/Lib/Device'

import DeviceContactActions from 'app/Redux/DeviceContactRedux'
import { pickDeviceContactEmailAddress } from 'app/Containers/Contacts/DeviceContactDetail/utils'
import { getDataItemForIdWithCacheFirst } from 'commons/Redux/_Utils'

export const FORM_IDENTIFIER = 'call-contact-select'

class ContactSubselect extends Component {
  static propTypes = {
    contact: PropTypes.object,
    intl: PropTypes.object,
    deviceContactTotalLength: PropTypes.number,
    change: PropTypes.func.isRequired,
    videoCallRequest: PropTypes.func.isRequired,
    toggleContactMsgsafeUsersFilter: PropTypes.func.isRequired,
    clearContactMsgsafeUsersFilter: PropTypes.func.isRequired,
    enablePlatformUserFilter: PropTypes.func.isRequired,
    clearPlatformUserFilter: PropTypes.func.isRequired,
    contactClearSearchData: PropTypes.func.isRequired,
    resetNavigation: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      identityIndex: 0,
      callTypeIndex: 0
    }

    const fm = props.intl.formatMessage

    this.callTypes = [
      fm(m.native.Chat.call),
      fm(m.native.Chat.title)
    ]

    this.hasUnmounted = false
    this._handleCancel = this._handleCancel.bind(this)
    this._showCallTypePicker = this._showCallTypePicker.bind(this)
    this._showIdentityPicker = this._showIdentityPicker.bind(this)
  }

  _showIdentityPicker (contact) {
    if (this.hasUnmounted) return

    const { identityIndex } = this.state
    const fm = this.props.intl.formatMessage

    const dataSource = contact.identities.map(this._getLabelForIdentity)
    const titleText = fm(m.native.Chat.selectIdentity)

    DataPicker.show({
      dataSource,
      titleText,
      defaultSelected: identityIndex ? [dataSource[identityIndex]] : [dataSource[0]],
      doneText: fm(m.app.Common.done),
      cancelText: fm(m.app.Common.cancel),
      numberOfComponents: 1,
      onPickerConfirm: (selectedData, selectedIndex) => {
        this._setIdentity(selectedIndex[0], () => {
          setTimeout(this._showCallTypePicker, 1000) // adding a delay to avoid app crash on android
        })
      },
      onPickerCancel: this._handleCancel
    })
  }

  _showCallTypePicker () {
    if (this.hasUnmounted) return

    const { callTypeIndex } = this.state
    const fm = this.props.intl.formatMessage

    const dataSource = this.callTypes
    const titleText = ''

    DataPicker.show({
      dataSource,
      titleText,
      defaultSelected: callTypeIndex ? [dataSource[callTypeIndex]] : [dataSource[0]],
      doneText: fm(m.app.Common.done),
      cancelText: fm(m.app.Common.cancel),
      numberOfComponents: 1,
      onPickerConfirm: (selectedData, selectedIndex) => {
        this._setCallType(selectedIndex[0], () => {
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
    this.setState({ identityIndex }, cb)
  }

  _setCallType (callTypeIndex, cb) {
    this.setState({ callTypeIndex }, cb)
  }

  _reset () {
    const { change } = this.props
    change(FORM_IDENTIFIER, 'data', null)
  }

  _handleCancel () {
    this._reset()
    this.setState({ identityIndex: 0, callTypeIndex: 0 })
  }

  _handleSubmit (nextProps) {
    const props = nextProps || this.props
    const { contact } = props
    const identity = contact.identities[this.state.identityIndex]
    const audioOnly = this.state.callTypeIndex === 0
    this._setupCall(identity, contact.email, contact.display_name, audioOnly)
  }

  _setupCall (identity, contactEmail, displayName, audioOnly) {
    this.props.resetNavigation({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'CallHistoryList' })
      ]
    })
    this.props.videoCallRequest(identity.email, contactEmail, displayName, audioOnly)
  }

  _handleValidateContactSelectRequest (nextProps) {
    const props = nextProps || this.props
    if (
      this.props.contact &&
      nextProps.contact &&
      this.props.contact.email === nextProps.contact.email
    ) {
      return
    }

    if (!props.contact) return

    checkMicCamPermissions().then((r) => {
      if (!r) {
        showNoMicCamPermissionModal()
        this._reset()
        return
      }
      const { identities, intl } = nextProps
      if (identities && (typeof identities === 'object')) {
        for (let id in identities) {
          if (identities[id].email === props.contact.email) {
            Alert.alert(
              intl.formatMessage(m.app.Common.warning),
              intl.formatMessage(m.native.Chat.cantCallYourself),
              [
                { text: intl.formatMessage(m.app.Common.ok), onPress: () => {} }
              ],
              { cancelable: true }
            )
            this._reset()
            return
          }
        }
      }
      this._handleContactSelect(nextProps)
    })
  }

  _handleContactSelect (props) {
    const { contact, navigate, goBack } = props

    if (!contact.emailAddresses) {
      const resolve = (_contact) => {
        if (_contact.is_deleted) return
        if (_contact.identities.length === 1) {
          this._showCallTypePicker()
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
              this._setupCall(identity, selectedEmail)
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
    this._handleValidateContactSelectRequest(nextProps)

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
  goBack: NavigationActions.back,
  navigate: NavigationActions.navigate,
  resetNavigation: StackActions.reset,
  contactGetFullObject: ContactActions.contactGetFullObject,
  toggleContactMsgsafeUsersFilter: ContactActions.toggleContactMsgsafeUsersFilter,
  clearContactMsgsafeUsersFilter: ContactActions.clearContactMsgsafeUsersFilter,
  contactClearSearchData: ContactActions.contactClearSearchData,
  enablePlatformUserFilter: DeviceContactActions.enablePlatformUserFilter,
  clearPlatformUserFilter: DeviceContactActions.clearPlatformUserFilter,
  videoCallRequest: WebrtcActions.makeOutboundVideoCallOffer
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ContactSubselect))
