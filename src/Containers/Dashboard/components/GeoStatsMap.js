import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import EStylesheet from 'react-native-extended-stylesheet'
import { scaleLinear } from 'd3-scale'
import MapView from 'react-native-maps'

import Text from 'app/Components/BaseText'
import { getLatLngCenter } from 'commons/Lib/Map'

const DEFAULT_LATITUDE = 37.78825
const DEFAULT_LONGITUDE = -122.4324
const DEFAULT_LATITUDE_DELTA = 100
const DEFAULT_LONGITUDE_DELTA = 100

const styles = EStylesheet.create({
  mapSectionTitleContainer: {
    backgroundColor: '#B4E0F4',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    borderTopWidth: 1,
    borderColor: '#e9e9e9'
  },

  mapSectionTitle: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#76b1cc',
    fontWeight: '700',
    letterSpacing: '0.05rem',
    fontStyle: 'italic'
  },

  mapContainer: {
    position: 'relative',
    height: '40%'
  },

  map: StyleSheet.absoluteFillObject
})

export default class GeoStatsMap extends Component {
  static propTypes = {
    data: PropTypes.object
  }
  constructor (props) {
    super(props)

    let latitude = DEFAULT_LATITUDE

    let longitude = DEFAULT_LONGITUDE

    if (props.data) {
      const center = getLatLngCenter(props.data.map(m => [m.latitude, m.longitude]))
      latitude = center[0]
      longitude = center[1]
    }

    this.state = {
      region: new MapView.AnimatedRegion({
        latitude,
        longitude,
        latitudeDelta: DEFAULT_LATITUDE_DELTA,
        longitudeDelta: DEFAULT_LONGITUDE_DELTA
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data && nextProps.data.length && this.props.data !== nextProps.data) {
      const center = getLatLngCenter(nextProps.data.map(m => [m.latitude, m.longitude]))

      this.state.region.setValue({
        latitude: center[0],
        longitude: center[1],
        latitudeDelta: DEFAULT_LATITUDE_DELTA,
        longitudeDelta: DEFAULT_LONGITUDE_DELTA
      })
    }
  }

  render () {
    const data = this.props.data || []

    if (!data) return null

    const markers = data.map((m, i) => (
      <MapView.Marker
        key={i}
        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
        title={m.city}
        description={`${m.region}, ${m.country_code} – ${m.hits} ${m.hits > 1 ? 'Emails' : 'Email'}`}
        pinColor='rgba(52, 73, 94, 0.9)'
      />
    ))

    const RADIUS_MIN = 180000
    const RADIUS_MAX = 450000

    const hits = data.map(m => m.hits)
    const hitsMin = Math.min.apply(null, hits)
    const hitsMax = Math.max.apply(null, hits)

    const scale = scaleLinear()
      .domain([hitsMin, hitsMax])
      .range([RADIUS_MIN, RADIUS_MAX])

    const circles = data.map((m, i) => (
      <MapView.Circle
        radius={scale(m.hits)}
        key={i}
        fillColor='rgba(52, 73, 94, 0.4)'
        strokeWidth={0}
        strokeColor='transparent'
        center={{ latitude: m.latitude, longitude: m.longitude }}
      />
    ))

    return (
      <View>
        <View style={styles.mapContainer}>
          <MapView.Animated
            style={styles.map}
            region={this.state.region}
          >
            {markers}
            {circles}
          </MapView.Animated>
        </View>
        <View style={styles.mapSectionTitleContainer}>
          <Text style={styles.mapSectionTitle}>
            Map Of Emails Received In Last Month
          </Text>
        </View>
      </View>
    )
  }
}
