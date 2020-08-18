import React, { Component } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { equals, path } from 'ramda'
import { withStateHandlers, compose, setStatic } from 'recompose'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import Text from 'app/Components/BaseText'
import IdentityActions from 'commons/Redux/IdentityRedux'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'
import ListViewContainer from 'app/Components/ListView'
import ListViewError from 'app/Components/ListView/components/ListViewError'
import NavButtonsWithSearch from 'app/Components/ListView/NavButtonsWithSearch'
import ContactListItem from 'app/Components/ContactListItem'
import HeaderButton from 'app/Components/HeaderButton'
import HeaderTitleWithFilterAndSync from 'app/Components/HeaderTitleWithFilterAndSync/HeaderTitleWithFilterAndSync'
import SyncProgress from 'app/Components/SyncProgress'

import baseStyles from 'app/Components/ListView/styles'

import ListItemSwipe from './components/ListItemSwipe'

class Identity extends Component {
  constructor (props) {
    super(props)

    this.state = { selectedIdentities: [] }

    const mailboxFilter = path(['state', 'params', 'mailboxFilter'], props.navigation)
    if (mailboxFilter) {
      this.state.selectedIdentities = props.mailboxFilterIdentityIds
    }

    this._toggleItemSelection = this._toggleItemSelection.bind(this)
    this._goToCreateView = this._goToCreateView.bind(this)
    this._handleOnUnmount = this._handleOnUnmount.bind(this)
    this._renderNoItemError = this._renderNoItemError.bind(this)
  }

  _toggleItemSelection ({ id }) {
    let selectedIdentities = this.state.selectedIdentities
    const index = selectedIdentities.indexOf(id)
    if (index < 0) {
      selectedIdentities = [...selectedIdentities, id]
    } else {
      selectedIdentities = [
        ...selectedIdentities.slice(0, index),
        ...selectedIdentities.slice(index + 1)
      ]
    }

    this.setState({ selectedIdentities }, () => {
      this.props.navigation.setParams({ selectedIdentities })
    })
  }

  _handleItemSelect = identity => {
    if (identity.actionTypeInProgress) return

    const { dispatch, navigation } = this.props
    const dispatchAndPop = path(['navigation', 'state', 'params', 'dispatchAndPop'], this.props)
    if (dispatchAndPop) {
      dispatch(dispatchAndPop(identity))
      return navigation.goBack()
    }

    navigation.navigate('IdentityDetail', { id: identity.id })
  }

  _goToCreateView () {
    this.props.navigation.navigate('CreateIdentity')
  }

  _renderNoItemError () {
    const fm = this.props.intl.formatMessage
    return (
      <ListViewError>
        <Text style={baseStyles.errorText}>{fm(m.native.Contact.noIdentitiesFound)}</Text>
        <TouchableOpacity style={baseStyles.errorAction} onPress={this._goToCreateView}>
          <Text style={[baseStyles.errorText, baseStyles.errorActionText]}>{fm(m.native.Contact.clickHereToAddRecord)}</Text>
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
    const navParams = path(['state', 'params'], navigation)
    const shouldShowSyncIcon = (
      oldSyncInProgress && !searchQuery && !navParams.mailboxFilter &&
      !navParams.selectItemAndPop
    )
    const navOldSyncInProgress = path(['state', 'params', 'oldSyncInProgress'], this.props.navigation)
    if (!equals(navOldSyncInProgress, shouldShowSyncIcon)) {
      navigation.setParams({ oldSyncInProgress: shouldShowSyncIcon })
    }

    if (!shouldShowSyncIcon && props.showSyncStats) {
      this.props.toggleSyncStats()
    }
  }

  componentWillReceiveProps (nextProps) {
    this._updateSyncInProgress(nextProps)
    this._updateHeaderMode(nextProps)
  }

  _updateHeaderMode (nextProps) {
    const props = nextProps || this.props
    const { navigation } = props

    const mailboxFilter = path(['state', 'params', 'mailboxFilter'], navigation)

    let selectionMode = !!mailboxFilter

    if (
      navigation.state.params && navigation.state.params.selectionMode !== selectionMode
    ) {
      navigation.setParams({ selectionMode: selectionMode })
    }
  }

  componentWillUnmount () {
    this._handleOnUnmount()
  }

  componentDidMount () {
    this.props.navigation.setParams({
      onSearchPress: this.props.toggleSearchBar.bind(this),
      selectedIdentities: this.state.selectedIdentities,
      toggleSyncStats: this.props.toggleSyncStats.bind(this),
      oldSyncInProgress: this.props.oldSyncInProgress
    })
  }

  render () {
    const { selectedUpdateInProgress, dataFetchInProgress, isRefreshing, searchBarVisible, intl, navigation, showSyncStats } = this.props
    let customProps
    if (navigation.state.params && navigation.state.params.mailboxFilter) {
      customProps = {
        enableItemSelection: true,
        initiallySelectedItemIDs: this.state.selectedIdentities,
        toggleItemSelection: this._toggleItemSelection
      }
    }

    return (
      <View style={{ flex: 1 }}>
        {showSyncStats &&
          <SyncProgress table='identities_cache' total={this.props.totalIdentities} />
        }
        <ListViewContainer
          listItemComponent={ContactListItem}
          navigatorActiveKey='identity'
          selectItem={this._handleItemSelect}
          fetchData={this.props.fetchIdentities}
          initialSearchQuery={this.props.searchQuery}
          noDataMessage={this._renderNoItemError()}
          noSearchResultMessage={intl.formatMessage(m.native.Contact.noIdentitiesFound)}
          listItemSwipeComponent={ListItemSwipe}
          swipePosition='right'
          swipeLeftOpenValue={0}
          swipeRightOpenValue={-70}
          noTabBar
          noSearchBar={!searchBarVisible}
          {...customProps}
          {...this.props}
          dataFetchInProgress={!selectedUpdateInProgress && dataFetchInProgress}
          isRefreshing={!selectedUpdateInProgress && isRefreshing}
        />
      </View>
    )
  }
}

const mapStateToProps = state => ({
  data: state.identity.data,
  dataOrder: state.identity.dataOrder,
  dataTotalCount: state.identity.dataTotalCount,

  searchQuery: state.identity.searchQuery,
  searchResultsData: state.identity.searchResultsData,
  searchResultsDataOrder: state.identity.searchResultsDataOrder,
  searchResultsDataTotalCount: state.identity.searchResultsDataTotalCount,

  dataFetchInProgress: state.identity.dataRequestInProgress,
  dataFetchSuccessful: state.identity.dataRequestSuccessful,
  dataFetchError: state.identity.dataRequestError,

  oldSyncInProgress: state.identity.oldSyncInProgress,
  isRefreshing: state.identity.isRefreshing,
  isPaginating: state.identity.isPaginating,
  isSearching: state.identity.isSearching,

  totalIdentities: path(['user', 'data', 'total_identities'], state) || 0,
  mailboxFilterIdentityIds: state.mailbox.filterIdentityIds,

  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    fetchIdentities: IdentityActions.identityFetch,
    clearSearchResultsData: IdentityActions.identityClearSearchData,
    setSearchQuery: IdentityActions.identitySetSearchQuery
  }, dispatch),
  dispatch
})

const NavAddButton = withNetworkState(({ navigation, networkOnline }) => (
  <TouchableOpacity onPress={() => navigation.navigate('CreateIdentity')} disabled={!networkOnline}>
    <EntypoIcon name='plus' style={[baseStyles.navBarMenuIcon, baseStyles.navBarRightIcon, !networkOnline && baseStyles.navBarMenuIconDisabled]} />
  </TouchableOpacity>
))

const navigationOptions = ({ navigation, screenProps: { fm } }) => {
  const selectionMode = path(['state', 'params', 'selectionMode'], navigation)
  const onSubmit = path(['state', 'params', 'onSubmit'], navigation)
  const onCancel = path(['state', 'params', 'onCancel'], navigation)
  const selectedIdentities = path(['state', 'params', 'selectedIdentities'], navigation) || []
  if (selectionMode) {
    return {
      headerRight: <HeaderButton
        onPress={() => {
          navigation.goBack()
          onSubmit(selectedIdentities)
        }}
        title={fm(m.app.Common.done)}
      />,
      headerLeft: (
        <HeaderButton
          onPress={() => {
            navigation.goBack()
            onCancel && onCancel()
          }}
          title={fm(m.app.Common.cancel)}
        />
      ),
      title: fm(m.app.Common.countSelected, { countSelected: selectedIdentities.length })
    }
  }
  const headerLeftProps = path(['state', 'params', 'headerLeftProps'], navigation)
  const onSearchPress = path(['state', 'params', 'onSearchPress'], navigation)
  const toggleSyncStats = path(['state', 'params', 'toggleSyncStats'], navigation)
  const oldSyncInProgress = path(['state', 'params', 'oldSyncInProgress'], navigation)

  const options = {
    tabBarVisible: false,
    headerLeft: <HeaderButton isBack onPress={() => navigation.goBack(null)} />,
    headerRight: (
      <NavButtonsWithSearch onSearchPress={onSearchPress}>
        <NavAddButton navigation={navigation} />
      </NavButtonsWithSearch>
    )
  }

  options.headerTitle = (
    <HeaderTitleWithFilterAndSync
      title={fm(m.native.Contact.identities)}
      onSyncIconPress={oldSyncInProgress ? toggleSyncStats : null} />
  )

  if (!headerLeftProps) { return options }

  return {
    ...options,
    headerLeft: <HeaderButton {...headerLeftProps} onPress={() => navigation.goBack()} />
  }
}

const enhance = compose(
  setStatic('navigationOptions', navigationOptions),
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
  withStateHandlers(
    { searchBarVisible: false, showSyncStats: false },
    {
      toggleSearchBar: ({ searchBarVisible }) => () => ({ searchBarVisible: !searchBarVisible }),
      toggleSyncStats: ({ showSyncStats }) => () => ({ showSyncStats: !showSyncStats })
    }
  )
)

export default enhance(Identity)
