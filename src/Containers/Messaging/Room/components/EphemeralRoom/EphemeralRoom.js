import React from 'react'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import MessageList from '../MessageList'
import EphemeralHintMessage from './EphemeralHintMessage'
import EphemeralTerminatedOverlay from './EphemeralTerminatedOverlay'
import EphemeralWaitingOverlay from './EphemeralWaitingOverlay'

const s = EStyleSheet.create({
  overlayContainer: {
    flex: 1
  }
})

const EphemeralRoom = props => ([
  !props.connected ? <View style={s.overlayContainer} key={0}>
    {props.e2eeTerminated
      ? <EphemeralTerminatedOverlay {...props} />
      : <EphemeralWaitingOverlay {...props} />
    }
    <EphemeralHintMessage e2eeTerminated={props.e2eeTerminated} />
  </View> : null,
  props.connected && <MessageList {...props} key={1} />
])

EphemeralRoom.displayName = 'EphemeralRoom'

export default EphemeralRoom
