import React, { Component } from 'react'
import { View, TouchableOpacity, Button } from 'react-native'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import PropTypes from 'prop-types'
import { path, equals } from 'ramda'
import { withStateHandlers, compose, setStatic } from 'recompose'

import m from 'commons/I18n'
import MailboxActions from 'commons/Redux/MailboxRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'

import ListViewContainer from 'app/Components/ListView'
import baseStyles from 'app/Components/ListView/styles'
import NavButtonsWithSearch from 'app/Components/ListView/NavButtonsWithSearch'
import Drawer from 'app/Components/Drawer'
import DrawerContent from 'app/Containers/Mailbox/Drawer'

import NoItem from './components/NoItem'
import MailboxListItem from './components/ListItem'
import ListItemSwipe from './components/ListItemSwipe'
import BatchActionsTools from './components/BatchActionsTools'
import BatchUpdateProgress from './components/BatchUpdateProgress'
import HeaderTitleWithFilterAndSync from 'app/Components/HeaderTitleWithFilterAndSync/HeaderTitleWithFilterAndSync'
import SyncProgress from 'app/Components/SyncProgress'

const MailboxComposeNavButton = withNetworkState(({ navigation, networkOnline }) => (
  <TouchableOpacity onPress={() => navigation.navigate('MailboxCompose')} style={{ marginLeft: 10 }} disabled={!networkOnline}>
    <EntypoIcon name='new-message' style={[baseStyles.navBarAddIcon, baseStyles.navBarRightIcon, !networkOnline ? baseStyles.navBarMenuIconDisabled : null]} />
  </TouchableOpacity>
))

const getNavigationOptions = ({ navigation, fm }) => {
  const onSearchPress = path(['state', 'params', 'onSearchPress'], navigation)
  const toggleSyncStats = path(['state', 'params', 'toggleSyncStats'], navigation)
  const onHamburgerPress = path(['state', 'params', 'onHamburgerPress'], navigation)
  const filterApplied = path(['state', 'params', 'filterApplied'], navigation)
  const oldSyncInProgress = path(['state', 'params', 'oldSyncInProgress'], navigation) && !filterApplied
  let title = fm(m.native.Mailbox.inbox)

  const options = {
    tabBarVisible: true,
    headerLeft: (
      <TouchableOpacity onPress={onHamburgerPress}>
        <EntypoIcon name='menu' style={[baseStyles.navBarMenuIcon, baseStyles.navBarLeftIcon]} />
      </TouchableOpacity>
    ),
    headerRight: (
      <NavButtonsWithSearch onSearchPress={onSearchPress}>
        <MailboxComposeNavButton navigation={navigation} />
      </NavButtonsWithSearch>
    )
  }

  if (navigation.state.params && navigation.state.params.title) {
    title = fm(m.native.Mailbox[navigation.state.params.title])
  }

  options.headerTitle = (
    <HeaderTitleWithFilterAndSync
      title={title}
      onPress={filterApplied ? onHamburgerPress : null}
      onSyncIconPress={oldSyncInProgress ? toggleSyncStats : null}
      filterApplied={filterApplied} />
  )

  return options
}

const ConnectedBatchActionsTools = withNetworkState(({ navigation, networkOnline }) => (
  <BatchActionsTools navigation={navigation} disabled={!networkOnline} />
))

const getSelectionModeNavigationOptions = ({ navigation, fm }) => {
  const bulkActionInProgress = path(['state', 'params', 'bulkActionInProgress'], navigation)
  return {
    headerRight: <ConnectedBatchActionsTools navigation={navigation} />,
    headerLeft: (
      <Button
        onPress={() => navigation.dispatch(MailboxActions.mailboxClearSelection())}
        title={fm(m.app.Common.cancel)}
        disabled={bulkActionInProgress}
      />
    ),
    headerTitleStyle: {
      fontFamily: 'sans-serif'
    }
  }
}

class Mailbox extends Component {
  static propTypes = {
    withFilter: PropTypes.string,
    isDrawerOpen: PropTypes.bool,
    navigation: PropTypes.object,
    filterName: PropTypes.string,
    selectEmail: PropTypes.func,
    selectedIds: PropTypes.array,
    unselectEmail: PropTypes.func,
    toggleSearchBar: PropTypes.func,
    toggleSyncStats: PropTypes.func,
    toggleDrawer: PropTypes.func,
    fetchMailbox: PropTypes.func,
    selectedUpdateInProgress: PropTypes.bool,
    dataFetchInProgress: PropTypes.bool,
    isRefreshing: PropTypes.bool,
    searchBarVisible: PropTypes.bool,
    intl: PropTypes.object
  }

  static contextTypes = {
    drawer: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._goToDetailView = this._goToDetailView.bind(this)
    this._updateHeaderTitle = this._updateHeaderTitle.bind(this)
    this._updateHeaderMode = this._updateHeaderMode.bind(this)
    this._handleItemLongPress = this._handleItemLongPress.bind(this)
    this._handleItemSelectToggle = this._handleItemSelectToggle.bind(this)
  }

  _goToDetailView (data) {
    if (data.actionTypeInProgress) return
    this.props.navigation.navigate('MailboxDetail', { id: data.id })
  }

  _updateHeaderTitle (nextProps) {
    const props = nextProps || this.props
    const { navigation, filterName } = props
    let title = null

    if (filterName) {
      title = filterName.split('')
      // title[0] = title[0].toUpperCase()
      title = title.join('')
    }

    if (nextProps.filterName !== this.props.filterName) {
      navigation.setParams({ title })
    }
  }

  _updateHeaderMode (nextProps) {
    const props = nextProps || this.props
    const { navigation, selectedIds } = props

    let selectionMode = false
    if (selectedIds && selectedIds.length) {
      selectionMode = true
    }

    if (
      navigation.state.params && (navigation.state.params.selectionMode !== undefined && navigation.state.params.selectionMode !== selectionMode)
    ) {
      navigation.setParams({ selectionMode: selectionMode })
    }
  }

  _updateBulkActionInProgress (nextProps) {
    const props = nextProps || this.props
    const { navigation, selectedUpdateInProgress } = props
    if (
      navigation.state.params && (navigation.state.params.bulkActionInProgress !== selectedUpdateInProgress)
    ) {
      navigation.setParams({ bulkActionInProgress: selectedUpdateInProgress })
    }
  }

  _updateFilterApplied (nextProps) {
    const props = nextProps || this.props
    const { navigation, filterIdentityIds } = props
    if (!equals(this.props.filterIdentityIds, filterIdentityIds)) {
      navigation.setParams({ filterApplied: filterIdentityIds.length > 0 })
    }
  }

  _updateSyncInProgress (nextProps) {
    const props = nextProps || this.props
    const { navigation, oldSyncInProgress, searchQuery, filterIdentityIds } = props
    const shouldShowSyncIcon = oldSyncInProgress && !searchQuery && !filterIdentityIds.length
    const navOldSyncInProgress = path(['state', 'params', 'oldSyncInProgress'], this.props.navigation)
    if (!equals(navOldSyncInProgress, shouldShowSyncIcon)) {
      navigation.setParams({ oldSyncInProgress: shouldShowSyncIcon })
    }

    if (!shouldShowSyncIcon && props.showSyncStats) {
      this.props.toggleSyncStats()
    }
  }

  _handleItemLongPress (data) {
    const { selectEmail } = this.props
    selectEmail(data.id)
  }

  _handleItemSelectToggle (data) {
    const {
      selectedIds,
      selectEmail,
      unselectEmail
    } = this.props
    if (selectedIds.indexOf(data.id) === -1) {
      selectEmail(data.id)
    } else {
      unselectEmail(data.id)
    }
  }

  componentWillReceiveProps (nextProps) {
    this._updateHeaderTitle(nextProps)
    this._updateHeaderMode(nextProps)
    this._updateBulkActionInProgress(nextProps)
    this._updateFilterApplied(nextProps)
    this._updateSyncInProgress(nextProps)

    if (this.props.searchQuery && nextProps.searchQuery === null) {
      this.props.toggleSearchBar()
    }
  }

  componentDidMount () {
    const { selectedIds } = this.props
    let selectionMode = false
    if (selectedIds && selectedIds.length) {
      selectionMode = true
    }

    this.props.navigation.setParams({
      onSearchPress: this.props.toggleSearchBar.bind(this),
      onHamburgerPress: this.props.toggleDrawer.bind(this),
      toggleSyncStats: this.props.toggleSyncStats.bind(this),
      oldSyncInProgress: this.props.oldSyncInProgress,
      selectionMode: selectionMode
    })
  }

  _getTotalCount () {
    const { drawerTotals } = this.props
    if (!drawerTotals) return 0

    return (
      drawerTotals.total_is_inbox + drawerTotals.total_is_trash + drawerTotals.total_is_2factor +
      drawerTotals.total_is_archive + drawerTotals.total_is_sent + drawerTotals.total_is_forward
    )
  }

  render () {
    const { selectedUpdateInProgress, dataFetchInProgress, isRefreshing, searchBarVisible, showSyncStats, intl, navigation } = this.props
    return (
      <View style={{ flex: 1 }}>
        {showSyncStats &&
          <SyncProgress table='mailbox_cache' total={this._getTotalCount()} />
        }
        <ListViewContainer
          listItemComponent={MailboxListItem}
          navigatorActiveKey='mailbox'
          selectItem={this._goToDetailView}
          fetchData={this.props.fetchMailbox}
          noDataMessage={<NoItem />}
          noSearchResultMessage={intl.formatMessage(m.native.Mailbox.noEmailsFound)}
          noSearchBar={!searchBarVisible}
          toggleSearchBar={this.props.toggleSearchBar}
          listItemSwipeComponent={ListItemSwipe}
          disableSwipe={Boolean(this.props.selectedIds.length)}
          swipeLeftOpenValue={70}
          swipeRightOpenValue={-70}
          enableItemSelection={Boolean(this.props.selectedIds.length)}
          onItemLongPress={this._handleItemLongPress}
          toggleItemSelection={this._handleItemSelectToggle}
          initiallySelectedItemIDs={this.props.selectedIds}
          {...this.props}
          dataFetchInProgress={!selectedUpdateInProgress && dataFetchInProgress}
          isRefreshing={!selectedUpdateInProgress && isRefreshing}
        />
        {selectedUpdateInProgress && <BatchUpdateProgress />}
        <Drawer
          open={this.props.isDrawerOpen}
          onClose={this.props.toggleDrawer}
          slideFrom='left'
          fullScreen
        >
          <DrawerContent closeDrawer={this.props.toggleDrawer} navigation={navigation} />
        </Drawer>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  data: state.mailbox.data,
  dataOrder: state.mailbox.dataOrder,
  dataTotalCount: state.mailbox.dataTotalCount,

  searchQuery: state.mailbox.searchQuery,
  searchResultsData: state.mailbox.searchResultsData,
  searchResultsDataOrder: state.mailbox.searchResultsDataOrder,
  searchResultsDataTotalCount: state.mailbox.searchResultsDataTotalCount,

  oldSyncInProgress: state.mailbox.oldSyncInProgress,
  isRefreshing: state.mailbox.isRefreshing,
  isPaginating: state.mailbox.isPaginating,
  isSearching: state.mailbox.isSearching,

  dataFetchInProgress: state.mailbox.dataRequestInProgress,
  dataFetchSuccessful: state.mailbox.dataRequestSuccessful,
  dataFetchError: state.mailbox.dataRequestError,

  filterName: state.mailbox.filterName,
  drawerTotals: state.mailbox.drawerTotals,

  selectedIds: state.mailbox.selectedIds,
  filterIdentityIds: state.mailbox.filterIdentityIds || [],
  selectedUpdateInProgress: state.mailbox.selectedUpdateInProgress
})

const mapDispatchToProps = {
  fetchMailbox: MailboxActions.mailboxFetch,
  clearSearchResultsData: MailboxActions.mailboxClearSearchData,
  setSearchQuery: MailboxActions.mailboxSetSearchQuery,
  setMailboxFilter: MailboxActions.setMailboxFilter,
  clearMailboxFilter: MailboxActions.clearMailboxFilter,
  clearMailboxIdentityFilter: MailboxActions.clearMailboxIdentityFilter,
  displayNotification: NotificationActions.displayNotification,
  selectEmail: MailboxActions.mailboxSelectEmail,
  unselectEmail: MailboxActions.mailboxUnselectEmail,
  clearSelection: MailboxActions.mailboxclearSelection
}

const navigationOptions = ({ navigation, screenProps: { fm } }) => {
  if (navigation.state.params && navigation.state.params.selectionMode) {
    return getSelectionModeNavigationOptions({ navigation, fm })
  }
  return getNavigationOptions({ navigation, fm })
}

const intlMailBox = injectIntl(Mailbox)

export default compose(
  setStatic('navigationOptions', navigationOptions),
  connect(mapStateToProps, mapDispatchToProps),
  withStateHandlers(
    {
      searchBarVisible: false,
      isDrawerOpen: false,
      showSyncStats: false
    },
    {
      toggleSearchBar:
        ({ searchBarVisible }, { clearSearchResultsData }) =>
          () => ({ searchBarVisible: !searchBarVisible || !clearSearchResultsData() }),
      toggleSyncStats: ({ showSyncStats }) => () => ({ showSyncStats: !showSyncStats }),
      toggleDrawer: ({ isDrawerOpen }) => () => ({ isDrawerOpen: !isDrawerOpen })
    }
  )
)(intlMailBox)
