import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import { ITEM_UPDATE_TYPES } from 'commons/Lib/Redux/CRUD'

import { ListItemSwipe as swipeStyle } from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'
import Spinner from 'app/Components/Spinner'

class UserEmailListItemSwipe extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    emailDeleteRequest: PropTypes.func.isRequired,
    displayNotification: PropTypes.func.isRequired,
    onCloseSwipeRequested: PropTypes.func,
    intl: PropTypes.object,
    isOnline: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this._handleDelete = this._handleDelete.bind(this)
  }

  _handleDelete () {
    const {
      data,
      emailDeleteRequest,
      displayNotification,
      intl
    } = this.props
    const resolve = () => displayNotification(intl.formatMessage(m.native.ForwardAddress.emailAddressDeleted), 'danger', 3000)
    const reject = () => displayNotification(intl.formatMessage(m.native.ForwardAddress.emailAddressNotDeleted), 'danger', 3000)
    emailDeleteRequest({ id: data.id }, resolve, reject)
  }

  componentWillUnmount () {
    this.props.onCloseSwipeRequested && this.props.onCloseSwipeRequested()
  }

  render () {
    const { isOnline, data: { actionTypeInProgress } } = this.props
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
          {!isCurrentActionInProgress && <Text style={swipeStyle.text}>{this.props.intl.formatMessage(m.app.Common.delete)}</Text>}
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
  emailDeleteRequest: UserEmailActions.useremailRemove,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserEmailListItemSwipe))
