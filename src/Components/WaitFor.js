import React, { PureComponent } from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { isNil } from 'ramda'

/**
 * A wrapper component that can be used to show a spinner
 * and block user interaction until all of the data is available.
 *
 * Pass a data array containing objects with keys –
 *   value - the value which is to checked, can be any javascript value
 *   request - function that should be called if the value is not available
 *
 * onDataLoad callback can be passed which will be called if all of the
 * required data is available.
 */
export default class WaitFor extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
    onDataLoad: PropTypes.func,
    doRefresh: PropTypes.bool
  }

  static defaultProps = {
    data: [],
    doRefresh: false
  }

  constructor (props) {
    super(props)

    this.state = {
      spinnerVisible: false
    }
  }

  _isAllDataAvailable (props) {
    let allAvailable = true

    for (let item of props.data) {
      if (isNil(item.value)) {
        allAvailable = false
        break
      }
    }

    return allAvailable
  }

  componentWillMount () {
    const { doRefresh } = this.props
    const isAllDataAvailable = this._isAllDataAvailable(this.props)

    if (isAllDataAvailable) {
      typeof this.props.onDataLoad === 'function' && this.props.onDataLoad()
    }

    if (!isAllDataAvailable) {
      this.setState({ spinnerVisible: true })
      !doRefresh && this.props.data.map(item => isNil(item.value) && item.request())
    }

    if (doRefresh) {
      this.props.data.map(item => item.request())
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this._isAllDataAvailable(this.props) && this._isAllDataAvailable(nextProps)) {
      typeof this.props.onDataLoad === 'function' && this.props.onDataLoad()
    }

    this.setState({ spinnerVisible: !this._isAllDataAvailable(nextProps) })
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        {this.props.children}
      </View>
    )
  }
}
