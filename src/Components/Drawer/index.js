import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, Animated, TouchableWithoutFeedback, Modal, Dimensions } from 'react-native'
import { stylePropType } from 'app/Styles'
import EStyleSheet from 'react-native-extended-stylesheet'

const DRAWER_WIDTH = 215
const s = EStyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: -1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },

  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },

  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    left: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#fff'
  }
})

export default class Drawer extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    slideFrom: PropTypes.oneOf(['left', 'right']),
    fullScreen: PropTypes.bool,
    containerStyle: stylePropType,
    drawerStyle: stylePropType,
    children: PropTypes.any
  }

  static defaultProps = {
    slideFrom: 'right',
    fullScreen: false
  }

  constructor (props) {
    super(props)

    this.state = {
      animation: new Animated.Value(0),
      show: false
    }

    this._close = this._close.bind(this)
    this._open = this._open.bind(this)
  }

  _open () {
    this.setState({ show: true })
    Animated.timing(
      this.state.animation,
      {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }
    ).start()
  }

  _close (cb = () => {}) {
    Animated.timing(
      this.state.animation,
      {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }
    ).start(({ finished }) => {
      if (this.state.show && finished) {
        this.setState({ show: false })
        cb()
      }
    })
  }

  _getSlideFromStyle (slideFrom) {
    const ss = {}

    ss[slideFrom === 'left' ? 'right' : 'left'] = Dimensions.get('window').width
    ss[slideFrom] = 'auto'

    return EStyleSheet.create({
      drawer: ss
    })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.open && !this.props.open) {
      this._open()
    } else if (!nextProps.open && this.props.open) {
      this._close()
    }
  }

  _renderContent () {
    const { drawerStyle, children } = this.props
    const { slideFrom } = this.props
    const slideFromStyle = this._getSlideFromStyle(slideFrom)

    return [
      <TouchableWithoutFeedback style={s.overlay} onPress={this.props.onClose} key={0}>
        <Animated.View
          style={[
            s.overlay,
            {
              backgroundColor: '#000',
              opacity: this.state.animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.7]
              })
            }
          ]}
        />
      </TouchableWithoutFeedback>,
      <Animated.View
        key={1}
        style={[
          s.drawer,
          drawerStyle,
          slideFromStyle.drawer,
          {
            // left: Dimensions.get('window').width,
            transform: [
              {
                translateX: this.state.animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, slideFrom === 'right' ? -DRAWER_WIDTH : DRAWER_WIDTH]
                })
              }
            ]
          }
        ]}
      >
        {children}
      </Animated.View>
    ]
  }

  render () {
    const { containerStyle, fullScreen } = this.props

    if (!this.state.show) {
      return null
    }

    if (fullScreen) {
      return (
        <Modal
          transparent
          visible={this.state.show}
          onRequestClose={this._close}
          style={[s.container, containerStyle]}
        >
          <View style={{ flex: 1 }}>
            {this._renderContent()}
          </View>
        </Modal>
      )
    }

    return (
      <View style={[s.container, containerStyle]}>
        {this._renderContent()}
      </View>
    )
  }
}
