import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import { change } from 'redux-form'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import ListViewError from 'app/Components/ListView/components/ListViewError'
import baseStyles from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'
import ContactSubselect, { FORM_IDENTIFIER } from './ContactSubselect'
import ContactListItem from 'app/Components/ContactListItem'

class NoDataMessage extends Component {
  constructor (props) {
    super(props)
    this._createNewChat = this._createNewChat.bind(this)
    this._handleTellAFriend = this._handleTellAFriend.bind(this)
  }

  _createNewChat () {
    const { navigation, intl } = this.props
    navigation.navigate('ContactSelection', {
      subselectComponent: ContactSubselect,
      reduxFormIdentifier: FORM_IDENTIFIER,
      title: intl.formatMessage(m.native.Chat.selectContact),
      listItemComponent: ContactListItem,
      disableSwipe: true,
      tabBarVisible: false,
      createScreenIdentifier: 'MessagingCreateRoom',
      headerLeftProps: { isBack: true }
    })
  }

  _handleTellAFriend () {
    const { navigation, change, intl } = this.props
    const fm = intl.formatMessage
    const body = fm(m.native.Chat.tellAFriendBody, { displayName: this.props.displayName })
    navigation.navigate('MailboxCompose')
    setTimeout(() => {
      change('mailboxCompose', 'msg_body', body)
      change('mailboxCompose', 'msg_subject', fm(m.native.Chat.getOnIOSAndAndroid))
    }, 1000)
  }

  render () {
    const fm = this.props.intl.formatMessage
    const textStyle = [
      baseStyles.errorText,
      baseStyles.errorActionText,
      { marginBottom: 15 }
    ]
    const textLinkStyle = [
      textStyle,
      {
        textDecorationLine: 'underline'
      }
    ]
    return (
      <ListViewError>
        <Text style={textStyle}>{fm(m.native.Chat.youHaveNoConversation)}</Text>
        <Text style={textStyle}>{fm(m.native.Chat.startEncryptedChat)}</Text>
        <Text style={textStyle}>{fm(m.native.Chat.chatWithContacts)}</Text>
        <TouchableOpacity onPress={this._handleTellAFriend}>
          <Text style={[textLinkStyle]}>{fm(m.native.Chat.tellAFriend)}</Text>
        </TouchableOpacity>
      </ListViewError>
    )
  }
}

const IntlNoDataMessage = injectIntl(NoDataMessage)

const mapStateToProps = (state) => {
  const props = {
    displayName: ''
  }

  if (state.user.data.display_name) {
    props.displayName = state.user.data.display_name
  }
  return props
}

const mapDispatchToProps = {
  change
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlNoDataMessage)
