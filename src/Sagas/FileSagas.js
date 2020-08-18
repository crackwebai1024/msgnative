import { call, take } from 'redux-saga/effects'
import mime from 'react-native-mime-types'
import Share from 'react-native-share'
import RNFS from 'react-native-fs'
import { Platform } from 'react-native'

import { writeTempFile } from 'app/Lib/FS'
import { createAppStateChangeEventChannel } from './AppSagas'

let appStateChannnel = null
const isAndroid = Platform.OS === 'android'

function * deleteIfExists (filepath) {
  try {
    const exists = yield call(RNFS.exists, filepath)
    if (exists) {
      yield call(RNFS.unlink, filepath)
    }
  } catch (e) {}
}

export function * shareFile ({ filename, data, encoding }) {
  if (isAndroid && !appStateChannnel) {
    appStateChannnel = yield call(createAppStateChangeEventChannel)
  }
  let tempFilePath = null
  try {
    tempFilePath = yield call(writeTempFile, filename, data, encoding)
    yield call(Share.open, {
      message: filename,
      url: `file://${tempFilePath}`,
      type: mime.lookup(filename)
    })

    if (isAndroid) {
      let activeState = false
      while (!activeState) {
        const state = yield take(appStateChannnel)
        if (state === 'active') {
          activeState = true
        }
      }
    }

    yield call(deleteIfExists, tempFilePath)
  } catch (err) {
    console.info('Error sharing a file = ', err)
    yield call(deleteIfExists, tempFilePath)
  } finally {
    yield call(deleteIfExists, tempFilePath)
  }
}
