import React, { PureComponent } from 'react'
import { View, ActivityIndicator, RefreshControl, Platform } from 'react-native'
import { connect } from 'react-redux'
import * as R from 'ramda'
import PropTypes from 'prop-types'
import { initialize, destroy, change } from 'redux-form'
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import Immutable from 'seamless-immutable'
import { SwipeRow, SwipeListView } from 'react-native-swipe-list-view'

import m from 'commons/I18n'
import Text from 'app/Components/BaseText'
import SearchBar from 'app/Components/SearchBar/index'
import ListViewSwipeableRow from 'app/Components/ListViewSwipeableRow'
import ListViewSeparator from 'app/Components/ListViewSeparator'
import ListViewError from 'app/Components/ListView/components/ListViewError'

import FooterLoadingMessage from 'app/Components/ListView/components/FooterLoadingMessage'
import SectionHeader from './components/SectionHeader'

import styles from './styles'
import layoutStyles from 'app/Styles/layout'

const ITEM_HEIGHT = 56
const SECTION_HEIGHT = Platform.OS === 'ios' ? 20 : 22.5
const SEPARATOR_HEIGHT = 1

class SectionListContainer extends PureComponent {
  static propTypes = {
    // Callback to be called upon pressing on a list item
    // The callback is passed the data object of the pressed
    // list item
    selectItem: PropTypes.func,
    listItemComponent: PropTypes.func.isRequired,
    groupByFunc: PropTypes.func.isRequired,
    sectionKeySortFunc: PropTypes.func,
    keyExtractor: PropTypes.func,

    initialSearchQuery: PropTypes.string,
    searchResultsData: PropTypes.object,
    searchResultsDataOrder: PropTypes.array,

    // Total counts of the data and searchResultsData
    // Used to determine whether further pagination
    // is necessary
    dataTotalCount: PropTypes.number,
    searchResultsDataTotalCount: PropTypes.number,

    // Request types
    isRefreshing: PropTypes.bool,
    isPaginating: PropTypes.bool,
    isSearching: PropTypes.bool,

    // Request progress status and error
    // (same used for both normal fetch and search)
    dataFetchError: PropTypes.string,
    dataFetchInProgress: PropTypes.bool,

    // Set to true for hiding tab bar
    noTabBar: PropTypes.bool,

    // Set to false for hiding search bar
    noSearchBar: PropTypes.bool,

    // Header element, if any
    header: PropTypes.element,

    // Messages to be displayed when there are no
    // results
    noDataMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    noSearchResultMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    // To force display search data and add isSearching over fetchData
    forceSearch: PropTypes.bool,

    // To force render SectionList instead of FlatList
    forceSection: PropTypes.bool,

    // To clear the search results data
    // Called on componentWillMount
    clearSearchResultsData: PropTypes.func,

    // Set the search query string
    // Called with the string entered in the searchbar
    // If absent, search box will not be rendered
    setSearchQuery: PropTypes.func,

    swipeProps: PropTypes.shape({
      swipeComponent: PropTypes.func,
      swipePosition: PropTypes.string,
      closeOnRowPress: PropTypes.bool,
      swipeLeftOpenValue: PropTypes.number,
      swipeRightOpenValue: PropTypes.number
    })
  }

  static defaultProps = {
    initiallySelectedItemIDs: Immutable([]),
    keyExtractor: item => item.id,
    swipeProps: {}
  }

  constructor (props) {
    super(props)

    this._setSections(props.data)
    this.getItemLayout = sectionListGetItemLayout({
      getItemHeight: (rowData, sectionIndex, rowIndex) => ITEM_HEIGHT,
      getSeparatorHeight: () => SEPARATOR_HEIGHT,
      getSectionHeaderHeight: () => SECTION_HEIGHT
    })
    this._scrollToLocation = this._scrollToLocation.bind(this)
  }

  _isReduxForm = () => R.path(['navigation', 'state', 'params', 'reduxFormIdentifier'], this.props)

  _getFormIdentifier = () => {
    if (!this._isReduxForm()) return null

    return this.props.navigation.state.params.reduxFormIdentifier
  }

  _initReduxForm = () => {
    if (!this._isReduxForm()) return

    const { initialize } = this.props
    initialize(this._getFormIdentifier(), { data: null })
  }

  _destroyReduxForm = () => {
    if (!this._isReduxForm()) return

    const { destroy } = this.props
    destroy(this._getFormIdentifier())
  }

  _getGroupfiedData = (dataSource) => {
    const { groupByFunc, sectionKeySortFunc } = this.props
    let res = R.groupBy(groupByFunc, dataSource)
    let keys = R.keys(res)

    if (sectionKeySortFunc) { keys = R.sort(sectionKeySortFunc)(keys) }

    res = R.reduce((acc, key) => {
      const data = res[key]

      acc.push({ key, data })
      return acc
    }, [], keys)

    return res
  }

  _isSearchBarAvailable () {
    return !!this.props.setSearchQuery && !this.props.noSearchBar
  }

  _unfocusSearchBar () {
    if (!this._isSearchBarAvailable()) return
    this.refs.searchBar && this.refs.searchBar.unFocus && this.refs.searchBar.unFocus()
  }

  _renderSubselect () {
    const SubselectComponent = R.path(['navigation', 'state', 'params', 'subselectComponent'], this.props)
    if (!SubselectComponent) {
      return null
    }

    return <SubselectComponent />
  }

  _renderSearchBar () {
    if (!this._isSearchBarAvailable()) return

    return (
      <SearchBar
        placeholder={this.props.intl.formatMessage(m.app.Common.search)}
        style={styles.searchBar}
        ref='searchBar'
        onChangeText={q => this.props.setSearchQuery(q)}
        onCancel={() => { this.props.setSearchQuery(null); this.props.toggleSearchBar() }}
        text={this.initialSearchQuery || null}
      />
    )
  }

  _renderActivityIndicator () {
    return (
      <View style={styles.statusInfo}>
        <ActivityIndicator animating />
      </View>
    )
  }

  _renderSectionHeader = ({ section }) => <SectionHeader title={section.key} />

  _renderListItem = ({ item }, keyMap) => {
    const {
      listItemComponent,
      enableItemSelection,
      toggleItemSelection,
      keyExtractor,
      initiallySelectedItemIDs,
      onItemLongPress
    } = this.props
    let { selectItem, swipeProps } = this.props
    let disableSwipe = !swipeProps

    const navStateParams = R.path(['navigation', 'state', 'params'], this.props)

    if (!enableItemSelection && navStateParams) {
      const { selectItemAndPop } = navStateParams
      disableSwipe = navStateParams.disableSwipe || disableSwipe
      if (selectItemAndPop) {
        selectItem = (...args) => {
          selectItemAndPop(...args)
          this.props.navigation.goBack()
        }
      } else if (this._isReduxForm()) {
        selectItem = one => this.props.change(this._getFormIdentifier(), 'data', one)
      }
    }

    swipeProps = disableSwipe ? {} : swipeProps // TODOS: More beauty

    const dataKey = keyExtractor(item)

    const isRowOpen = () => {
      return keyMap[dataKey] && keyMap[dataKey]._translateX._value !== 0
    }

    const closeSwipeRow = () => {
      if (isRowOpen()) {
        keyMap[dataKey].closeRow()
      }
    }

    const onPress = enableItemSelection ? data => toggleItemSelection(data.id) : selectItem

    const props = {
      keyExtractor,
      dataKey,
      isRowOpen,
      data: item,
      keyMap: keyMap,
      component: listItemComponent,
      onPress: () => onPress(item),
      onLongPress: onItemLongPress,
      enableItemSelection,
      isSelected: initiallySelectedItemIDs.includes(item.id),
      onCloseSwipeRequested: closeSwipeRow,
      ...swipeProps
    }

    const propOverrides = {
      disableRightSwipe: !props.swipeLeftOpenValue,
      disableLeftSwipe: !props.swipeRightOpenValue,
      closeOnRowPress: props.closeOnRowPress
    }

    return (
      <SwipeRow
        key={keyExtractor(item)}
        leftOpenValue={props.swipeLeftOpenValue}
        rightOpenValue={props.swipeRightOpenValue}
        {...propOverrides}
      >
        {props.swipeComponent && <props.swipeComponent {...props} />}
        <ListViewSwipeableRow {...props} />
      </SwipeRow>
    )
  }

  _scrollToSection = (sectionKey, animated = true) => {
    const sectionIndex = R.findIndex(R.propEq('key', sectionKey))(this.sections)

    if (this.sectionListRef && sectionIndex > -1) {
      // Assigning viewOffset again here (buggy but it works)
      this._scrollToLocation({ animated, sectionIndex, viewOffset: SECTION_HEIGHT })
    }
  }

  _scrollToLocation = ({ animated, itemIndex, sectionIndex, viewOffset, viewPosition }) => {
    this.sectionListRef && this.sectionListRef.scrollToLocation({
      animated: animated || false,
      itemIndex: itemIndex || 0,
      sectionIndex,
      viewOffset: viewOffset,
      viewPosition: viewPosition || 0
    })
  }

  _handleListEndReached = () => {
    const { isPaginating, dataFetchInProgress } = this.props
    const { dataCount, dataTotalCount, paginateData } = this._getData()
    console.log('SectionList _handleListEndReached')
    if (isPaginating || dataFetchInProgress) return

    if (dataCount && dataCount < dataTotalCount) {
      console.log('SectionList _handleListEndReached started paginating')
      paginateData()
    }
  }

  _isSearchMode = (props = this.props) => {
    return props.forceSearch || props.isSearching || !R.isNil(props.searchResultsData)
  }

  _getData = (props = this.props) => {
    if (this._isSearchMode(props)) {
      return {
        data: props.searchResultsData,
        dataCount: (props.searchResultsDataOrder || []).length,
        dataTotalCount: props.searchResultsDataTotalCount,
        refreshData: () => props.fetchData({ isRefreshing: true, isSearching: true }),
        paginateData: () => props.fetchData({ isPaginating: true, isSearching: true })
      }
    }

    return {
      data: props.data,
      dataCount: (props.dataOrder || []).length,
      dataTotalCount: props.dataTotalCount,
      refreshData: () => props.fetchData({ isRefreshing: true }),
      paginateData: () => props.fetchData({ isPaginating: true })
    }
  }

  componentDidMount () {
    this._unfocusSearchBar()
  }

  componentWillMount () {
    this._initReduxForm()

    if (this.props.forceSearch) {
      this.props.fetchData({ isSearching: true })
    } else if (!this.props.dataFetchInProgress && R.isNil(this.props.data)) {
      // Prevent data fetch on every mount
      // For e.g. when switching between the tabs
      this.props.fetchData()
    }

    this.initialSearchQuery = this.props.initialSearchQuery
  }

  componentWillUnmount () {
    this._destroyReduxForm()
    if (this.props.forceSearch && typeof this.props.clearSearchResultsData === 'function') {
      this.props.clearSearchResultsData()
    }
  }

  componentWillReceiveProps (nextProps) {
    const { data } = this._getData()
    const nextData = this._getData(nextProps).data

    if (data !== nextData) {
      this._setSections(nextData)
    }
    // close opened rows when active tab changes
    if (this.props.activeTabNavigationIndex !== nextProps.activeTabNavigationIndex && this.refs.swipeListViewRef) {
      this.refs.swipeListViewRef.safeCloseOpenRow()
    }
  }

  _setSections (data) {
    const dataSource = R.values(data)

    this.sections = this._getGroupfiedData(dataSource) || []
  }

  _renderError () {
    const {
      data,
      searchResultsData,
      // isRefreshing,
      // isPaginating,
      isSearching,
      dataFetchError,
      // dataFetchInProgress,
      noDataMessage,
      noSearchResultMessage,
      intl
    } = this.props

    // TODO: Its absolutely useless code but leave it for debug purpose of two loading activity
    // when Message Room -> Create a new room
    // if (dataFetchInProgress && !isRefreshing && !isPaginating) {
    //   return this._renderActivityIndicator()
    // }

    let error = null

    if (isSearching || (!R.isNil(searchResultsData) && R.isEmpty(searchResultsData))) {
      if ((!R.isNil(searchResultsData) && R.isEmpty(searchResultsData))) {
        error = noSearchResultMessage || intl.formatMessage(m.native.Snackbar.noItemsFound)
      } else if (dataFetchError) {
        error = dataFetchError
      }
    } else if (!R.isNil(data) && R.isEmpty(data)) { // No data error message should be displayed via SectionList/FlatList viewer
      error = noDataMessage || dataFetchError || intl.formatMessage(m.native.Snackbar.noSearchResults)
    } else if (dataFetchError) {
      error = dataFetchError
    }

    if (typeof error === 'string') {
      error = (
        <ListViewError>
          <Text style={styles.errorText}>{error}</Text>
        </ListViewError>
      )
    }

    return error
  }

  _renderBody () {
    const {
      isRefreshing,
      isPaginating,
      dataFetchInProgress,
      keyExtractor,
      forceSection,
      networkOnline,
      wsOnline
    } = this.props

    const { data, refreshData } = this._getData()
    const isEmpty = R.isNil(data) || R.isEmpty(data)
    if ((R.isNil(data) && networkOnline && wsOnline) || (dataFetchInProgress && !isRefreshing && isEmpty)) {
      return this._renderActivityIndicator()
    }

    let ListFooterComponent = null

    if (isPaginating) {
      ListFooterComponent = <FooterLoadingMessage />
    } else if (dataFetchInProgress && !isRefreshing) {
      ListFooterComponent = <FooterLoadingMessage messageKey={m.app.Common.loadingMoreResults} />
    }

    if (this._isSearchMode() && !forceSection) {
      return (
        <SwipeListView
          useFlatList
          {...this.props.swipeProps}
          data={R.values(data)}
          renderItem={this._renderListItem}
          refreshControl={<RefreshControl refreshing={isRefreshing || false} onRefresh={refreshData} />}
          ItemSeparatorComponent={ListViewSeparator}
          onEndReached={this._handleListEndReached}
          keyExtractor={keyExtractor || (item => item.id)}
          removeClippedSubviews={false}
          ListFooterComponent={ListFooterComponent}
          ref='swipeListViewRef'
        />
      )
    }

    // Rendering SectionList without `getItemLayout` prop only for android to prevent partial rendering of the items.
    // Issue resolved: all items doesnot render when `getItemLayout` is passed on android.
    return (
      <SwipeListView
        useSectionList
        {...this.props.swipeProps}
        sections={this.sections}
        renderSectionHeader={this._renderSectionHeader}
        renderItem={this._renderListItem}
        refreshControl={<RefreshControl refreshing={isRefreshing || false} onRefresh={refreshData} />}
        ItemSeparatorComponent={ListViewSeparator}
        onEndReached={this._handleListEndReached}
        keyExtractor={keyExtractor || (item => item.id)}
        removeClippedSubviews={false}
        getItemLayout={Platform.OS === 'android' ? null : this.getItemLayout}
        ListFooterComponent={ListFooterComponent}
        listViewRef={(ref) => { this.sectionListRef = ref }}
        ref='swipeListViewRef'
      />
    )
  }

  render () {
    const { header, noTabBar } = this.props
    return (
      <View style={[layoutStyles.flex, !noTabBar ? layoutStyles.withTabBar : {}]}>
        {header}
        {this._renderSearchBar()}
        <View style={layoutStyles.flex}>
          {this._renderBody()}
          {this._renderError()}
        </View>
        {this._renderSubselect()}
      </View>
    )
  }
}

const mapStateToProps = state => ({
  activeTabNavigationIndex: state.nav.routes[state.nav.index].index,
  networkOnline: state.app.isNetworkOnline,
  wsOnline: state.chat.socketConnected
})

const mapDispatchToProps = { initialize, destroy, change }

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(SectionListContainer)
