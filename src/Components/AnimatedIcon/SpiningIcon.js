import React, { Component } from 'react'
import { Animated, Easing } from 'react-native'
import PropTypes from 'prop-types'

class SpiningIcon extends Component {
  static propTypes = {
    size: PropTypes.number,
    containerStyle: PropTypes.any,
    iconStyle: PropTypes.any,
    iconName: PropTypes.string.isRequired,
    IconComponent: PropTypes.func.isRequired
  }

  static defaultProps = {
    size: 10
  }

  spinValue = new Animated.Value(0);

  state = {
    spinning: false
  };

  spin = () => {
    this.spinValue.setValue(0)

    if (this.state.spinning === false) {
      this.setState({ spinning: true })
      this.animation()
    } else {
      this.setState({ spinning: false })
    }
  };

  animation = () => {
    this.spinValue.setValue(0)

    Animated.timing(this.spinValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear
    }).start(() => {
      if (this.state.spinning) {
        this.animation()
      }
    })
  };

  componentDidMount () {
    this.spin()
  }

  render () {
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })

    const { IconComponent, iconName, size, containerStyle, iconStyle } = this.props

    const wrapperStyle = {
      transform: [{ rotate: spin }],
      position: 'relative',
      height: size,
      width: size
    }

    return (
      <Animated.View
        style={[wrapperStyle, containerStyle]}>
        <IconComponent
          name={iconName}
          size={size}
          style={iconStyle}
          containerStyle={{ position: 'absolute', top: 0, left: 0 }}
        />
      </Animated.View>
    )
  }
}

export default SpiningIcon
