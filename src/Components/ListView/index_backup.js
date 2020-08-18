import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, RefreshControl, ActivityIndicator, FlatList } from 'react-native'
import { injectIntl } from 'react-intl'
import { isEmpty, isNil, merge, path } from 'ramda'
import { initialize, destroy, change } from 'redux-form'

import m from 'commons/I18n'

import Text from 'app/Components/BaseText'
import layoutStyles from 'app/Styles/layout'
import SearchBar from 'app/Components/SearchBar'
import ListViewSwipeableRow from 'app/Components/ListViewSwipeableRow'
import ListViewSeparator from 'app/Components/ListViewSeparator'
import ListViewError from './components/ListViewError'
import FooterLoadingMessage from './components/FooterLoadingMessage'

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

    // Request progress status and error
    // (same used for both normal fetch and search)
    dataFetchError: PropTypes.string,
    dataFetchInProgress: PropTypes.bool,

    // Key that is to be set as active in TabBar
    navigatorActiveKey: PropTypes.string,

    // Set to true for hiding tab bar
    noTabBar: PropTypes.bool,

    // Set to false for hiding search bar
    noSearchBar: PropTypes.bool,

    // Header element, if any
    header: PropTypes.element,

    // Messages to be displayed when there are no
    // results
    noDataMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    noSearchResultMessage: PropTypes.string,

    // To force display search data and add isSearching over fetchData
    forceSearch: PropTypes.bool,

    // To clear the search results data
    // Called on componentWillMount
    clearSearchResultsData: PropTypes.func,

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

    enableItemSelection: PropTypes.bool,
    onItemSelectionDone: PropTypes.func,
    initiallySelectedItemIDs: PropTypes.array,
    toggleItemSelection: PropTypes.func,
    onItemLongPress: PropTypes.func
  }

  static defaultProps = {
    initiallySelectedItemIDs: [],
    keyExtractor: item => item.id
  }

  constructor (props) {
    super(props)

    this._isReduxFrom = this._isReduxFrom.bind(this)
    this._getFormIdentifier = this._getFormIdentifier.bind(this)
    this._initReduxFrom = this._initReduxFrom.bind(this)
    this._destroyReduxForm = this._destroyReduxForm.bind(this)
    this._getData = this._getData.bind(this)
    this._renderListItem = this._renderListItem.bind(this)
    this._updateData = this._updateData.bind(this)
    this._unfocusSearchBar = this._unfocusSearchBar.bind(this)
    this._handleListEndReached = this._handleListEndReached.bind(this)
    this._renderSubselect = this._renderSubselect.bind(this)
    this._renderSearchBar = this._renderSearchBar.bind(this)
    this._scrollToIndex = this._scrollToIndex.bind(this)
    this._onScrollFailed = this._onScrollFailed.bind(this)
    this._keyExtractorPatch = item => `${props.keyExtractor(item)}`

    let data = []

    if (props && props.data && !props.forceSearch) {
      data = this._getData(props)
    }

    this.state = {
      data,
      shouldRenderSubselect: false
    }

    this._selectItemArgs = []
  }

  _isReduxFrom () {
    const { navigation } = this.props
    if (
      navigation &&
      navigation.state &&
      navigation.state.params &&
      navigation.state.params.reduxFormIdentifier
    ) {
      return true
    }
    return false
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

  _getData (props) {
    props = props || this.props

    let { data, dataOrder, enableItemSelection, initiallySelectedItemIDs } = props

    if (props.searchResultsData || props.forceSearch) {
      data = props.searchResultsData
      dataOrder = props.searchResultsDataOrder
    }

    if (!dataOrder) {
      return data
    }

    return dataOrder.map(id => {
      let item = data[id]

      if (
        initiallySelectedItemIDs &&
        initiallySelectedItemIDs.length &&
        initiallySelectedItemIDs.indexOf(id) > -1
      ) {
        item = item.set('isSelected', true)
      }
      if (enableItemSelection) {
        item = item.set('enableItemSelection', true)
      } else {
        item = item.set('enableItemSelection', false)
      }
      return item
    })
  }

  componentWillMount () {
    this._initReduxFrom()

    if (this.props.forceSearch) {
      this.props.fetchData({ isSearching: true })
    } else if (!this.props.dataFetchInProgress && !this._isDataPresentInStore()) {
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

    this._updateData()

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
    this._updateData(nextProps)
  }

  _updateData (props) {
    props = props || this.props

    const data = this._getData(props)

    if (isNil(data)) return

    this.setState({
      data: data || []
    })
  }

  _isSearchBarAvailable () {
    return this.props.setSearchQuery && !this.props.noSearchBar
  }

  _unfocusSearchBar () {
    if (!this._isSearchBarAvailable()) return
    this.refs.searchBar && this.refs.searchBar.unFocus && this.refs.searchBar.unFocus()
  }

  _isDataPresentInStore () {
    const data = this._getData()
    return !isNil(data)
  }

  _renderSubselect () {
    const subselectComponent = path(['navigation', 'state', 'params', 'subselectComponent'], this.props)
    if (!subselectComponent) {
      return null
    }

    return <subselectComponent />
  }

  _renderListItem ({ item }) {
    const {
      listItemSwipeComponent,
      swipePosition,
      swipeLeftOpenValue,
      swipeRightOpenValue,
      listItemComponent,
      enableItemSelection,
      toggleItemSelection,
      onItemLongPress,
      keyExtractor
    } = this.props

    let { disableSwipe, selectItem } = this.props

    if (!enableItemSelection && this.props.navigation.state && this.props.navigation.state.params) {
      const {
        selectItemAndPop
      } = this.props.navigation.state.params

      disableSwipe = this.props.navigation.state.params.disableSwipe || disableSwipe

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

    let props = {
      onPress: enableItemSelection ? data => toggleItemSelection(data.id) : selectItem,
      onLongPress: onItemLongPress,
      enableItemSelection: enableItemSelection
    }

    if (!disableSwipe) {
      props = merge(props, {
        swipeComponent: listItemSwipeComponent,
        swipePosition: swipePosition,
        swipeLeftOpenValue: swipeLeftOpenValue,
        swipeRightOpenValue: swipeRightOpenValue
      })
    }

    return <ListViewSwipeableRow
      keyExtractor={keyExtractor}
      data={item}
      component={listItemComponent}
      onPress={selectItem}
      {...props}
    />
  }

  _renderSearchBar () {
    if (!this._isSearchBarAvailable()) return
    const cancel = this.props.setSearchQuery.bind(null, null)

    return SearchBar({
      placeholder: this.props.intl.formatMessage(m.app.Common.search),
      style: styles.searchBar,
      ref: 'searchBar',
      onChangeText: this.props.setSearchQuery,
      onCancel: cancel,
      text: this.initialSearchQuery || null
    })
  }

  _renderActivityIndicator () {
    return (
      <View style={styles.statusInfo}>
        <ActivityIndicator animating />
      </View>
    )
  }

  _renderError () {
    const {
      data,
      searchResultsData,
      isRefreshing,
      isPaginating,
      isSearching,
      dataFetchError,
      dataFetchInProgress,
      noDataMessage,
      noSearchResultMessage,
      intl
    } = this.props

    if (dataFetchInProgress && !isRefreshing && !isPaginating) {
      return this._renderActivityIndicator()
    }

    let error = null

    if (isSearching || (!isNil(searchResultsData) && isEmpty(searchResultsData))) {
      if ((!isNil(searchResultsData) && isEmpty(searchResultsData))) {
        error = noSearchResultMessage || intl.formatMessage(m.native.Snackbar.noItemsFound)
      } else if (dataFetchError) {
        error = dataFetchError
      }
    } else if (!isNil(data) && isEmpty(data)) {
      error = noDataMessage || dataFetchError || intl.formatMessage(m.native.Snackbar.noSearchResults)
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

  _handleListEndReached () {
    const {
      searchResultsData,
      dataOrder,
      searchResultsDataOrder,
      forceSearch,
      dataTotalCount,
      searchResultsDataTotalCount,
      isPaginating,
      dataFetchInProgress
    } = this.props

    if (isPaginating || dataFetchInProgress) return

    const isSearchDataVisible = forceSearch || !isNil(searchResultsData)

    if (
      (isSearchDataVisible && searchResultsDataOrder && searchResultsDataOrder.length < searchResultsDataTotalCount) ||
      (!isSearchDataVisible && dataOrder && dataOrder.length < dataTotalCount)
    ) {
      this.props.fetchData({ isPaginating: true })
    }
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
    const {
      searchResultsData,
      forceSearch,
      isRefreshing,
      isPaginating,
      isSearching,
      dataFetchInProgress
    } = this.props
    const { data } = this.state
    if (dataFetchInProgress && !isRefreshing && !isPaginating) {
      return this._renderActivityIndicator()
    }

    let fetch
    if (forceSearch || isSearching || !isNil(searchResultsData)) {
      fetch = this.props.fetchData.bind(this, { isRefreshing: true, isSearching: true })
    } else {
      fetch = this.props.fetchData.bind(this, { isRefreshing: true })
    }

    return (
      <View style={layoutStyles.flex}>
        <FlatList
          data={data}
          renderItem={this._renderListItem}
          refreshControl={<RefreshControl refreshing={isRefreshing || false} onRefresh={fetch} />}
          ItemSeparatorComponent={ListViewSeparator}
          onEndReached={this._handleListEndReached}
          onPress={this._unfocusSearchBar}
          onScroll={this._unfocusSearchBar}
          onScrollToIndexFailed={this._onScrollFailed}
          ListFooterComponent={isPaginating ? FooterLoadingMessage : null}
          keyExtractor={this._keyExtractorPatch}
          removeClippedSubviews={false}
          disableVirtualization={false}
          ref='flatListRef'
        />
        {this._renderError()}
      </View>
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

const IntlListViewContainer = injectIntl(ListViewContainer, { withRef: true })

const mapDispatchToProps = { initialize, change, destroy }

export default connect(null, mapDispatchToProps, null, { withRef: true })(IntlListViewContainer)
