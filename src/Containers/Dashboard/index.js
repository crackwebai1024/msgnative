import React, { Component } from 'react'
import { View, ScrollView } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import DashboardActions from 'commons/Redux/DashboardRedux'
import AppActions from 'commons/Redux/AppRedux'

import styles from './styles'
import Header from './components/Header'
import Metrics from './components/Metrics'
import GeoStatsMap from './components/GeoStatsMap'
import MailboxActions from 'commons/Redux/MailboxRedux'
import IdentityActions from 'commons/Redux/IdentityRedux'

import BaseList from './components/BaseList'
import ContactListItem from 'app/Components/ContactListItem'
import MailboxListItem from 'app/Containers/Mailbox/List/components/ListItem'
import Text from 'app/Components/BaseText'

class Dashboard extends Component {
  constructor (props) {
    super(props)

    this._goToMailbox = () => props.navigation.navigate('Mailbox')
    this._goToIdentityList = () => props.navigation.navigate('Identity')

    this._handleMailListItemPress = this._handleMailListItemPress.bind(this)
    this._handleIdentityListItemPress = this._handleIdentityListItemPress.bind(this)
  }

  _handleMailListItemPress (data) {
    this.props.navigation.navigate('MailboxDetail', {
      id: data.id
    })
  }

  _handleIdentityListItemPress (data) {
    this.props.navigation.navigate('IdentityDetail', {
      id: data.id
    })
  }

  componentWillMount () {
    // Fetch dashboard data (map and metrics) on every mount
    this.props.requestDashboardData()

    if (!this.props.identityData && !this.props.identityDataRequestInProgress) {
      this.props.identityRequest()
    }

    if (!this.props.mailboxData) {
      this.props.mailboxRequest()
    }
  }

  componentDidMount () {
    // setTimeout(() => this.props.applyLocale('hi-IN'), 5000)
  }

  render () {
    const {
      metrics,
      mailboxData, mailboxDataOrder, mailboxDataRequestInProgress, mailboxDataRequestError,
      identityData, identityDataOrder, identityDataRequestInProgress, identityDataRequestError,
      geoStats
    } = this.props
    const fm = this.props.intl.formatMessage

    const displayIntro = (metrics && metrics.num_identity === 0)
    const displayMap = (metrics && metrics.num_identity > 0 && geoStats && geoStats.length > 0)

    return (
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.main}>
          <Header />

          <Metrics statTotals={metrics} navigate={this.props.navigation.navigate} />

          { displayMap && <GeoStatsMap data={geoStats} /> }

          <BaseList
            title={fm(m.native.Dashboard.lastFiveEmails).toUpperCase()}
            actionText={fm(m.native.Dashboard.viewAll).toUpperCase()}
            noItemsMessage={fm(m.native.Dashboard.noEmailsFound)}
            itemCount={5}
            listItemComponent={MailboxListItem}
            data={mailboxData}
            dataOrder={mailboxDataOrder}
            inProgress={mailboxDataRequestInProgress}
            error={mailboxDataRequestError}
            onActionPress={this._goToMailbox}
            onItemPress={this._handleMailListItemPress}
          />

          <BaseList
            title={fm(m.native.Dashboard.latestActiveIdentities).toUpperCase()}
            actionText={fm(m.native.Dashboard.viewAll).toUpperCase()}
            noItemsMessage={fm(m.native.Dashboard.noIdentitiesFound)}
            itemCount={5}
            listItemComponent={ContactListItem}
            data={identityData}
            dataOrder={identityDataOrder}
            inProgress={identityDataRequestInProgress}
            error={identityDataRequestError}
            onActionPress={this._goToIdentityList}
            onItemPress={this._handleIdentityListItemPress}
          />

        </ScrollView>

        {/* <MainTabBar navigate={this.props.navigation.navigate} active="dashboard" /> */}
      </View>
    )
  }
}

const IntlDashboard = injectIntl(Dashboard)

IntlDashboard.navigationOptions = {
  header: null,
  tabBarVisible: true,
  tabBarIcon: ({ tintColor }) => <FontAwesomeIcon name='home' style={{ color: tintColor }} />
}

const mapStateToProps = state => ({
  metrics: path(['user', 'data', 'totals'], state) || {},
  geoStats: state.dashboard.geoStats,

  identityData: state.identity.data,
  identityDataOrder: state.identity.dataOrder,
  identityDataRequestInProgress: state.identity.dataRequestInProgress,
  identityDataRequestError: state.identity.dataRequestError,

  mailboxData: state.mailbox.data,
  mailboxDataOrder: state.mailbox.dataOrder,
  mailboxDataRequestInProgress: state.mailbox.dataRequestInProgress,
  mailboxDataRequestError: state.mailbox.dataRequestError
})

const mapDispatchToProps = {
  requestDashboardData: DashboardActions.dashboardDataRequest,
  mailboxRequest: MailboxActions.mailboxFetch,
  identityRequest: IdentityActions.identityFetch,
  applyLocale: AppActions.applyLocale
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlDashboard)
