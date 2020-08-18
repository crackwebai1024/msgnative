import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import { getContactMember } from 'commons/Selectors/Messaging'

import ChatActions from 'commons/Redux/ChatRedux'
import ListViewContainer from 'app/Components/ListView'

import ChatListItem from './components/ListItem'
import ListItemSwipe from './components/ListItemSwipe'
import NoDataMessage from './components/NoDataMessage'
import HeaderTitle from './components/HeaderTitle'
import HeaderRight from './components/HeaderRight'

class ChatRoomList extends Component {
  constructor (props) {
    super(props)

    this.noDataMessage = <NoDataMessage navigation={props.navigation} />

    this._goToChatView = this._goToChatView.bind(this)
  }

  _keyExtractor = data => data.room_id

  _goToChatView (data) {
    if (data.isLeavingRoom) return
    const contactMember = getContactMember(data)

    if (!contactMember.email) {
      return console.error(`No contact member for room: ${data.room_id}`)
    }

    // For temporarily, its using roomId instead of roomsMapKey
    // this.props.navigation.navigate('MessagingRoom', { roomsMapKey: getMapKeyForRoom(data) })
    this.props.navigation.navigate('MessagingRoom', { roomId: data.room_id })
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <ListViewContainer
        listItemComponent={ChatListItem}
        navigatorActiveKey='chat'
        selectItem={this._goToChatView}
        fetchData={this.props.chatFetch}
        noDataMessage={this.noDataMessage}
        noSearchResultMessage={fm(m.native.Chat.noChatsFound)}
        listItemSwipeComponent={ListItemSwipe}
        swipePosition='right'
        swipeLeftOpenValue={0}
        swipeRightOpenValue={-70}
        keyExtractor={this._keyExtractor}
        keyExtractorPatch={this._keyExtractor}
        {...this.props}
        dataFetchInProgress={
          this.props.dataFetchInProgress
        }
      />
    )
  }
}

const IntlChatRoomList = injectIntl(ChatRoomList)
IntlChatRoomList.navigationOptions = ({ navigation, screenProps: { fm } }) => ({
  headerTitle: <HeaderTitle title={fm(m.native.Chat.secureChat)} />,
  headerRight: <HeaderRight navigation={navigation} fm={fm} />
})

const mapStateToProps = state => ({
  data: state.chat.data,
  dataOrder: state.chat.dataOrder,
  dataTotalCount: state.chat.dataTotalCount,

  dataFetchInProgress: state.chat.dataRequestInProgress,
  dataFetchSuccessful: state.chat.dataRequestSuccessful,
  dataFetchError: state.chat.dataRequestError || '',

  isRefreshing: state.chat.isRefreshing,
  isPaginating: state.chat.isPaginating,
  isSearching: state.chat.isSearching
})

const mapDispatchToProps = {
  chatFetch: ChatActions.chatFetch
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlChatRoomList)
