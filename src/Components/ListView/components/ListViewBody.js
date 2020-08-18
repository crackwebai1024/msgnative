import React from 'react'
import { View, RefreshControl, ActivityIndicator } from 'react-native'
import { withProps, withHandlers, compose, branch, renderComponent, withPropsOnChange, onlyUpdateForKeys } from 'recompose'
import { SwipeListView } from 'react-native-swipe-list-view'

import { isEmpty, isNil } from 'ramda'

import { withNetworkState } from 'commons/Lib/NetworkStateProvider'
import m from 'commons/I18n'

import Text from 'app/Components/BaseText'
import ListViewSeparator from 'app/Components/ListViewSeparator'

import ListViewError from './ListViewError'
import FooterLoadingMessage from './FooterLoadingMessage'

import layoutStyles from 'app/Styles/layout'
import styles from '../styles'

const Spinner = () => (
  <View style={styles.statusInfo}>
    <ActivityIndicator animating />
  </View>
)

const ListViewBody = ({
  paginateData,
  isPaginating,
  isRefreshing,
  dataFetchInProgress,
  onScroll,
  onScrollToIndexFailed,
  onRefresh,
  listData,
  extraData,
  renderItem,
  keyExtractorPatch,
  swipeViewProps,
  error,
  data,
  dataOrder,
  navigatorActiveKey,
  listViewRef, // function to receive ref to List component
  swipeListViewRef // function to receive ref to SwipeListView component
}) => {
  let ListFooterComponent = null
  if (isPaginating) {
    ListFooterComponent = <FooterLoadingMessage />
  } else if (dataFetchInProgress && !isRefreshing) {
    ListFooterComponent = <FooterLoadingMessage messageKey={m.app.Common.loadingMoreResults} />
  }
  return (
    <View style={layoutStyles.flex}>
      <SwipeListView
        useFlatList
        {...swipeViewProps}
        data={listData}
        extraData={extraData}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={!!isRefreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={ListViewSeparator}
        onEndReached={paginateData}
        onScroll={onScroll}
        onScrollToIndexFailed={onScrollToIndexFailed}
        ListFooterComponent={ListFooterComponent}
        keyExtractor={keyExtractorPatch}
        removeClippedSubviews={false}
        disableVirtualization={false}
        listViewRef={listViewRef}
        ref={swipeListViewRef}
      />
      { typeof error === 'string' ? <ListViewError><Text style={styles.errorText}>{error}</Text></ListViewError> : error }
    </View>
  )
}

const isLoadingFn = props => (
  (isNil(props.data) && props.networkOnline) ||
  (props.dataFetchInProgress && !props.isRefreshing && (isNil(props.data) || isEmpty(props.data)))
)

const spinnerWhileLoading = isLoading => branch(isLoading, renderComponent(Spinner))

const wPOC = {
  shouldMapOrKeys: ['data', 'dataOrder'],
  createOnlyOnChanged: ({ data, dataOrder }) => ({
    listData: !dataOrder ? data : dataOrder.map(id => data[id])
  })
}

const createMoreProps = props => {
  const {
    isSearchDataVisible,
    dataFetchError,
    noDataMessage,
    noSearchResultMessage,
    listData
  } = props

  let error = null
  if (dataFetchError) {
    error = dataFetchError
  } else if (!listData || !listData.length) {
    error = isSearchDataVisible ? noSearchResultMessage : noDataMessage
  }

  return { error }
}

const handlers = {
  paginateData: props => () => {
    const {
      fetchData,
      dataOrder,
      dataTotalCount,
      isPaginating,
      dataFetchInProgress,
      forcePaginate
    } = props

    if (isPaginating || dataFetchInProgress) return
    // paginate only if:
    // - data loaded count < data total count, or
    // - forcePaginate prop is true
    if ((dataOrder && dataOrder.length < dataTotalCount) || forcePaginate) {
      fetchData({ isPaginating: true })
    }
  },
  onRefresh: props => () => {
    const param = props.isSearchDataVisible || props.isSearching
      ? { isRefreshing: true, isSearching: true }
      : { isRefreshing: true }

    props.fetchData(param)
  }
}

export default compose(
  spinnerWhileLoading(isLoadingFn),
  withPropsOnChange(wPOC.shouldMapOrKeys, wPOC.createOnlyOnChanged),
  withProps(createMoreProps),
  withHandlers(handlers),
  onlyUpdateForKeys(['listData', 'enableItemSelection', 'extraData']),
  withNetworkState
)(ListViewBody)
