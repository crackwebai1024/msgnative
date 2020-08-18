import React, { PureComponent } from 'react'
import {
  Animated,
  Easing,
  Text,
  ViewPropTypes
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

export default class Spinner extends PureComponent {
  static propTypes = {
    containerStyle: ViewPropTypes.style,
    iconStyle: Text.propTypes.style
  }

  constructor () {
    super()
    this.spinValue = new Animated.Value(0)
    this.spin = this.spin.bind(this)
  }

  componentDidMount () {
    this.spin()
  }

  spin () {
    this.spinValue.setValue(0)
    Animated.timing(
      this.spinValue,
      {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start(() => this.spin())
  }

  render () {
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })

    return (
      <Animated.View style={[this.props.containerStyle, { transform: [{ rotate: spin }] }]}>
        <Icon name='circle-o-notch' style={this.props.iconStyle} />
      </Animated.View>
    )
  }
}
