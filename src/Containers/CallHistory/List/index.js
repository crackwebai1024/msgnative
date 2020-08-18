import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Entypo'
import { injectIntl } from 'react-intl'
import * as R from 'ramda'
import { withStateHandlers, compose, setStatic } from 'recompose'
import m from 'commons/I18n'

import { withWSState } from 'commons/Lib/NetworkStateProvider'
import CallHistoryActions from 'commons/Redux/CallHistoryRedux'
import ListViewContainer from 'app/Components/ListView'
// import NavButtonsWithSearch from 'app/Components/ListView/NavButtonsWithSearch'
import baseStyles from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'
import ContactListItem from 'app/Components/ContactListItem'
import HeaderTitleWithFilterAndSync from 'app/Components/HeaderTitleWithFilterAndSync/HeaderTitleWithFilterAndSync'
import SyncProgress from 'app/Components/SyncProgress'

import CallListItem from './components/ListItem'
import ListItemSwipe from './components/ListItemSwipe'
import NoDataMessage from './components/NoDataMessage'
import ContactSubselect, { FORM_IDENTIFIER } from './components/ContactSubselect'

import layoutStyles from 'app/Styles/layout'
import styles from './styles'
import BatchUpdateProgress from 'app/Containers/Mailbox/List/components/BatchUpdateProgress'

class CallHistoryList extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    toggleSearchBar: PropTypes.func.isRequired,
    deleteCallHistory: PropTypes.func.isRequired,
    fetchCallHistory: PropTypes.func.isRequired,
    searchBarVisible: PropTypes.bool.isRequired,
    selectedUpdateInProgress: PropTypes.bool.isRequired,
    deleteMode: PropTypes.bool.isRequired,
    oldSyncInProgress: PropTypes.bool.isRequired,
    dataFetchInProgress: PropTypes.bool.isRequired,
    intl: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._goToDetailView = this._goToDetailView.bind(this)
  }

  _keyExtractor = data => data.call_id

  _goToDetailView (data) {
    if (this.props.deleteMode || !data || data.actionTypeInProgress) return
    this.props.navigation.navigate('CallHistoryDetail', { callId: data.call_id })
  }

  _updateDisableActions (props = this.props) {
    const disableActions = R.path(['navigation', 'state', 'params', 'disableActions'], props)
    const isDataEmpty = R.isNil(props.data) || R.isEmpty(props.data)
    let shouldToggleDisableActions = false
    if ((isDataEmpty && !disableActions) || (!isDataEmpty && disableActions)) {
      shouldToggleDisableActions = true
    }
    if (shouldToggleDisableActions) {
      props.navigation.setParams({ disableActions: !disableActions })
    }
  }

  _updateSyncInProgress (nextProps) {
    const props = nextProps || this.props
    const { navigation, oldSyncInProgress, searchQuery } = props
    const shouldShowSyncIcon = oldSyncInProgress && !searchQuery
    const navOldSyncInProgress = R.path(['state', 'params', 'oldSyncInProgress'], this.props.navigation)
    if (!R.equals(navOldSyncInProgress, shouldShowSyncIcon)) {
      navigation.setParams({ oldSyncInProgress: shouldShowSyncIcon })
    }

    if (!shouldShowSyncIcon && props.showSyncStats) {
      this.props.toggleSyncStats()
    }
  }

  _onTabClick (missedTab) {
    if (missedTab) {
      this.props.callHistorySetIsMissedFilter()
      this.props.navigation.setParams({ missed: true })
    } else {
      this.props.callHistoryClearIsMissedFilter()
      this.props.clearSearchResultsData()
      this.props.navigation.setParams({ missed: false })
    }
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
    if (!R.equals(this.props.dataFetchInProgress, nextProps.dataFetchInProgress)) {
      this._updateDisableActions(nextProps)
    }
  }

  _renderTabs () {
    const fm = this.props.intl.formatMessage
    const showMissedCallsOnly = this._showMissedCallsOnly()

    return (
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, !showMissedCallsOnly && styles.tabActive]} onPress={() => this._onTabClick(false)}>
          <Text style={styles.tabText}>{fm(m.native.CallHistory.allTab).toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, showMissedCallsOnly && styles.tabActive]} onPress={() => this._onTabClick(true)}>
          <Text style={styles.tabText}>{fm(m.native.CallHistory.missedTab).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _showMissedCallsOnly (props = this.props) {
    return !!R.path(['navigation', 'state', 'params', 'missed'], props)
  }

  render () {
    const { showSyncStats, dataTotalCount } = this.props
    const fm = this.props.intl.formatMessage
    const listItemProps = {
      deleteMode: this.props.deleteMode,
      swipeRightOpenValue: -70,
      deleteCallHistory: this.props.deleteCallHistory
    }
    return (
      <View style={layoutStyles.flex}>
        {showSyncStats &&
          <SyncProgress table='call_history_cache' total={dataTotalCount} />
        }
        {this._renderTabs()}
        <ListViewContainer
          listItemComponent={CallListItem}
          navigatorActiveKey='callHistory'
          selectItem={this._goToDetailView}
          fetchData={this.props.fetchCallHistory}
          noDataMessage={<NoDataMessage />}
          noSearchBar={!this.props.searchBarVisible}
          noSearchResultMessage={this.props.searchBarVisible ? fm(m.native.CallHistory.noMissedCalls) : <NoDataMessage onlyMissed />}
          listItemSwipeComponent={ListItemSwipe}
          swipePosition='right'
          swipeLeftOpenValue={0}
          swipeRightOpenValue={listItemProps.swipeRightOpenValue}
          keyExtractor={this._keyExtractor}
          keyExtractorPatch={this._keyExtractor}
          listItemProps={listItemProps}
          {...this.props}
          dataFetchInProgress={!this.props.selectedUpdateInProgress && this.props.dataFetchInProgress}
          isRefreshing={!this.props.selectedUpdateInProgress && this.props.isRefreshing}
        />
        {this.props.selectedUpdateInProgress && <BatchUpdateProgress />}
      </View>
    )
  }
}

const NavAddButton = withWSState(({ navigation, fm, wsOnline }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('ContactSelection', {
      subselectComponent: ContactSubselect,
      reduxFormIdentifier: FORM_IDENTIFIER,
      title: fm(m.native.Chat.selectContact),
      listItemComponent: ContactListItem,
      disableSwipe: true,
      tabBarVisible: false,
      createScreenIdentifier: 'CreateCall',
      forceSection: true,
      headerLeftProps: { isBack: true }
    })}
    disabled={!wsOnline}
  >
    <Icon
      name='plus'
      style={[baseStyles.navBarMenuIcon, baseStyles.navBarRightIcon, !wsOnline && baseStyles.navBarMenuIconDisabled]}
    />
  </TouchableOpacity>
))

const NavEditButton = withWSState(({ fm, deleteMode, toggleDeleteMode, disabled, wsOnline }) => (
  <TouchableOpacity onPress={toggleDeleteMode} disabled={disabled || !wsOnline}>
    <Text style={[baseStyles.navBarActionText, baseStyles.navBarLeftIcon, !wsOnline && baseStyles.navBarMenuIconDisabled]}>
      {deleteMode ? fm(m.native.CallHistory.navDone) : fm(m.native.CallHistory.navEdit)}
    </Text>
  </TouchableOpacity>
))

const navigationOptions = ({ navigation, screenProps: { fm } }) => {
  // const onSearchPress = R.path(['state', 'params', 'onSearchPress'], navigation)
  const deleteMode = !!R.path(['state', 'params', 'deleteMode'], navigation)
  const disableActions = !!R.path(['state', 'params', 'disableActions'], navigation)
  const toggleSyncStats = R.path(['state', 'params', 'toggleSyncStats'], navigation)
  const oldSyncInProgress = R.path(['state', 'params', 'oldSyncInProgress'], navigation)

  const toggleDeleteMode = () => navigation.setParams({
    deleteMode: !R.path(['state', 'params', 'deleteMode'], navigation)
  })

  const options = {
    headerRight: (
      <NavAddButton navigation={navigation} fm={fm} />
    ),
    headerLeft: (
      <NavEditButton fm={fm} deleteMode={deleteMode} toggleDeleteMode={toggleDeleteMode} disabled={disableActions} />
    )
  }

  options.headerTitle = (
    <HeaderTitleWithFilterAndSync
      title={fm(m.native.CallHistory.title)}
      onSyncIconPress={oldSyncInProgress ? toggleSyncStats : null} />
  )

  return options
}

const mapStateToProps = (state, ownProps) => {
  const deleteMode = !!R.path(['navigation', 'state', 'params', 'deleteMode'], ownProps)
  const callHistoryState = state.callHistory
  return {
    deleteMode: deleteMode,
    data: callHistoryState.data,
    dataOrder: callHistoryState.dataOrder,
    dataTotalCount: callHistoryState.dataTotalCount,

    searchQuery: callHistoryState.searchQuery,
    searchResultsData: callHistoryState.searchResultsData,
    searchResultsDataOrder: callHistoryState.searchResultsDataOrder,
    searchResultsDataTotalCount: callHistoryState.searchResultsDataTotalCount,

    dataFetchInProgress: callHistoryState.dataRequestInProgress,
    dataFetchSuccessful: callHistoryState.dataRequestSuccessful,
    dataFetchError: callHistoryState.dataRequestError,

    oldSyncInProgress: callHistoryState.oldSyncInProgress,
    isRefreshing: callHistoryState.isRefreshing,
    isPaginating: callHistoryState.isPaginating,
    isSearching: callHistoryState.isSearching,
    selectedUpdateInProgress: callHistoryState.selectedUpdateInProgress
  }
}

const mapDispatchToProps = {
  fetchCallHistory: CallHistoryActions.callHistoryFetch,
  clearSearchResultsData: CallHistoryActions.callHistoryClearSearchData,
  setSearchQuery: CallHistoryActions.callHistorySetSearchQuery,
  deleteCallHistory: CallHistoryActions.callHistoryDeleteRequest,
  callHistorySetIsMissedFilter: CallHistoryActions.callHistorySetIsMissedFilter,
  callHistoryClearIsMissedFilter: CallHistoryActions.callHistoryClearIsMissedFilter
}

const enhance = compose(
  setStatic('navigationOptions', navigationOptions),
  connect(mapStateToProps, mapDispatchToProps),
  withStateHandlers(
    {
      searchBarVisible: false,
      showSyncStats: false
    },
    {
      toggleSearchBar: ({ searchBarVisible }) => () => ({ searchBarVisible: !searchBarVisible }),
      toggleSyncStats: ({ showSyncStats }) => () => ({ showSyncStats: !showSyncStats })
    }
  ),
  injectIntl
)

export default enhance(CallHistoryList)
