import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import moment from 'moment'

import Text from 'app/Components/BaseText'

const INTERVAL = 1000

class Timer extends PureComponent {
  mixins
  static propTypes = {
    startDate: PropTypes.instanceOf(Date).isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      duration: 0
    }

    this._intervalId = null

    this._startTimer = this._startTimer.bind(this)
    this._stopTimer = this._stopTimer.bind(this)
    this._tick = this._tick.bind(this)
    this._formatDuration = this._formatDuration.bind(this)
  }

  _startTimer () {
    this._tick()
    this._intervalId = setInterval(this._tick, INTERVAL)
  }

  _stopTimer () {
    clearInterval(this._intervalId)
  }

  _tick () {
    const currentTime = new Date()
    const duration = (currentTime.getTime() - this.props.startDate.getTime()) / 1000
    this.setState({ duration })
  }

  _formatDuration () {
    const duration = this.state.duration
    const hour = 60 * 60
    const hours = Math.floor(duration / hour)
    const lessThanHours = duration - hours * hour
    const minutesAndSeconds = moment.utc(lessThanHours * 1000).format('mm:ss')
    const hoursStr = hours ? `${hours}:` : ''
    return `${hoursStr}${minutesAndSeconds}`
  }

  componentWillMount () {
    this._startTimer()
  }

  componentWillUnmount () {
    this._stopTimer()
  }

  render () {
    const { startDate, ...props } = this.props
    if (!this.state.duration) {
      return null
    }
    return (
      <Text {...props} >
        {this._formatDuration()}
      </Text>
    )
  }
}

export default Timer
