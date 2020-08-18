import { put, call, select } from 'redux-saga/effects'
import { SubmissionError } from 'redux-form'
import { callAPI, buildApiReadPayload } from '../APISagas'
import Actions, { REDUX_CONFIG } from 'commons/Redux/UserEmailRedux'
import { getError } from 'commons/Lib/Utils'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

export function * fetch ({ requestType: _requestType }) {
  const isRN = yield select(s => s.device.isReactNative)
  const shouldUseCache = isRN
  try {
    const searchConfig = {
      type: 'search_or',
      columns: ['email', 'display_name']
    }

    const basePayload = { }

    const slice = yield select(s => s.useremail)
    if (slice.searchFilters && slice.searchFilters.is_confirmed) {
      basePayload.limit = 100
    }

    const { payload, requestType, isRequestUnnecessary } = yield call(
      buildApiReadPayload, _requestType, searchConfig, REDUX_CONFIG.statePrefix,
      Actions.useremailClearSearchData, [], basePayload
    )
    if (isRequestUnnecessary) {
      return
    }
    yield put(Actions.useremailRequest(requestType))
    const response = yield callAPI('UserEmail', payload)
    const successActionCreator = shouldUseCache ? Actions.useremailSuccessForCache : Actions.useremailSuccess
    yield put(successActionCreator(response.data, requestType))
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-fetch']))
    yield put(Actions.useremailFailure(err))
  }
}

export function * create ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('CreateUserEmail', payload)
    // ax.form.createSuccess(ax.EVENTS.FORWARD_ADDRESS_FORM)
    resolve()
    yield put(Actions.useremailCreateSuccess(response.data))
  } catch (e) {
    // ax.form.createError(ax.EVENTS.FORWARD_ADDRESS_FORM, e.message, e.code)
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-create'])) }))
  }
}

export function * edit ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('UpdateUserEmail', payload)
    // ax.form.editSuccess(ax.EVENTS.FORWARD_ADDRESS_FORM)
    resolve()
    yield put(Actions.useremailEditSuccess(response.data))
  } catch (e) {
    // ax.form.editError(ax.EVENTS.FORWARD_ADDRESS_FORM, e.message, e.code)
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-update'])) }))
  }
}

export function * remove ({ payload, resolve, reject }) {
  const id = payload.id
  try {
    yield callAPI('DeleteUserEmail', payload)
    // ax.delete(ax.EVENTS.FORWARD_ADDRESS)
    yield put(Actions.useremailRemoveSuccess(id))
    typeof resolve === 'function' && resolve()
  } catch (e) {
    console.error('Delete API request failed - ', e)
    yield put(Actions.useremailRemoveFailure(id))
    if (typeof reject === 'function') {
      reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['failed-to-remove'])) }))
    }
  }
}

export function * requestConfirmation ({ payload, resolve, reject }) {
  try {
    const response = yield callAPI('RequestConfirmationEmail', payload)
    // ax.action(ax.EVENTS.FORWARD_ADDRESS, 'Request Confirmation Email')
    yield put(Actions.useremailRequestConfirmationSuccess(response.data))
    resolve()
  } catch (e) {
    console.error('API request failed - ', e)
    reject(new SubmissionError({ _error: getError(e, yield formatMessage(m['request-failed'])) }))
  }
}

export function * setDefault ({ id }) {
  try {
    const userEmails = yield select(s => s.useremail)
    if (userEmails.dataOrder && userEmails.dataOrder.length) {
      const currentDefaultIds = userEmails.dataOrder.filter(id => userEmails.data[id].is_default)
      for (const _id of currentDefaultIds) {
        yield callAPI('UpdateUserEmail', { id: _id, is_default: false })
      }
      yield callAPI('UpdateUserEmail', { id, is_default: true })
    }
    yield put(Actions.useremailSetDefaultSuccess(id))
  } catch (e) {}
}
