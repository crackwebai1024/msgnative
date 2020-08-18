import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { equals, path } from 'ramda'
import { withStateHandlers, compose, setStatic } from 'recompose'

import m from 'commons/I18n'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'

import Text from 'app/Components/BaseText'
import baseStyles from 'app/Components/ListView/styles'
import ListViewContainer from 'app/Components/ListView'
import NavButtonsWithSearch from 'app/Components/ListView/NavButtonsWithSearch'
import ListViewError from 'app/Components/ListView/components/ListViewError'
import HeaderButton from 'app/Components/HeaderButton'
import HeaderTitleWithFilterAndSync from 'app/Components/HeaderTitleWithFilterAndSync/HeaderTitleWithFilterAndSync'
import SyncProgress from 'app/Components/SyncProgress'

import ForwardAddressListItem from './components/ListItem'
import ListItemSwipe from './components/ListItemSwipe'

class ForwardAddressList extends Component {
  _goToDetailView = data => {
    if (data.actionTypeInProgress) return
    this.props.navigation.navigate('ForwardAddressDetail', { id: data.id })
  }

  _goToCreateView = () =>
    this.props.navigation.navigate('CreateForwardAddress')

  _renderNoItemError () {
    const fm = this.props.intl.formatMessage
    return (
      <ListViewError>
        <Text style={baseStyles.noneTitleText}>{fm(m.native.ForwardAddress.noForwardAddresses)}</Text>
        <Text style={baseStyles.noneBodyText}>{fm(m.native.ForwardAddress.linkingMsgSafeToYourEmail)}</Text>
        <Text style={baseStyles.noneBodyText}>{fm(m.native.ForwardAddress.helpYouRecoverYourAccount)}</Text>
        <TouchableOpacity style={baseStyles.errorAction} onPress={this._goToCreateView}>
          <Text style={[baseStyles.noneBodyText, baseStyles.noneBodyActionText]}>
            {fm(m.native.ForwardAddress.clickHereToLinkEmailAddress)}
          </Text>
        </TouchableOpacity>
      </ListViewError>
    )
  }

  _handleOnUnmount () {
    const { navigation } = this.props
    if (
      !navigation.state.params ||
      !navigation.state.params.onUnmount ||
      typeof navigation.state.params.onUnmount !== 'function'
    ) {
      return
    }
    navigation.state.params.onUnmount()
  }

  _updateSyncInProgress (nextProps) {
    const props = nextProps || this.props
    const { navigation, oldSyncInProgress, searchQuery } = props
    const shouldShowSyncIcon = oldSyncInProgress && !searchQuery
    const navOldSyncInProgress = path(['state', 'params', 'oldSyncInProgress'], this.props.navigation)
    if (!equals(navOldSyncInProgress, shouldShowSyncIcon)) {
      navigation.setParams({ oldSyncInProgress: shouldShowSyncIcon })
    }

    if (!shouldShowSyncIcon && props.showSyncStats) {
      this.props.toggleSyncStats()
    }
  }

  componentWillMount () {
    const { fetchData, data } = this.props
    if (!data && fetchData) {
      fetchData()
    }
  }

  componentWillUnmount () {
    this._handleOnUnmount()
  }

  componentDidMount () {
    this.props.navigation.setParams({
      onSearchPress: this.props.toggleSearchBar.bind(this),
      toggleSyncStats: this.props.toggleSyncStats.bind(this),
      oldSyncInProgress: this.props.oldSyncInProgress
    })
  }

  componentWillReceiveProps (nextProps) {
    this._updateSyncInProgress(nextProps)
  }

  render () {
    const { intl, searchBarVisible, showSyncStats, totalESPs } = this.props
    const fm = intl.formatMessage
    let noSearchResultMessage = fm(m.native.ForwardAddress.noForwardAddresses)

    return (
      <View style={{ flex: 1 }}>
        {showSyncStats &&
          <SyncProgress table='user_emails_cache' total={totalESPs} />
        }
        <ListViewContainer
          listItemComponent={ForwardAddressListItem}
          listItemSwipeComponent={ListItemSwipe}
          swipePosition='right'
          swipeLeftOpenValue={0}
          swipeRightOpenValue={-70}
          navigatorActiveKey='contacts'
          selectItem={this._goToDetailView}
          fetchData={this.props.fetchData}
          initialSearchQuery={this.props.searchQuery}
          noDataMessage={this._renderNoItemError()}
          noSearchResultMessage={noSearchResultMessage}
          noTabBar
          noSearchBar={!searchBarVisible}
          {...this.props}
        />
      </View>
    )
  }
}

const mapStateToProps = state => ({
  data: state.useremail.data,
  dataOrder: state.useremail.dataOrder,
  dataTotalCount: state.useremail.dataTotalCount,

  searchQuery: state.useremail.searchQuery,
  searchResultsData: state.useremail.searchResultsData,
  searchResultsDataOrder: state.useremail.searchResultsDataOrder,
  searchResultsDataTotalCount: state.useremail.searchResultsDataTotalCount,

  dataFetchInProgress: state.useremail.dataRequestInProgress,
  dataFetchSuccessful: state.useremail.dataRequestSuccessful,
  dataFetchError: state.useremail.dataRequestError,

  oldSyncInProgress: state.useremail.oldSyncInProgress,
  isRefreshing: state.useremail.isRefreshing,
  isPaginating: state.useremail.isPaginating,
  isSearching: state.useremail.isSearching,

  totalESPs: path(['user', 'data', 'sum_esp'], state) || 0
})

const mapDispatchToProps = {
  fetchData: UserEmailActions.useremailFetch,
  clearSearchResultsData: UserEmailActions.useremailClearSearchData,
  setSearchQuery: UserEmailActions.useremailSetSearchQuery
}

const NavAddButton = withNetworkState(({ navigation, networkOnline }) => (
  <TouchableOpacity onPress={() => navigation.navigate('CreateForwardAddress')} disabled={!networkOnline}>
    <EntypoIcon name='plus' style={[baseStyles.navBarMenuIcon, baseStyles.navBarRightIcon, !networkOnline && baseStyles.navBarMenuIconDisabled]} />
  </TouchableOpacity>
))

const navigationOptions = ({ navigation, screenProps: { fm } }) => {
  const { state } = navigation
  const onSearchPress = path(['params', 'onSearchPress'], state)
  const toggleSyncStats = path(['state', 'params', 'toggleSyncStats'], navigation)
  const oldSyncInProgress = path(['state', 'params', 'oldSyncInProgress'], navigation)
  const options = {
    tabBarVisible: false,
    headerLeft: <HeaderButton isBack onPress={() => navigation.goBack(null)} />,
    headerRight: <NavButtonsWithSearch onSearchPress={onSearchPress}>
      <NavAddButton navigation={navigation} />
    </NavButtonsWithSearch>
  }

  options.headerTitle = (
    <HeaderTitleWithFilterAndSync
      title={fm(m.native.ForwardAddress.listTitle)}
      onSyncIconPress={oldSyncInProgress ? toggleSyncStats : null} />
  )

  return options
}

const enhance = compose(
  setStatic('navigationOptions', navigationOptions),
  connect(mapStateToProps, mapDispatchToProps),
  withStateHandlers(
    { searchBarVisible: false, showSyncStats: false },
    {
      toggleSearchBar: ({ searchBarVisible }) => () => ({ searchBarVisible: !searchBarVisible }),
      toggleSyncStats: ({ showSyncStats }) => () => ({ showSyncStats: !showSyncStats })
    }
  ),
  injectIntl
)

export default enhance(ForwardAddressList)
