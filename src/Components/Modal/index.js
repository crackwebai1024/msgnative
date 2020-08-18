import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Animated, View, TouchableOpacity, Text } from 'react-native'
import Dimensions from 'Dimensions'

import layoutStyles from 'app/Styles/layout'
import styles from './styles'

export default class Modal extends Component {
  static propTypes = {
    visible: PropTypes.any,
    onDisplay: PropTypes.any,
    onDismiss: PropTypes.any,
    navBarTitle: PropTypes.any,
    leftTitle: PropTypes.any,
    onLeft: PropTypes.any,
    rightTitle: PropTypes.any,
    onRight: PropTypes.any,
    children: PropTypes.any
  }

  constructor (props) {
    super(props)

    const { width } = Dimensions.get('window')

    this._distance = new Animated.Value(width)

    this.display = this.display.bind(this)
    this.dismiss = this.dismiss.bind(this)
  }

  display () {
    const { onDisplay } = this.props
    typeof onDisplay === 'function' && onDisplay()

    Animated.timing(this._distance, { toValue: 0, duration: 300 }).start()
  }

  dismiss () {
    const { onDismiss } = this.props
    typeof onDismiss === 'function' && onDismiss()

    const { width } = Dimensions.get('window')
    Animated.timing(this._distance, { toValue: width, duration: 300 }).start()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.visible !== nextProps.visible) {
      nextProps.visible ? this.display() : this.dismiss()
    }
  }

  _renderNavBar () {
    const { navBarTitle, leftTitle, onLeft, rightTitle, onRight } = this.props

    return (
      <View style={layoutStyles.navBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={onLeft}>
          <View>
            <Text style={layoutStyles.navBarActionText}>{leftTitle}</Text>
          </View>
        </TouchableOpacity>
        <Text style={layoutStyles.navBarTitleText}>{navBarTitle}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onRight || this.dismiss}>
          <View>
            <Text style={layoutStyles.navBarActionText}>{rightTitle}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    return (
      <Animated.View style={[styles.main, { right: this._distance }]}>
        { this._renderNavBar() }
        { this.props.children }
      </Animated.View>
    )
  }
}
