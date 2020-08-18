import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { ITEM_UPDATE_TYPES } from 'commons/Lib/Redux/CRUD'
import ContactActions from 'commons/Redux/ContactRedux'

import Spinner from 'app/Components/Spinner'
import { ListItemSwipe as swipeStyle } from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'

class ContactListItemSwipe extends PureComponent {
  static propTypes = {
    dataKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    contactDeleteRequest: PropTypes.func.isRequired,
    onCloseSwipeRequested: PropTypes.func,
    displayNotification: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    intl: PropTypes.object,
    isOnline: PropTypes.bool
  }

  _handleDelete = () => {
    const {
      dataKey,
      contactDeleteRequest,
      displayNotification,
      intl
    } = this.props
    const fm = intl.formatMessage

    const resolve = () => displayNotification(fm(m.native.Contact.contactDeleted), 'danger', 3000)
    contactDeleteRequest({ email: dataKey, delete_mail_history: false }, resolve)
  }

  componentWillUnmount () {
    this.props.onCloseSwipeRequested && this.props.onCloseSwipeRequested()
  }
  render () {
    const { isOnline, data: { actionTypeInProgress } } = this.props
    const fm = this.props.intl.formatMessage
    const disabled = !isOnline || !!actionTypeInProgress
    const isCurrentActionInProgress = actionTypeInProgress === ITEM_UPDATE_TYPES.REMOVE
    return (
      <View style={[swipeStyle.container, { justifyContent: 'flex-end' }]}>
        <TouchableOpacity
          style={[swipeStyle.button, swipeStyle.buttonDanger, disabled && swipeStyle.actionDisabledIcon]}
          onPress={this._handleDelete}
          disabled={disabled}
        >
          {!isCurrentActionInProgress && <Icon style={swipeStyle.icon} name='trash' />}
          {!isCurrentActionInProgress && <Text style={swipeStyle.text}>{fm(m.app.Common.delete)}</Text>}
          {isCurrentActionInProgress && <Spinner containerStyle={swipeStyle.spinnerAnimatedContainer} iconStyle={swipeStyle.spinnerIcon} />}
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  contactDeleteRequest: ContactActions.contactRemove,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ContactListItemSwipe))
