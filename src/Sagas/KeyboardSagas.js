import { eventChannel } from 'redux-saga'
import { call, put, take, fork } from 'redux-saga/effects'
import { Keyboard } from 'react-native'
import { KeyboardTypes } from '../Redux/KeyboardRedux'

const keyboardEvents = [
  { eventName: 'keyboardWillShow', eventType: KeyboardTypes.KEYBOARD_WILL_SHOW },
  { eventName: 'keyboardDidShow', eventType: KeyboardTypes.KEYBOARD_DID_SHOW },
  { eventName: 'keyboardWillHide', eventType: KeyboardTypes.KEYBOARD_WILL_HIDE },
  { eventName: 'keyboardDidHide', eventType: KeyboardTypes.KEYBOARD_DID_HIDE },
  { eventName: 'keyboardWillChangeFrame', eventType: KeyboardTypes.KEYBOARD_WILL_CHANGE_FRAME },
  { eventName: 'keyboardDidChangeFrame', eventType: KeyboardTypes.KEYBOARD_DID_CHANGE_FRAME }
]

const createKeyboardEventChannel = eventName => eventChannel((emitter) => {
  // callback invokes emitter to send events
  // to the channel
  const cb = event => emitter({ event })

  // subscribe to the event
  Keyboard.addListener(eventName, cb)

  // return an unsubscriber
  return () => Keyboard.removeListener(eventName, cb)
})

export function * keybooardEventSaga ({ eventName, eventType }) {
  const channel = yield call(createKeyboardEventChannel, eventName)
  try {
    while (true) {
      const { event } = yield take(channel)
      yield put({
        type: KeyboardTypes[eventType],
        event
      })
    }
  } finally {
    channel.close()
  }
}

export function * initKeyboard () {
  for (let i = 0; i < keyboardEvents.length; i += 1) {
    yield fork(keybooardEventSaga, keyboardEvents[i])
  }
}
