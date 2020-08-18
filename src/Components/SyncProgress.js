import React from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import { getTotalCacheCountPromise } from 'app/Sagas/LocalDBSagas/Lib/CommonCacheSagas'
import baseStyles from 'app/Components/ListView/styles'

class SyncProgress extends React.Component {
  static propTypes = {
    table: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)
    this.interval = null
    this.state = { cacheCount: 0 }
  }

  _updateCacheCount () {
    const resolve = cacheCount => this.setState({ cacheCount })
    getTotalCacheCountPromise(this.props.table, resolve, 'WHERE is_deleted = ?', [0])
  }

  componentDidMount () {
    this._updateCacheCount()
    this.interval = setInterval(this._updateCacheCount.bind(this), 3000)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  render () {
    const { total } = this.props
    const { cacheCount } = this.state
    const percent = total ? ((cacheCount * 100) / total).toFixed(1) : 0
    return (
      <View style={[baseStyles.syncSectionContainer]}>
        <Text style={[baseStyles.syncSectionText]}>
          syncing {cacheCount}/{total} ({ percent }%)...
        </Text>
      </View>
    )
  }
}

export default SyncProgress
