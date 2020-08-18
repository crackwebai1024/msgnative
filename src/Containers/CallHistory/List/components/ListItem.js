import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import m from 'commons/I18n'
import { getContactByEmail } from 'commons/Selectors/Contact'

import Avatar from 'app/Components/Avatar'
import Text from 'app/Components/BaseText'
import { ListItemStyle as s } from './style'
import commonStyles from 'app/Styles/common'
import { getRelativeCallDate, getCallType } from 'app/Containers/CallHistory/_Utils'

class CallListItem extends PureComponent {
  static propTypes = {
    timezone: PropTypes.string,
    contactDetails: PropTypes.object,
    deleteMode: PropTypes.bool.isRequired,
    onOpenSwipeRequested: PropTypes.func.isRequired,
    data: PropTypes.shape({
      call_id: PropTypes.string.isRequired,
      contact_user_email: PropTypes.string.isRequired,
      is_audio_only: PropTypes.bool
    }).isRequired,
    swipeRightOpenValue: PropTypes.number.isRequired,
    intl: PropTypes.object
  }

  _renderTimestamp () {
    const { data, intl } = this.props
    return (
      <View style={s.timestamp}>
        <Text>
          {getRelativeCallDate(data.call_id, this.props.timezone, true, intl.formatMessage(m.app.Chat.yesterday), intl.formatMessage(m.app.Chat.today))}
        </Text>
      </View>
    )
  }

  _renderCallType () {
    const { data } = this.props
    const fm = this.props.intl.formatMessage
    let displayProps = getCallType(data)

    return (
      <View style={s.callTypeContainer}>
        {!data.is_audio_only &&
          <Icon style={[s.callTypeIcon, displayProps.iconStyle, s.videoTypeIcon]} name='videocam' />
        }
        <Icon style={[s.callTypeIcon, displayProps.iconStyle]} name={displayProps.icon} />
        <Text style={[s.callTypeText, displayProps.textStyle]}>{fm(m.native.CallHistory[displayProps.callTypeTranslationKey])}</Text>
      </View>
    )
  }

  _renderDeleteButton () {
    return (
      <TouchableOpacity onPress={() => this.props.onOpenSwipeRequested(this.props.swipeRightOpenValue)}>
        <View style={s.deleteIconWrapper}>
          <Icon style={s.deleteIcon} name='remove-circle' />
        </View>
      </TouchableOpacity>
    )
  }

  render () {
    const { data, deleteMode, contactDetails } = this.props

    const liteData = {
      title: contactDetails.display_name || data.contact_user_email,
      email: data.contact_user_email,
      isMissedCall: true
    }

    return (
      <View style={[s.container, commonStyles.horizontalAlign]}>
        {deleteMode && this._renderDeleteButton()}
        <View style={s.avatarOuter}>
          <Avatar
            textStyle={s.avatarText}
            name={liteData.title}
            email={liteData.email}
          />
        </View>
        <View style={s.body}>
          <Text style={s.title} numberOfLines={1}>{liteData.title}</Text>
          {this._renderCallType()}
        </View>
        {this._renderTimestamp()}
      </View>
    )
  }
}

// ContactListItemLite

const mapStateToProps = (state, ownProps) => {
  return {
    timezone: state.user.data.timezone || null,
    contactDetails: getContactByEmail(ownProps.data.contact_user_email)(state) || {}
  }
}

const IntlCallListItem = injectIntl(CallListItem)

const ConnectedCallListItem = connect(mapStateToProps)(IntlCallListItem)

export default ConnectedCallListItem
