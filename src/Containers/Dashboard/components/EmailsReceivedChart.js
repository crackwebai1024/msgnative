import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View } from 'react-native'
import Chart from 'react-native-chart'
import EStyleSheet from 'react-native-extended-stylesheet'

import Text from 'app/Components/BaseText'
import { breakpoints, scales } from 'app/Styles/responsive'

import styles from '../styles'

const chartStyles = EStyleSheet.create({
  chart: {
    width: '18rem',
    height: '9rem',
    marginTop: 25,
    paddingTop: 5
  },

  ...scales,

  [breakpoints.min768]: {
    $scale: 2.4
  }
})

class EmailsReceivedChart extends Component {
  render () {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EMAILS RECEIVED IN LAST 7 DAYS</Text>
        <Chart
          style={chartStyles.chart}
          data={this.props.data}
          showGrid={false}
          verticalGridStep={4}
          type='line'
          lineWidth={1}
          color='#bdc3c7'
          dataPointFillColor='#bdc3c7'
          dataPointRadius={0}
          axisColor='#bdc3c7'
          axisLabelColor='#2980b9'
          showDataPoint
        />
      </View>
    )
  }
}

EmailsReceivedChart.propTypes = {
  data: PropTypes.array.isRequired
}

export default EmailsReceivedChart
