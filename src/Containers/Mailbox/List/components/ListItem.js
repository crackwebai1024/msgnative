/* eslint-disable */
import React, { Component } from 'react'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'
import { timeAgo } from 'commons/Lib/Utils'
import Text from 'app/Components/BaseText'
import { shallowEqual } from 'recompose'

const s = EStyleSheet.create({
  indicatorWrapper: {
    position: 'absolute',
    top: 0,
    width: '1rem',
    bottom: 3,
    left: -7,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.25rem'
  },

  indicator: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: palette.peterRiver
  },

  main: {
    position: 'relative',
    flex: 1,
    alignSelf: 'stretch',
    paddingLeft: '0.75rem',
    marginTop: '0.2rem',
    marginBottom: '0.2rem'
  },

  subject: {
    color: palette.midnightBlue
  },

  header: {
    marginBottom: '0.1rem',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1
  },

  sender: {
    color: palette.wetAsphalt,
    fontSize: '0.75rem',
    flexShrink: 1,
    paddingRight: '0.5rem'
  },

  timeAgo: {
    fontSize: '0.7rem',
    color: palette.concrete
  },

  attchementIcon: {
    color: palette.silver,
    fontSize: '0.8rem'
  }
})

export default class MailboxListItem extends Component {
  _renderIndicator () {
    const { data: { is_read, has_attachment, is_pgp_out, is_pgp_in, is_smime_in, is_smime_out }} = this.props
    const isEncrypted = is_pgp_out || is_pgp_in || is_smime_in || is_smime_out
    return (
      <View style={s.indicatorWrapper}>
        {!is_read && <View style={s.indicator} />}
        {has_attachment && <Icon style={s.attchementIcon} name='paperclip' />}
        {isEncrypted && <Icon style={s.attchementIcon} name='lock' />}
      </View>
    )
  }

  shouldComponentUpdate (nextProps, nextState) {
    
    const updateProps = ['msg_from_displayname', 'msg_to_displayname', 'msg_subject', 'created_on', 'is_read', 'has_attachment', 'actionTypeInProgress']

    if (this.props.data && nextProps.data && updateProps.find(key => !shallowEqual(this.props.data[key], nextProps.data[key]))) {
      return true
    }

    return false
  }

  render () {
    const { data: {msg_from_displayname, msg_to_displayname, msg_subject, created_on} } = this.props

    return (
      <View style={s.main}>
        {this._renderIndicator()}
        <View style={s.header}>
          <View style={s.headerContent}>
            <Text style={s.sender} numberOfLines={1}>{ msg_from_displayname ? msg_from_displayname.trim() : msg_to_displayname && msg_to_displayname.trim()}</Text>
          </View>
          <Text style={s.timeAgo}>{timeAgo(created_on)}</Text>
        </View>
        <Text style={s.subject} numberOfLines={1}>{msg_subject}</Text>
      </View>
    )
  }
}
