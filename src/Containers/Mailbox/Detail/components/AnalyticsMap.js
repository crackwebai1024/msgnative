import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, TouchableOpacity } from 'react-native'
import Dimensions from 'Dimensions'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import MapView from 'react-native-maps'

import styles from '../styles'
import { getLatLngCenter } from 'commons/Lib/Map'
import Text from 'app/Components/BaseText'

class AnalyticsMap extends Component {
  static propTypes = {
    defaultOpen: PropTypes.bool,
    withTopBorder: PropTypes.bool,
    intl: PropTypes.object,
    analyticsData: PropTypes.any
  }
  static defaultProps = {
    defaultOpen: false,
    withTopBorder: false
  }

  constructor (props) {
    super(props)

    this._toggleContentVisibility = this._toggleContentVisibility.bind(this)

    this.state = {
      contentVisible: props.defaultOpen
    }
  }

  _toggleContentVisibility () {
    this.setState({
      contentVisible: !this.state.contentVisible
    })
  }

  _renderMap () {
    const { analyticsData } = this.props

    if (!analyticsData || !analyticsData.whois) {
      return null
    }
    const { width, height } = Dimensions.get('window')

    var region = {
      latitude: null,
      longitude: null,
      latitudeDelta: 100,
      longitudeDelta: 100
    }

    let markerCoordinates = []

    for (var i = 0; i < analyticsData.whois.length; i++) {
      let rec = analyticsData.whois[i]
      if (!rec.id || !rec.longitude || !rec.latitude) {
        continue
      }
      let title = ''; let subtitle = ''; let foundOriginSMTPServer = false

      switch (rec.event_order_type) {
        case 1:
          title = 'Origin - Sender'
          break
        case 3:
          if (foundOriginSMTPServer) break
          title = 'Origin - SMTP Server'
          break
        case 100:
        case 101:
          title = 'MsgSafe Received'
          break
        case 103:
          title = 'MsgSafe Released'
          break
      }

      if (title) {
        subtitle = rec.as_org_name
      } else {
        title = rec.as_org_name
      }

      markerCoordinates.push({
        id: rec.id,
        longitude: rec.longitude,
        latitude: rec.latitude,
        title: title || '',
        subtitle: subtitle || ''
      })
    }
    if (markerCoordinates.length === 0) {
      return (
        <MapView
          style={{ height: height / 2.5, width: width, margin: 0 }}
        />
      )
    }
    const center = getLatLngCenter(markerCoordinates.map(m => [m.latitude, m.longitude]))
    if (center) {
      region.latitude = center[0]
      region.longitude = center[1]
    } else {
      region.latitude = markerCoordinates[0].latitude
      region.longitude = markerCoordinates[0].longitude
    }

    const markers = markerCoordinates.map(m => (
      <MapView.Marker
        key={m.id}
        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
        title={m.title}
        description={m.subtitle}
        pinColor='rgba(52, 73, 94, 0.9)'
      />
    ))

    return (
      <MapView
        style={{ height: height / 2.5, width: width, margin: 0 }}
        region={region}
      >
        {markers}
        <MapView.Polyline
          coordinates={markerCoordinates}
          strokeColor='rgba(52, 73, 94, 0.6)'
        />
      </MapView>
    )
  }

  render () {
    const { analyticsData, withTopBorder, intl } = this.props
    const { contentVisible } = this.state
    const fm = intl.formatMessage
    if (!analyticsData || !analyticsData.whois) {
      return null
    }

    return (
      <View style={[styles.sectionMain, withTopBorder && styles.sectionMainWithTopBorder]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionMessage}>
            {fm(m.native.Mailbox.originOrDestinationMap).toUpperCase()}
          </Text>
          <TouchableOpacity onPress={this._toggleContentVisibility}>
            <Text style={[styles.sectionMessage, styles.sectionAction]}>
              { contentVisible ? fm(m.native.Mailbox.hide).toUpperCase() : fm(m.native.Mailbox.show).toUpperCase() }
            </Text>
          </TouchableOpacity>
        </View>

        { contentVisible && this._renderMap() }
      </View>
    )
  }
}

export default injectIntl(AnalyticsMap)
