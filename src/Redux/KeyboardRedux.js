import { createActions, createReducer } from 'reduxsauce'
import Immutable from 'seamless-immutable'

const { Types, Creators } = createActions({
  keyboardWillShow: ['event'],
  keyboardDidShow: ['event'],
  keyboardWillHide: ['event'],
  keyboardDidHide: ['event'],
  keyboardWillChangeFrame: ['event'],
  keyboardDidChangeFrame: ['event']
})

export const KeyboardTypes = Types

export default Creators

export const INITIAL_STATE = Immutable({
  // weather the keyboard is open or not
  isOpen: false,

  // if the keyboard is in the process of openning
  // or closing
  inProgress: false,

  easing: 'keyboard',
  endCoordinates: {
    screenY: 0,
    height: 0,
    screenX: 0,
    width: 0
  },
  startCoordinates: {
    screenY: 0,
    height: 0,
    screenX: 0,
    width: 0
  },
  duration: 250
})

const keyboardWillShow = (state, { event }) =>
  state.merge({
    inProgress: true,
    ...event
  })

const keyboardDidShow = (state, { event }) =>
  state.merge({
    inProgress: false,
    isOpen: true,
    ...event
  })

const keyboardWillHide = (state, { event }) =>
  state.merge({
    inProgress: true,
    ...event
  })

const keyboardDidHide = (state, { event }) =>
  state.merge({
    inProgress: false,
    isOpen: false,
    ...event
  })

export const reducer = createReducer(INITIAL_STATE, {
  [Types.KEYBOARD_WILL_SHOW]: keyboardWillShow,
  [Types.KEYBOARD_DID_SHOW]: keyboardDidShow,
  [Types.KEYBOARD_WILL_HIDE]: keyboardWillHide,
  [Types.KEYBOARD_DID_HIDE]: keyboardDidHide
})
