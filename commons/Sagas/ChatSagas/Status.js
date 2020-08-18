import { put, take, race, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { path } from 'ramda'

import Actions, { MESSAGE_STATUS, ChatTypes } from 'commons/Redux/ChatRedux'

export function * chatMessageStatusWatch ({ data, isE2EE }) {
  const {
    message_id,
    room_id,
    status,
    user_from
  } = data

  // if status is not pending, then no need to watch
  if (status !== MESSAGE_STATUS.PENDING) {
    return
  }

  // if it's e2ee room then no need to watch
  if (isE2EE) {
    return
  }

  // if message is sent by remote user then no need to watch
  const memberEmail = yield select(path(['chat', 'data', room_id, 'member_email']))
  if (memberEmail !== user_from) {
    return
  }

  // wait for four seconds or for id of the message
  // to change, which means the message was sent to server
  const result = yield race({
    timeout: delay(4000),
    sent: call(watchForMessageChangeId, message_id)
  })

  if (result.timeout) {
    yield put(Actions.chatMessageModified({
      ...data,
      status: MESSAGE_STATUS.ERROR
    }, false))
  }
}

function * watchForMessageChangeId (id) {
  while (true) {
    const { messageId } = yield take(ChatTypes.CHAT_MESSAGE_CHANGE_ID)
    if (id === messageId) {
      return true
    }
  }
}
