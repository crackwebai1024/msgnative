import React, { Component } from 'react'
import { View, ActivityIndicator, Image, StyleSheet, Text } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import baseStyles from './_Base/styles'

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoImage: {
    height: 52,
    width: 275,
    resizeMode: 'contain'
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spinner: {
    marginTop: 83
  },
  offline: {
    color: 'white'
  }
})

const GRADIENT_COLORS = ['#000', `#3d6098`, '#000']

class Launch extends Component {
  static propTypes = {
    isNetworkOnline: PropTypes.bool
  }
  render () {
    return (
      <View style={styles.container}>
        <LinearGradient colors={GRADIENT_COLORS} style={baseStyles.backgroundOverlay} />
        <View style={[styles.content, baseStyles.content]}>
          <Image
            source={require('app/Images/logo.png')}
            style={styles.logoImage}
          />
          {this.props.isNetworkOnline ? <ActivityIndicator
            animating
            color='white'
            style={styles.spinner}
          /> : <Text style={styles.offline}>Offline Mode</Text>}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => ({ isNetworkOnline: state.app.isNetworkOnline })

export default connect(mapStateToProps)(Launch)
