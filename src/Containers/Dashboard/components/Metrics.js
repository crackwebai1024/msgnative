import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import EStylesheet from 'react-native-extended-stylesheet'

import MailboxActions from 'commons/Redux/MailboxRedux'

import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const metricStyles = EStylesheet.create({
  // Metrics
  metricsSection: {
    marginTop: '0.2rem',
    alignSelf: 'stretch'
  },
  metricsContainer: {
    flexDirection: 'row'
  },
  metric: {
    flexGrow: 1,
    flexBasis: 0,
    paddingTop: '1.4rem',
    paddingBottom: '1.4rem',
    backgroundColor: palette.greenSea,
    opacity: 0.9
  },
  metricCount: {
    color: palette.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '1.4rem'
  },
  metricDescription: {
    marginTop: '0.1rem',
    color: palette.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.72rem'
  },
  metric1: {
    backgroundColor: palette.belizeHole
  },
  metric2: {
    backgroundColor: palette.peterRiver
  },
  metric3: {
    backgroundColor: palette.skyBlue
  }
})

class Metrics extends Component {
  static propTypes = {
    statTotals: PropTypes.object,
    navigate: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.getMetricData = this.getMetricData.bind(this)
    this.navigateToReceivedEmails = this.navigateToReceivedEmails.bind(this)
    this.navigateToSentEmails = this.navigateToSentEmails.bind(this)
  }

  navigateToReceivedEmails () {
    const { clearMailboxFilter, navigate } = this.props
    clearMailboxFilter()
    navigate('Mailbox')
  }

  navigateToSentEmails () {
    const { setMailboxFilter, navigate } = this.props
    setMailboxFilter('sent')
    navigate('Mailbox')
  }

  getMetricData () {
    const { statTotals, navigate } = this.props
    return [
      {
        count: statTotals.num_mail_received,
        description: 'Emails Received',
        onPress: this.navigateToReceivedEmails,
        style: metricStyles.metric1
      },
      {
        count: statTotals.num_mail_sent,
        description: 'Emails Sent',
        onPress: this.navigateToSentEmails,
        style: metricStyles.metric2
      },
      {
        count: statTotals.num_identity,
        description: 'Mailboxes',
        onPress: () => navigate('Identity'),
        style: metricStyles.metric3
      }
    ]
  }

  renderMetric ({ count, description, onPress, style }, index) {
    return (
      <TouchableOpacity
        key={index}
        style={[metricStyles.metric, style]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Text style={metricStyles.metricCount}>{count || '...'}</Text>
        <Text style={metricStyles.metricDescription}>{description}</Text>
      </TouchableOpacity>
    )
  }

  render () {
    const { statTotals } = this.props
    if (statTotals && statTotals['num_identity'] === 0) return null

    return (
      <View style={metricStyles.metricsSection}>
        <View style={metricStyles.metricsContainer}>
          {this.getMetricData().map(this.renderMetric)}
        </View>
      </View>
    )
  }
}

const mapDispatchToProps = {
  setMailboxFilter: MailboxActions.setMailboxFilter,
  clearMailboxFilter: MailboxActions.clearMailboxFilter
}

const ConnectedMetrics = connect(null, mapDispatchToProps)(Metrics)

export default ConnectedMetrics
