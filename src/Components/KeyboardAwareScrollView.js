import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { ScrollView, Keyboard } from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer'

export default class KeyboardAwareScrollView extends PureComponent {
  static propType = {
    triggerDistance: PropTypes.number.isRequired
  }

  static defaultProps = {
    triggerDistance: 75
  }

  constructor (props) {
    super(props)

    this._handleScroll = this._handleScroll.bind(this)

    // Keep track of the element ref that is to be adjusted for
    this._elRef = null

    // Track the scrolled top position of the ScrollView
    this._topPosition = 0
  }

  componentWillMount () {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide.bind(this))
    this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardDidShow.bind(this))
  }

  componentWillUnmount () {
    this.keyboardDidHideListener.remove()
    this.keyboardDidShowListener.remove()
  }

  updateScroll (elRef) {
    // Callback for onScroll event, keeps track of the top scroll position
    this._elRef = elRef
  }

  keyboardDidHide () {
    console.info('KeyboardAwareScrollView: Keyboard just hid')

    // Remove reference to the element upon keyboard close,
    // set bottom push scroll to 0
    this._elRef = null
    if (!this.refs.scrollView) return
    this.refs.scrollView.scrollTo({ y: this._topPosition, animated: true })
  }

  keyboardDidShow (e) {
    console.info('KeyboardAwareScrollView: Keyboard just showed up')

    if (!this._elRef) return

    const { triggerDistance } = this.props

    // Get the measurement for the element and scroll down
    // if the element is too close or overlapped by the keyboard
    this._elRef.measure((ox, oy, width, height, px, py) => {
      const elY = py; const keyboardY = e.endCoordinates.screenY
      if ((elY + triggerDistance) > keyboardY && this.refs.scrollView) {
        this.refs.scrollView.scrollTo({ y: this._topPosition + elY + triggerDistance - keyboardY })
      }
    })
  }

  _handleScroll (e) {
    this._topPosition = e.nativeEvent.contentOffset.y
  }

  render () {
    return (
      <ScrollView
        ref='scrollView'
        scrollEventThrottle={500}
        onScroll={this._handleScroll}
        {...this.props}
        contentContainerStyle={[this.props.contentContainerStyle]}
      >
        {this.props.children}
        <KeyboardSpacer />
      </ScrollView>
    )
  }
}
