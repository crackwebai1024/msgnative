import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, PanResponder } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  letter: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: palette.iosBlue,
    textAlign: 'center'
  }
})

const LetterPicker = ({ letter }) => (
  <Text style={styles.letter}>
    {letter}
  </Text>
)
LetterPicker.propTypes = {
  letter: PropTypes.string
}

class AlphabetPicker extends Component {
  constructor (props, context) {
    super(props, context)

    this.alphabet = props.alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('')
  }

  componentWillMount () {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        this.props.onTouchStart && this.props.onTouchStart()

        this.tapTimeout = setTimeout(() => {
          this._onTouchLetter(this._findTouchedLetter(gestureState.y0))
        }, 100)
      },
      onPanResponderMove: (evt, gestureState) => {
        clearTimeout(this.tapTimeout)
        this._onTouchLetter(this._findTouchedLetter(gestureState.moveY))
      },
      onPanResponderTerminate: this._onPanResponderEnd.bind(this),
      onPanResponderRelease: this._onPanResponderEnd.bind(this)
    })
  }

  _onTouchLetter (letter) {
    letter && this.props.onTouchLetter(letter)
  }

  _onPanResponderEnd () {
    requestAnimationFrame(() => { // eslint-disable-line
      this.props.onTouchEnd && this.props.onTouchEnd()
    })
  }

  _findTouchedLetter (y) {
    const top = y - (this.absContainerTop || 0)

    if (top >= 1 && top <= this.containerHeight) {
      return this.alphabet[Math.floor((top / this.containerHeight) * this.alphabet.length)]
    }
  }

  _onLayout (event) {
    this.refs.alphabetContainer && this.refs.alphabetContainer.measure((x1, y1, width, height, px, py) => {
      this.absContainerTop = py
      this.containerHeight = height
      if (py > height) { // TODO: Quick Workaround solution, should be replaced with good one.
        // A bit more explanation: for now view.measure returns incorrect value
        // Thus its itterating itself until it returns correct one.
        setTimeout(() => { this._onLayout() }, 500)
      }
    })
  }

  render () {
    this._letters = this._letters || this.alphabet.map(l => <LetterPicker letter={l} key={l} />)

    return (
      <View
        ref='alphabetContainer'
        {...this._panResponder.panHandlers}
        onLayout={this._onLayout.bind(this)}
        style={{
          paddingHorizontal: 5,
          borderRadius: 1,
          justifyContent: 'center'
        }}
      >
        <View>
          {this._letters}
        </View>
      </View>
    )
  }
}

AlphabetPicker.propTypes = {
  onTouchLetter: PropTypes.func.isRequired,
  onTouchStart: PropTypes.func,
  onTouchEnd: PropTypes.func,
  alphabet: PropTypes.func
}

export default AlphabetPicker
