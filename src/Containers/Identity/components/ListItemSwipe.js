import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'
import { ITEM_UPDATE_TYPES } from 'commons/Lib/Redux/CRUD'

import { ListItemSwipe as swipeStyle } from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'
import Spinner from 'app/Components/Spinner'

class IdentityListItemSwipe extends Component {
  static propTypes = {
    dataKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    identityDeleteRequest: PropTypes.func.isRequired,
    onCloseSwipeRequested: PropTypes.func,
    displayNotification: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    intl: PropTypes.object,
    isOnline: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this._handleDelete = this._handleDelete.bind(this)
  }

  _handleDelete () {
    const {
      dataKey,
      identityDeleteRequest,
      displayNotification,
      onCloseSwipeRequested,
      intl
    } = this.props
    const fm = intl.formatMessage

    const resolve = () => {
      onCloseSwipeRequested && onCloseSwipeRequested()
      displayNotification(fm(m.native.Contact.identityDeleted), 'danger', 3000)
    }

    const reject = (err) => {
      displayNotification(fm(m.native.Contact.identityIsNotDeleted), err ? 'danger' : 'info', 3000)
    }

    Alert.alert(
      fm(m.native.Contact.deleteIdentityName, { name: '' }), // TODO: It should render display_name
      fm(m.native.Contact.deleteAllEmailsAssociated),
      [
        {
          text: fm(m.native.Contact.deleteAllEmails),
          onPress: () => {
            identityDeleteRequest({ id: dataKey, delete_mail_history: true }, resolve, reject)
          }
        }, {
          text: fm(m.native.Contact.saveAllEmails),
          onPress: () => {
            identityDeleteRequest({ id: dataKey, delete_mail_history: false }, resolve, reject)
          }
        }, {
          text: fm(m.app.Common.cancel),
          onPress: reject
        }
      ]
    )
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
  identityDeleteRequest: IdentityActions.identityRemove,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(IdentityListItemSwipe))
