import { takeEvery } from 'redux-saga/effects'

import { ChatTypes } from 'commons/Redux/ChatRedux'

import { bootstrapChatSocket } from './Setup'

export default [
  takeEvery(ChatTypes.CHAT_RECONNECT, bootstrapChatSocket)
]
