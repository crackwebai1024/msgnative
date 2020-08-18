import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'
import { merge, find } from 'ramda'
import createAPIPackage from '../Lib/Redux/createAPIPackage'
import { put } from 'redux-saga/effects'
import { callAPI } from 'commons/Sagas/APISagas'

/* ------------- Types and Action Creators ------------- */

const {
  APITypes, APICreators, APIState, APIReducers, APITypesToSagas
} = createAPIPackage('plan', [
  { type: 'plans', endpoint: 'Plans' },
  { type: 'couponCheck', endpoint: 'CheckCoupon', getTranslatedError: true },
  { type: 'getUpgradePrice', endpoint: 'GetUpgradePrice', getTranslatedError: true },
  {
    type: 'upgradePlan', endpoint: 'UpdateUserAccount', getTranslatedError: true, requestSagas: upgradePlanRequest
  }
])

const { Types, Creators } = createActions({
  newUserSelectPlan: ['id', 'term']
})

export const PlanTypes = merge(Types, APITypes)
export const PlanCreators = merge(Creators, APICreators)
export const PlanAPITypesToSagas = APITypesToSagas
export default PlanCreators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  ...APIState,

  newUserSelectedPlan: null,
  newUserSelectedPlanTerm: null
})

/* ------------- Reducers ------------- */

const newUserSelectPlan = (state, { id, term }) => state.merge({
  newUserSelectedPlan: id,
  newUserSelectedPlanTerm: term
})

const reset = () => INITIAL_STATE

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  ...APIReducers,

  [PlanTypes.NEW_USER_SELECT_PLAN]: newUserSelectPlan,

  [UserTypes.LOGOUT]: reset
})
function * upgradePlanRequest ({ payload, resolve, reject }) {
  // Keep track of previously default card ID, if we change it
  let previouslyDefaultCardId

  try {
    if (payload.ccinfo) {
      const card = yield callAPI('AddCard', { ccinfo: payload.ccinfo, email: payload.email })
      if (card.data && card.data.id) {
        delete payload.ccinfo
        delete payload.email
        payload.ccid = card.data.id
      }
    }

    if (payload.ccid) {
      // Fetch all cards and find the default one
      const cards = yield callAPI('Cards')
      if (cards && cards.data && cards.data.data && cards.data.data.length > 0) {
        const defaultCard = find(c => c.is_default, cards.data.data)

        // If the default card is different that what user just selected
        // then just set the selected card as default for now
        // and update previouslyDefaultCardId
        if (defaultCard && defaultCard.id && defaultCard.id !== payload.ccid) {
          previouslyDefaultCardId = defaultCard.id
          yield callAPI('UpdateCard', { id: payload.ccid, is_default: true })
        }
      }
    }

    const response = yield callAPI('UpdateUserAccount', payload)
    typeof resolve === 'function' && resolve(response.data)
    yield put(PlanCreators.upgradePlanSuccess(response.data, payload))

    // If previouslyDefaultCardId was ever set, set it back as default
    if (previouslyDefaultCardId) {
      yield callAPI('UpdateCard', { id: previouslyDefaultCardId, is_default: true })
    }
  } catch (e) {
    typeof reject === 'function' && reject(e.message)
    yield put(PlanCreators.upgradePlanError(e.message, e))
    try {
      // If previouslyDefaultCardId was ever set, set it back as default
      if (previouslyDefaultCardId) {
        yield callAPI('UpdateCard', { id: previouslyDefaultCardId, is_default: true })
      }
    } catch (e) {}
  }
}
