import { put, takeLatest } from 'redux-saga/effects'
import m from 'commons/I18n/'
import { getError } from 'commons/Lib/Utils'
import { callAPI } from 'commons/Sagas/APISagas'
import { formatMessage } from 'commons/I18n/sagas'

const requestReducer = (actionType, reducer) =>
  (state, { payload }) => {
    const _state = state.setIn(['api', actionType], {
      data: null, inProgress: true, error: null, payload
    })

    return typeof reducer === 'function' ? reducer(_state, { payload }) : _state
  }

const successReducer = (actionType, reducer) =>
  (state, { data, requestPayload }) => {
    const _state = state.setIn(['api', actionType], {
      data, inProgress: false, error: null, payload: null
    })

    return typeof reducer === 'function' ? reducer(_state, { data, requestPayload }) : _state
  }

const errorReducer = (actionType, reducer) =>
  (state, { error }) => {
    const _state = state.setIn(['api', actionType], {
      data: null, inProgress: false, error, payload: null
    })

    return typeof reducer === 'function' ? reducer(_state, { error }) : _state
  }

const clearReducer = actionType =>
  state => state.setIn(['api', actionType], {
    data: null, inProgress: false, error: null, payload: null
  })

/**
 * Returns a whole package of –
 *
 *  - redux action types
 *  - redux action creators
 *  - redux default state
 *  - reducers
 *  - sagas
 *  - redux action types => sagas mapping
 *
 * @param modelType – string identifying the model type.
 *                    for e.g. 'contact', 'identity', etc.
 * @param actions – string identifying the actions that can be executed over this model
 *                  for e.g. 'heatmap', 'delete', 'create', 'edit', etc
 */
export default function createAPIPackage (modelType, actions) {
  const Types = {}
  const Creators = {}
  const State = { api: {} }
  const Reducers = {}
  const Sagas = {}
  const TypesToSagas = []

  for (const action of actions) {
    const requestType = `api/${modelType}/${action.type}/request`
    const successType = `api/${modelType}/${action.type}/success`
    const errorType = `api/${modelType}/${action.type}/error`
    const clearType = `api/${modelType}/${action.type}/clear`

    const requestTypeAlias = `${action.type}Request`
    const successTypeAlias = `${action.type}Success`
    const errorTypeAlias = `${action.type}Error`
    const clearTypeAlias = `${action.type}Clear`

    // Add action types
    Types[requestTypeAlias] = requestType
    Types[successTypeAlias] = successType
    Types[errorTypeAlias] = errorType
    Types[clearTypeAlias] = clearType

    // Add action creators
    Creators[requestTypeAlias] = (payload, resolve, reject) => ({
      type: requestType,
      payload,
      resolve,
      reject
    })
    Creators[successTypeAlias] = (data, requestPayload) => ({
      type: successType,
      data,
      requestPayload
    })
    Creators[errorTypeAlias] = (error, e) => ({ type: errorType, error, e })
    Creators[clearTypeAlias] = () => ({ type: clearType })

    // Add default state
    State.api[action.type] = {
      data: null,
      inProgress: false,
      error: null,
      payload: null
    }

    // Add reducers
    Reducers[requestType] = requestReducer(action.type, action.requestReducer)
    Reducers[successType] = successReducer(action.type, action.successReducer)
    Reducers[errorType] = errorReducer(action.type, action.errorReducer)
    Reducers[clearType] = clearReducer(action.type)

    const requestSagas = function * ({ payload, resolve, reject }) {
      try {
        const response = yield callAPI(action.endpoint, payload)
        typeof resolve === 'function' && resolve(response.data)
        yield put(Creators[successTypeAlias](response.data, payload))
      } catch (e) {
        let error
        if (action.getTranslatedError && e.code && m.app.APIErrors[e.code]) {
          error = yield formatMessage(m.app.APIErrors[e.code])
        } else {
          error = getError(e, `Failed to update the ${modelType}. Please try again.`)
        }
        typeof reject === 'function' && reject(error, e)
        yield put(Creators[errorTypeAlias](error, e))
      }
    }

    Sagas[action.type] = action.requestSagas || requestSagas

    TypesToSagas.push(takeLatest(requestType, action.requestSagas || requestSagas))
  }

  return {
    Types,
    APITypes: Types,

    Creators,
    APICreators: Creators,

    State,
    APIState: State,

    Reducers,
    APIReducers: Reducers,

    Sagas,
    APISagas: Sagas,

    TypesToSagas,
    APITypesToSagas: TypesToSagas
  }
}
