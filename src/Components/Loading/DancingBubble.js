import React, { Component } from 'react'
import { View, Animated } from 'react-native'
import ESTylesheet from 'react-native-extended-stylesheet'
import { range } from 'ramda'
import { setStatic, compose } from 'recompose'
import PropTypes from 'prop-types'
import Rainbow from 'rainbowvis.js'
import palette from 'app/Styles/colors'
import { defaultBubbleStyle, bubbleContainerStyle } from './styles'

const Bubble = compose(
  setStatic('propTypes', {
    jumpHeight: PropTypes.number,
    bubbleStyle: PropTypes.object,
    color: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool ])
  }),
  setStatic('defaultProps', {
    jumpHeight: 30,
    color: palette.silver,
    animation: new Animated.Value(0)
  })
)(({ color, jumpHeight, bubbleStyle, animation }) => (
  <Animated.View style={{
    ...defaultBubbleStyle,
    ...bubbleStyle,
    backgroundColor: color || 'transparent',
    transform: [
      { translateY: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -1 * jumpHeight]
      })
      }
    ]
  }} />
))

export default class DancingBubble extends Component {
  static propTypes = {
    // the number of bubbles you want to animate
    bubbleCount: PropTypes.number,

    // the time distance between each bubble
    threshold: PropTypes.number,

    // if the component is currently animating
    animating: PropTypes.bool,

    // the duration of one cycle animation, the time that takes
    // a single bubble to go up and down
    speed: PropTypes.number,

    // the time the bubble waits till it starts to go up
    // and down again
    delay: PropTypes.number,

    // the height of the bubble jump
    jumpHeight: PropTypes.number,

    // additional bubble style. Bubble is a react-native View
    // component. Could be used to make them square instead
    // of circles
    bubbleStyle: PropTypes.object,

    // an array of css hex colors that you want the bubbles to
    // be colored with. Could be just two colors ['#000', '#fff']
    // and bubbles will be colored from black to white no matter
    // how much of them
    spectrum: PropTypes.arrayOf(PropTypes.string)
  }

  static defaultProps = {
    bubbleCount: 4,
    threshold: 150,
    speed: 800,
    delay: 800,
    animating: true
  }

  constructor (props) {
    super(props)

    this._animatedValues = []
    this._rainbow = null

    this._setupAnimatedValues = this._setupAnimatedValues.bind(this)
    this._buildAnimations = this._buildAnimations.bind(this)
    this._setupRainbow = this._setupRainbow.bind(this)
    this._renderBubbles = this._renderBubbles.bind(this)
    this._startAnimation = this._startAnimation.bind(this)
  }

  _setupAnimatedValues (nextProps) {
    const props = nextProps || this.props
    const { bubbleCount } = props
    this._animatedValues = range(0, bubbleCount).map(() => new Animated.Value(0))
  }

  _buildAnimations () {
    const { speed } = this.props
    return this._animatedValues.map((animatedValue) => Animated.sequence([
      Animated.timing(
        animatedValue,
        {
          toValue: 1,
          duration: speed / 2,
          useNativeDriver: true
        }
      ),
      Animated.timing(
        animatedValue,
        {
          toValue: 0,
          duration: speed / 2,
          useNativeDriver: true
        }
      )
    ]))
  }

  _setupRainbow (nextProps) {
    const props = nextProps || this.props
    if (!props.spectrum) {
      this._rainbow = null
      return
    }
    this._rainbow = new Rainbow()
    this._rainbow.setSpectrum(...props.spectrum)
    this._rainbow.setNumberRange(0, props.bubbleCount - 1)
  }

  _renderBubbles () {
    return range(0, this.props.bubbleCount).map((number, index) => (
      <Bubble
        key={number}
        index={index}
        {...this.props}
        animation={this._animatedValues[index]}
        color={this._rainbow ? `#${this._rainbow.colourAt(index)}` : false}
      />
    ))
  }

  _startAnimation (nextProps) {
    const props = nextProps || this.props
    const { animating, delay, speed } = props
    if (!animating) {
      return
    }
    Animated.stagger(
      this.props.threshold,
      this._buildAnimations()
    ).start()
    setTimeout(this._startAnimation, speed + delay)
  }

  componentWillMount () {
    this._setupRainbow()
    this._setupAnimatedValues()
  }

  componentDidMount () {
    if (this.props.animating) {
      this._startAnimation()
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.bubbleCount && nextProps.bubbleCount !== this.props.bubbleCount) {
      this._setupAnimatedValues(nextProps)
    }

    if (nextProps.spectrum && nextProps.spectrum !== this.props.spectrum) {
      this._setupRainbow(nextProps)
    }

    if (nextProps.animating && !this.props.animating) {
      this._startAnimation(nextProps)
    }
  }

  render () {
    return (
      <View style={bubbleContainerStyle}>
        {this._renderBubbles()}
      </View>
    )
  }
}
