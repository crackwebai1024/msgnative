import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View } from 'react-native'
import { injectIntl } from 'react-intl'
import { mapProps, compose } from 'recompose'
import { isNil, merge, path, pick } from 'ramda'
import { initialize, destroy, change } from 'redux-form'
import Immutable from 'seamless-immutable'
import { SwipeRow } from 'react-native-swipe-list-view'

import m from 'commons/I18n'

import layoutStyles from 'app/Styles/layout'
import SearchBar from 'app/Components/SearchBar'
import ListViewSwipeableRow from 'app/Components/ListViewSwipeableRow'
import ListViewBody from './components/ListViewBody'

import styles from './styles'
/**
 * ListViewContainer - for views that need a simple list view.
 *
 * Used by – Chat Rooms & Identities views.
 *
 * Notes –
 *
 * - selectItem callback prop is called with the selected item data
 *   For e.g. when a identity needs to be selected in contact creation form
 *   or a contact needs to be selected in the contact list view.
 */
class ListViewContainer extends PureComponent {
  static propTypes = {
    // Callback to be called upon pressing on a list item
    // The callback is passed the data object of the pressed
    // list item
    selectItem: PropTypes.func,

    // Use this instead for popping the screen after selection
    selectItemAndPop: PropTypes.func,

    // custom props to be passed to the list item component
    listItemProps: PropTypes.object,

    // Data and data orders
    data: PropTypes.object,
    dataOrder: PropTypes.array,
    fetchData: PropTypes.func,

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

    // whether to froce paginate onEndReached
    forcePaginate: PropTypes.bool,

    // Request progress status and error
    // (same used for both normal fetch and search)
    dataFetchError: PropTypes.string,
    dataFetchInProgress: PropTypes.bool,

    // Key that is to be set as active in TabBar
    navigatorActiveKey: PropTypes.string,

    // active tab index
    activeTabNavigationIndex: PropTypes.number,

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

    // To clear the search results data
    // Called on componentWillMount
    clearSearchResultsData: PropTypes.func,

    // To toggle the search bar
    toggleSearchBar: PropTypes.func,

    // Custom onBack callback
    onBack: PropTypes.func,

    // Set the search query string
    // Called with the string entered in the searchbar
    // If absent, search box will not be rendered
    setSearchQuery: PropTypes.func,

    // Disable swipe - used for disabling swipe for single item selection
    disableSwipe: PropTypes.bool,

    // Swipe component for list items
    listItemSwipeComponent: PropTypes.func,
    swipePosition: PropTypes.string,
    swipeLeftOpenValue: PropTypes.number,
    swipeRightOpenValue: PropTypes.number,
    closeOnRowPress: PropTypes.bool,

    enableItemSelection: PropTypes.bool,
    onItemSelectionDone: PropTypes.func,
    initiallySelectedItemIDs: PropTypes.array,
    toggleItemSelection: PropTypes.func,
    onItemLongPress: PropTypes.func,

    destroy: PropTypes.func,
    initialize: PropTypes.func,
    navigation: PropTypes.object,
    listItemComponent: PropTypes.func,
    keyExtractor: PropTypes.func,
    change: PropTypes.func,
    intl: PropTypes.object
  }

  static defaultProps = {
    initiallySelectedItemIDs: Immutable([]),
    listItemProps: {},
    keyExtractor: item => item.id,
    closeOnRowPress: true,
    disableSwipe: false,
    paginateData: false,
    keyExtractorPatch: item => `${item.id}` // because FlatList only accepts string key extractor,
  }

  constructor (props) {
    super(props)

    this._isReduxFrom = this._isReduxFrom.bind(this)
    this._getFormIdentifier = this._getFormIdentifier.bind(this)
    this._initReduxFrom = this._initReduxFrom.bind(this)
    this._destroyReduxForm = this._destroyReduxForm.bind(this)
    this._renderListItem = this._renderListItem.bind(this)
    this._unfocusSearchBar = this._unfocusSearchBar.bind(this)
    this._renderSubselect = this._renderSubselect.bind(this)
    this._renderSearchBar = this._renderSearchBar.bind(this)
    this._scrollToIndex = this._scrollToIndex.bind(this)
    this._onScrollFailed = this._onScrollFailed.bind(this)

    this.swipeListViewRef = null // ref to swipe list view which is rendered by ListBody component
    this.flatListRef = null // ref to FlatList which is internally rendered by SwipeListView component
  }

  _isReduxFrom () {
    return path(['navigation', 'state', 'params', 'reduxFormIdentifier'], this.props)
  }

  _getFormIdentifier () {
    if (!this._isReduxFrom()) return null
    return this.props.navigation.state.params.reduxFormIdentifier
  }

  _initReduxFrom () {
    if (!this._isReduxFrom()) return
    const { initialize } = this.props
    initialize(this._getFormIdentifier(), { data: null })
  }

  _destroyReduxForm () {
    if (!this._isReduxFrom()) return
    const { destroy } = this.props
    destroy(this._getFormIdentifier())
  }

  componentWillMount () {
    this._initReduxFrom()

    if (this.props.forceSearch) {
      this.props.fetchData({ isSearching: true })
    } else if (!this.props.dataFetchInProgress && isNil(this.props.data)) {
      // Prevent data fetch on every mount
      // For e.g. when switching between the tabs
      this.props.fetchData()
    }

    // const routerRefreshProps = {}
    //
    // if (this.props.onBack) {
    //   routerRefreshProps['onBack'] = this.props.onBack
    // }
    //
    // if (this.props.navigation.state.onItemSelectionDone) {
    //   routerRefreshProps['rightTitle'] = this.props.intl.formatMessage(m.app.Common.done)
    //   routerRefreshProps['onRight'] = this.props.onItemSelectionDone
    // }
    //
    // if (!isEmpty(routerRefreshProps)) {
    //   RouterActions.refresh(routerRefreshProps)
    // }

    this.initialSearchQuery = this.props.initialSearchQuery
  }

  componentDidMount () {
    this._unfocusSearchBar()
  }

  componentWillUnmount () {
    this._destroyReduxForm()
    if (this.props.forceSearch && typeof this.props.clearSearchResultsData === 'function') {
      this.props.clearSearchResultsData()
    }
  }

  componentWillReceiveProps (nextProps) {
    // close opened rows when active tab changes
    if (this.props.activeTabNavigationIndex !== nextProps.activeTabNavigationIndex && this.swipeListViewRef) {
      this.swipeListViewRef.safeCloseOpenRow()
    }
  }

  _isSearchBarAvailable () {
    return this.props.setSearchQuery && !this.props.noSearchBar
  }

  _unfocusSearchBar () {
    if (!this._isSearchBarAvailable()) return
    this.refs.searchBar && this.refs.searchBar.unFocus && this.refs.searchBar.unFocus()
  }

  _renderSubselect () {
    const SubselectComponent = path(['navigation', 'state', 'params', 'subselectComponent'], this.props)
    if (!SubselectComponent) {
      return null
    }

    return <SubselectComponent />
  }

  _renderListItem ({ item }, keyMap) {
    const {
      listItemSwipeComponent,
      swipePosition,
      swipeLeftOpenValue,
      swipeRightOpenValue,
      closeOnRowPress,
      listItemComponent,
      enableItemSelection,
      toggleItemSelection,
      onItemLongPress,
      initiallySelectedItemIDs,
      keyExtractor,
      listItemProps
    } = this.props
    let { disableSwipe, selectItem } = this.props
    const navigationParams = path(['navigation', 'state', 'params'], this.props)

    if (!enableItemSelection && navigationParams) {
      const { selectItemAndPop } = navigationParams

      disableSwipe = navigationParams.disableSwipe || disableSwipe

      if (selectItemAndPop) {
        selectItem = (...args) => {
          selectItemAndPop(...args)
          this.props.navigation.goBack()
        }
      } else if (this._isReduxFrom()) {
        selectItem = (one) => {
          this.props.change(this._getFormIdentifier(), 'data', one)
        }
      }
    }

    const dataKey = keyExtractor(item)

    const isRowOpen = () => {
      return keyMap[dataKey] && keyMap[dataKey]._translateX._value !== 0
    }

    const closeSwipeRow = () => {
      if (isRowOpen()) {
        keyMap[dataKey].closeRow()
      }
    }
    const toggleItemSelectionFunc = (navigationParams && navigationParams.toggleItemSelection) || toggleItemSelection
    const onPress = enableItemSelection ? toggleItemSelectionFunc : selectItem
    const onItemLongPressFunc = (navigationParams && navigationParams.onItemLongPress) || onItemLongPress
    let props = {
      keyExtractor,
      listItemProps,
      dataKey,
      isRowOpen,
      data: item,
      keyMap: keyMap,
      component: listItemComponent,
      onPress: () => onPress(item),
      onLongPress: onItemLongPressFunc,
      enableItemSelection: enableItemSelection,
      isSelected: initiallySelectedItemIDs.includes(item.id),
      swipeComponent: listItemSwipeComponent,
      onCloseSwipeRequested: closeSwipeRow
    }

    if (!disableSwipe) {
      props = merge(props, {
        swipePosition: swipePosition,
        swipeLeftOpenValue: swipeLeftOpenValue,
        swipeRightOpenValue: swipeRightOpenValue,
        closeOnRowPress: closeOnRowPress
      })
    }

    const propOverrides = {
      disableRightSwipe: !props.swipeLeftOpenValue,
      disableLeftSwipe: !props.swipeRightOpenValue
    }

    return (
      <SwipeRow
        key={keyExtractor(item)}
        leftOpenValue={props.swipeLeftOpenValue}
        rightOpenValue={props.swipeRightOpenValue}
        {...propOverrides}
      >
        {(!disableSwipe && props.swipeComponent) && <props.swipeComponent {...props} />}
        <ListViewSwipeableRow {...props} />
      </SwipeRow>
    )
  }

  _renderSearchBar () {
    if (!this._isSearchBarAvailable()) return
    const cancel = () => {
      this.props.setSearchQuery(null)
      if (typeof this.props.toggleSearchBar === 'function') {
        this.props.toggleSearchBar()
      }
    }

    return SearchBar({
      placeholder: this.props.intl.formatMessage(m.app.Common.search),
      style: styles.searchBar,
      ref: 'searchBar',
      onChangeText: this.props.setSearchQuery,
      onCancel: cancel,
      text: this.initialSearchQuery || null
    })
  }

  _scrollToIndex (index, animated = true) {
    if (this.flatListRef) {
      this.flatListRef.scrollToIndex({ animated, index })
    }
  }

  _onScrollFailed () {
    if (this.flatListRef) {
      this.flatListRef.scrollToIndex({ animated: true, index: 0 })
    }
  }

  _renderBody () {
    const compProps = pick([
      'fetchData', 'dataFetchInProgress', 'dataFetchError',
      'data', 'dataOrder', 'dataTotalCount', 'forcePaginate',
      'isSearchDataVisible', 'isSearching', 'isRefreshing', 'isPaginating',
      'noDataMessage', 'noSearchResultMessage', 'enableItemSelection',
      'keyExtractorPatch'
    ], this.props)
    const swipeViewProps = pick([
      'swipeLeftOpenValue', 'swipeRightOpenValue', 'closeOnRowPress'
    ], this.props)

    const { formatMessage } = this.props.intl
    const noSearchResultMessage = this.props.noSearchResultMessage || formatMessage(m.native.Snackbar.noSearchResults)
    const noDataMessage = this.props.noDataMessage || formatMessage(m.native.Snackbar.noItemsFound)

    return (
      <ListViewBody
        renderItem={this._renderListItem}
        onScroll={this._unfocusSearchBar}
        noSearchResultMessage={noSearchResultMessage}
        noDataMessage={noDataMessage}
        extraData={{ initiallySelectedItemIDs: this.props.initiallySelectedItemIDs, ...this.props.listItemProps }}
        swipeViewProps={swipeViewProps}
        {...compProps}
        listViewRef={(ref) => { this.flatListRef = ref }}
        swipeListViewRef={(ref) => { this.swipeListViewRef = ref }}
      />
    )
  }

  render () {
    const { header, noTabBar } = this.props
    return (
      <View style={[layoutStyles.flex, !noTabBar ? layoutStyles.withTabBar : {}]}>
        {header}
        {this._renderSearchBar()}
        {this._renderBody()}
        {this._renderSubselect()}
      </View>
    )
  }
}

const prepareData = props => {
  const {
    searchResultsData,
    searchResultsDataOrder,
    searchResultsDataTotalCount,
    forceSearch,
    ...otherProps
  } = props
  const isSearchDataVisible = searchResultsData || forceSearch // TODO: do we need '|| props.forceSearch'?
  if (!isSearchDataVisible) { return props }

  return {
    ...otherProps,
    forceSearch,
    isSearchDataVisible,
    data: searchResultsData,
    dataOrder: searchResultsDataOrder,
    dataTotalCount: searchResultsDataTotalCount
  }
}

const mapStateToProps = state => ({
  activeTabNavigationIndex: state.nav.routes[state.nav.index].index
})

export default compose(
  mapProps(prepareData),
  connect(mapStateToProps, { initialize, change, destroy }, null, { withRef: true })
)(
  injectIntl(ListViewContainer, { withRef: true })
)
