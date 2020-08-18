import moment from 'moment'
import { put, call } from 'redux-saga/effects'

import DashboardActions from 'commons/Redux/DashboardRedux'
import { callAPI } from './APISagas'

function * getGeoStats () {
  yield put(DashboardActions.geoStatsRequest())

  const now = moment.utc()
  const then = moment.utc().subtract(1, 'month')
  const payload = {
    direction: 2,
    date_start: then.toISOString(),
    date_end: now.toISOString()
  }

  try {
    const response = yield callAPI('GeoStats', payload)
    yield put(DashboardActions.geoStatsSuccess(response))
  } catch (e) {
    yield put(DashboardActions.geoStatsFailure(e))
  }
}

export function * fetchDashboardData () {
  yield call(getGeoStats)
}
