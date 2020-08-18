import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import * as R from 'ramda'
import { bindActionCreators } from 'redux'
import RNContacts from 'react-native-contacts'
import { withStateHandlers, compose, setStatic } from 'recompose'
import OpenSettings from 'react-native-open-settings'

import m from 'commons/I18n'
import ContactActions from 'commons/Redux/ContactRedux'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'

import DeviceContactActions from 'app/Redux/DeviceContactRedux'
import Text from 'app/Components/BaseText'
import { getCurrentRouteName } from 'app/Navigation/utils'
import HeaderButton from 'app/Components/HeaderButton'
import SlimHeader from 'app/Components/SlimHeader'
import baseStyles from 'app/Components/ListView/styles'
import ListViewError from 'app/Components/ListView/components/ListViewError'
import SectionListContainer from 'app/Components/SectionList'
import NavButtonsWithSearch from 'app/Components/ListView/NavButtonsWithSearch'
import HeaderTitleWithFilterAndSync from 'app/Components/HeaderTitleWithFilterAndSync/HeaderTitleWithFilterAndSync'
import SyncProgress from 'app/Components/SyncProgress'

import ContactListItemSwipe from './components/ListItemSwipe'
import ContactListItem from './components/ListItem'
import AlphabetPicker from './components/AlphabetPicker'

import layoutStyles from 'app/Styles/layout'
import styles from './styles'

class Contacts extends Component {
  static defaultProps = {
    searchBarVisible: false
  }

  constructor (props) {
    super(props)

    this._askForContactsImport = this._askForContactsImport.bind(this)
    this._goToCreateView = this._goToCreateView.bind(this)
    this._handleOnUnmount = this._handleOnUnmount.bind(this)
    this._renderNoItemError = this._renderNoItemError.bind(this)
    this._renderTabs = this._renderTabs.bind(this)

    this.nSectionListRef = null
    this.funcProps = {
      groupByFunc: R.pipe(
        one => {
          const displayName = one.display_name || one.email

          return displayName.toUpperCase().charAt(0)
        },
        char => /^[A-Z]$/.test(char) ? char : '#'
      ),
      sectionKeySortFunc: (a, b) => {
        if (a === b) return 0
        else if (a === '#') return 1
        else if (b === '#') return -1
        else return a < b ? -1 : 1
      }
    }
    this.swipeProps = {
      swipeComponent: ContactListItemSwipe,
      swipePosition: 'right',
      swipeLeftOpenValue: 0,
      swipeRightOpenValue: -70,
      closeOnRowPress: true
    }
    this.keyExtractor = data => data.email || data.id
  }

  _askForContactsImport (nextProps) {
    if (
      nextProps.contactsPermissionAlert ||
      nextProps.currentRouteName !== 'ContactList' ||
      nextProps.contactsImported ||
      nextProps.contactsPermission !== RNContacts.PERMISSION_UNDEFINED ||
      nextProps.overlay.open // overlay is not opened
    ) {
      return
    }
    this.props.contactsImportRequest()
  }

  _goToCreateView () {
    let data = {}

    // If the contact list view has identityId, pass that to create contact
    // screen so that the identity can be pre-selected
    const identityId = R.path(['navigation', 'state', 'params', 'identityId'], this.props)
    if (identityId) {
      data['prefillItemData'] = { identity_id: identityId }
    }

    this.props.navigation.navigate('EditContact', data)
  }

  _goToContactDetails (contact) {
    const isDeviceContact = this._showDeviceContactsOnly()
    const navigateParam = {
      routeName: isDeviceContact ? 'DeviceContactDetail' : 'ContactDetail',
      params: isDeviceContact ? { id: contact.id } : { id: contact.email }
    }

    this.props.navigation.navigate(navigateParam)
  }

  _renderNoItemError () {
    const fm = this.props.intl.formatMessage
    const showDeviceContactsOnly = this._showDeviceContactsOnly()

    if (!showDeviceContactsOnly) {
      return (
        <ListViewError>
          <Text style={baseStyles.errorText}>{fm(m.native.Contact.noContacts)}</Text>
          <TouchableOpacity style={baseStyles.errorAction} onPress={this._goToCreateView}>
            <Text style={[baseStyles.errorText, baseStyles.errorActionText]}>{fm(m.app.Common.clickHereToCreate)}</Text>
          </TouchableOpacity>
        </ListViewError>
      )
    }

    if (this.props.contactsPermission === 'authorized') {
      return (
        <ListViewError>
          <Text style={baseStyles.errorText}>{fm(m.native.Contact.noDeviceContactsFound)}</Text>
        </ListViewError>
      )
    }

    return (
      <ListViewError>
        <Text style={baseStyles.errorTextTitle}>{fm(m.native.Contact.importYourContacts)}</Text>
        <Text style={baseStyles.errorText}>{fm(m.native.Contact.integrateYourExistingContacts)}</Text>
        <TouchableOpacity style={baseStyles.errorAction} onPress={() => OpenSettings.openSettings()}>
          <Text style={[baseStyles.errorText, baseStyles.errorActionText]}>{fm(m.native.Contact.updateContactPermission)}</Text>
        </TouchableOpacity>
      </ListViewError>
    )
  }

  _renderHeader () {
    const { identity_display_name, identity_email } = this.props // eslint-disable-line

    if (!identity_display_name) return  // eslint-disable-line

    const subtitle = identity_display_name !== identity_email ? identity_email : null // eslint-disable-line

    return <SlimHeader title={identity_display_name} subtitle={subtitle} /> // eslint-disable-line
  }

  _forceSearch () {
    return !!this.props.identity_id
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

  _renderTabs () {
    const hideDeviceContacts = R.path(['navigation', 'state', 'params', 'hideDeviceContacts'], this.props)
    const fm = this.props.intl.formatMessage
    if (this.props.contactSearchFiltersPresent || hideDeviceContacts) return null

    const showDeviceContactsOnly = this._showDeviceContactsOnly()

    return (
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, !showDeviceContactsOnly && styles.tabActive]} onPress={() => this.props.navigation.setParams({ device: false })}>
          <Text style={styles.tabText}>MSGSAFE.IO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, showDeviceContactsOnly && styles.tabActive]} onPress={() => this.props.navigation.setParams({ device: true })}>
          <Text style={styles.tabText}>{fm(m.native.Contact.device).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _showDeviceContactsOnly (props = this.props) {
    return !!R.path(['navigation', 'state', 'params', 'device'], props)
  }

  _onAlphabetPress = (letter) => {
    if (this.nSectionListRef) {
      this.nSectionListRef.getWrappedInstance()._scrollToSection(letter, false)
    }
  }

  _renderAtoZPicker () {
    const { searchBarVisible, dataOrder } = this.props

    if (!dataOrder || !dataOrder.length || searchBarVisible) {
      return null
    }

    return (
      <View style={styles.alphabetsListContainer}>
        <AlphabetPicker onTouchLetter={this._onAlphabetPress} />
      </View>
    )
  }

  _updateSyncInProgress (nextProps) {
    const props = nextProps || this.props
    const { navigation, oldSyncInProgress, searchQuery, searchFilters, contactSearchFiltersPresent } = props
    const navParams = R.path(['state', 'params'], navigation)
    const shouldShowSyncIcon = (
      oldSyncInProgress && !searchQuery && R.isEmpty(searchFilters) &&
      !contactSearchFiltersPresent && !navParams.selectItemAndPop
    )
    const navOldSyncInProgress = R.path(['state', 'params', 'oldSyncInProgress'], this.props.navigation)
    if (!R.equals(navOldSyncInProgress, shouldShowSyncIcon)) {
      navigation.setParams({ oldSyncInProgress: shouldShowSyncIcon })
    }

    if (!shouldShowSyncIcon && props.showSyncStats) {
      this.props.toggleSyncStats()
    }
  }

  _updateSearchBarVisibility (nextProps) {
    const shouldToggleSearchBar = (
      (!nextProps.searchQuery && nextProps.searchBarVisible) ||
      (nextProps.searchQuery && !nextProps.searchBarVisible)
    )

    const shouldNotToggle = (!nextProps.searchQuery && nextProps.searchBarVisible)
    if (shouldToggleSearchBar && !shouldNotToggle) {
      this.props.toggleSearchBar()
    }

    if (this.props.searchQuery && !nextProps.searchQuery) {
      this.props.clearSearchResultsData()
    }
  }

  componentWillReceiveProps (nextProps) {
    this._askForContactsImport(nextProps)
    this._updateSyncInProgress(nextProps)
    this._updateSearchBarVisibility(nextProps)
    const shouldFetchDeviceContact =
      !this._showDeviceContactsOnly(this.props) &&
      this._showDeviceContactsOnly(nextProps) &&
      !nextProps.data

    // if (nextProps.contactPermission !== 'authorized') {
    //   return
    // }

    // fetch device contacts when the tab is changed and current tab is device contacts and there are no contacts available.
    // (work around specifically fot android)
    if (shouldFetchDeviceContact && !nextProps.data && !nextProps.dataFetchInProgress) {
      console.log('Contacts/List/index : Device Contacts tab – fetching device contacts')
      nextProps.fetchContacts()
    }

    if (this.props.currentRouteName === 'ContactList' && nextProps.currentRouteName !== 'ContactList') {
      this.props.navigation.setParams({
        title: null,
        hideDeviceContacts: false,
        tabBarVisible: true,
        hideAddContact: null,
        headerLeftProps: null,
        onSearchPress: this.props.toggleSearchBar.bind(this),
        toggleSyncStats: this.props.toggleSyncStats.bind(this),
        oldSyncInProgress: this.props.oldSyncInProgress,
        device: false
      })
      this._handleOnUnmount()
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

  render () {
    const { identity_display_name, intl, searchBarVisible, showSyncStats, totalContacts } = this.props // eslint-disable-line
    const fm = intl.formatMessage
    let noSearchResultMessage = fm(m.native.Contact.noContacts)

    if (identity_display_name) { // eslint-disable-line
      noSearchResultMessage = fm(m.native.Contact.noContactsForIdentity, { name: identity_display_name })
    }

    // this contacts list screen is used in several places to select a contact. so in those cases, a custom list item is passed via navigation props.
    // `listItemComponentFromNavigationProps` is the value of `listItemComponent` from navigation prop
    const listItemComponentFromNavigationProps = R.path(['navigation', 'state', 'params', 'listItemComponent'], this.props)
    const listItemComponent = listItemComponentFromNavigationProps || ContactListItem
    const tabBarVisible = R.pathOr(true, ['navigation', 'state', 'params', 'tabBarVisible'], this.props)
    const forceSection = R.path(['navigation', 'state', 'params', 'forceSection'], this.props)
    // extract value of `disableSwipe` from navigation prop
    const disableSwipe = R.path(['navigation', 'state', 'params', 'disableSwipe'], this.props)

    return (
      <View style={layoutStyles.flex}>
        {showSyncStats &&
          <SyncProgress table='contacts_cache' total={totalContacts} />
        }
        {this._renderTabs()}
        <SectionListContainer
          swipeProps={(this._showDeviceContactsOnly() || disableSwipe) ? null : this.swipeProps}
          listItemComponent={listItemComponent}
          selectItem={this._goToContactDetails.bind(this)}
          navigatorActiveKey='contacts'
          initialSearchQuery={this.props.searchQuery}
          fetchData={this.props.fetchContacts}
          forceSearch={this._forceSearch()}
          forceSection={forceSection}
          noDataMessage={this._renderNoItemError()}
          noSearchResultMessage={noSearchResultMessage}
          header={this._renderHeader()}
          noTabBar={!tabBarVisible}
          noSearchBar={!searchBarVisible}
          ref={ref => { this.nSectionListRef = ref }}
          keyExtractor={this.keyExtractor}
          {...this.props}
          {...this.funcProps}
        />
        {this._renderAtoZPicker()}
      </View>
    )
  }
}

Contacts.propTypes = {
  contactsImportRequest: PropTypes.func,
  navigation: PropTypes.object,
  intl: PropTypes.object,
  contactsPermission: PropTypes.string,
  contactSearchFiltersPresent: PropTypes.bool,
  identity_id: PropTypes.string,
  searchBarVisible: PropTypes.bool,
  dataOrder: PropTypes.array,
  data: PropTypes.object,
  dataFetchInProgress: PropTypes.bool,
  fetchContacts: PropTypes.func,
  toggleSearchBar: PropTypes.func,
  toggleSyncStats: PropTypes.func,
  searchQuery: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  const key = R.path(['navigation', 'state', 'params', 'device'], ownProps) ? 'deviceContact' : 'contact'

  return {
    data: state[key].data,
    dataOrder: state[key].dataOrder,
    dataTotalCount: state[key].dataTotalCount,

    searchQuery: state[key].searchQuery,
    searchFilters: state[key].searchFilters || {},
    searchResultsData: state[key].searchResultsData,
    searchResultsDataOrder: state[key].searchResultsDataOrder,
    searchResultsDataTotalCount: state[key].searchResultsDataTotalCount,

    dataFetchInProgress: state[key].dataRequestInProgress,
    dataFetchSuccessful: state[key].dataRequestSuccessful,
    dataFetchError: state[key].dataRequestError,

    oldSyncInProgress: state[key].oldSyncInProgress || false,
    isRefreshing: state[key].isRefreshing,
    isPaginating: state[key].isPaginating,
    isSearching: state[key].isSearching,

    contactSearchFiltersPresent: (
      // A search filter is set
      // (!R.isEmpty(state.contact.searchFilters) && !R.isNil(state.contact.searchFilters)) ||
      // Or an identity filter is set
      (!R.isEmpty(state.contact.filterIdentityIds) && !R.isNil(state.contact.filterIdentityIds))
    ),

    totalContacts: R.path(['user', 'data', 'sum_contact'], state) || 0,

    contactsImported: state.deviceContact.imported,
    contactsPermission: state.deviceContact.permission,
    contactsPermissionAlert: state.deviceContact.alert,
    currentRouteName: getCurrentRouteName(state.nav),
    overlay: state.overlay
  }
}

const mapDispatchToProps = (dispatch, { navigation }) => {
  const deviceContact = R.path(['state', 'params', 'device'], navigation)

  const fetchContacts = deviceContact ? DeviceContactActions.deviceContactFetch : ContactActions.contactFetch
  const clearSearchResultsData = deviceContact ? DeviceContactActions.deviceContactClearSearchData : ContactActions.contactClearSearchData
  const setSearchQuery = deviceContact ? DeviceContactActions.deviceContactSetSearchQuery : ContactActions.contactSetSearchQuery

  return bindActionCreators({
    fetchContacts,
    clearSearchResultsData,
    setSearchQuery,
    contactsImportRequest: DeviceContactActions.contactsImportRequest
  }, dispatch)
}

const NavAddButton = withNetworkState(({ navigation, createScreenIdentifier, disabled, networkOnline }) => (
  <TouchableOpacity onPress={() => navigation.navigate(createScreenIdentifier)} disabled={disabled || !networkOnline}>
    <EntypoIcon name='plus' style={[baseStyles.navBarMenuIcon, baseStyles.navBarRightIcon, (disabled || !networkOnline) && baseStyles.navBarMenuIconDisabled]} />
  </TouchableOpacity>
))

const navigationOptions = ({ navigation, screenProps: { fm } }) => {
  const { state } = navigation
  const createScreenIdentifier = R.path(['params', 'createScreenIdentifier'], state) || 'EditContact'
  const headerLeftProps = R.path(['params', 'headerLeftProps'], state)
  const onSearchPress = R.path(['params', 'onSearchPress'], state)
  const deviceContactsTabActive = !!R.path(['state', 'params', 'device'], navigation)
  const hideAddContact = !!R.path(['state', 'params', 'hideAddContact'], navigation)

  const toggleSyncStats = R.path(['state', 'params', 'toggleSyncStats'], navigation)
  const oldSyncInProgress = R.path(['state', 'params', 'oldSyncInProgress'], navigation)

  const options = {
    tabBarVisible: R.path(['params', 'tabBarVisible'], state),
    headerRight: (
      <NavButtonsWithSearch onSearchPress={onSearchPress}>
        {!hideAddContact &&
          <NavAddButton
            navigation={navigation}
            createScreenIdentifier={createScreenIdentifier}
            disabled={deviceContactsTabActive}
          />
        }
      </NavButtonsWithSearch>
    )
  }

  options.headerTitle = (
    <HeaderTitleWithFilterAndSync
      title={R.path(['params', 'title'], state) || fm(m.native.Contact.contacts)}
      onSyncIconPress={oldSyncInProgress ? toggleSyncStats : null} />
  )

  if (!headerLeftProps) { return options }

  return {
    ...options,
    headerLeft: <HeaderButton {...headerLeftProps} onPress={() => navigation.goBack(null)} />
  }
}

const enhance = compose(
  setStatic('navigationOptions', navigationOptions),
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
  withStateHandlers(
    {
      searchBarVisible: false,
      showSyncStats: false
    },
    {
      toggleSearchBar: ({ searchBarVisible }) => () => ({ searchBarVisible: !searchBarVisible }),
      toggleSyncStats: ({ showSyncStats }) => () => ({ showSyncStats: !showSyncStats })
    }
  )
)

export default enhance(Contacts)
