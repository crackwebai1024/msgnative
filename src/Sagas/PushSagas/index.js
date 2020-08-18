import { spawn } from 'redux-saga/effects'

import { listenToNotifications } from './Notifications'

export * from './Notifications'

export function * pushInit () {
  try {
    // const deviceUUID = yield select(s => s.device.uuid)
    yield spawn(listenToNotifications)
    // yield spawn(listenToInboundActions)
  } catch (e) {
    console.error('pushInit caught -', e)
  }
}
