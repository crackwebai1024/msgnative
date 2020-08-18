import { put } from 'redux-saga/effects'

import { callAPI } from './APISagas'
import RegionActions from 'commons/Redux/RegionRedux'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

export function * fetchAllRegions ({ resolve, reject }) {
  try {
    const response = yield callAPI('Region')
    if (typeof resolve === 'function') resolve(response.data)
    yield put(RegionActions.allRegionsSuccess(response.data))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch-regions']))
    if (typeof reject === 'function') reject(err)
    yield put(RegionActions.allRegionsFailure(err))
  }
}
