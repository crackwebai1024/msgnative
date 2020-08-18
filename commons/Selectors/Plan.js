import { path, filter, pathOr, sortBy, mapObjIndexed, values, find } from 'ramda'

import { capitalize } from '../Lib/Utils'
import { isPendingOnboard, currentPlanId } from './User'

export const getSelectedPlanFinalPriceData = (state) => {
  const data = path(['plan', 'api', 'getUpgradePrice'], state)
  return {
    inProgress: data.inProgress,
    data: parseInt(path(['data', 'price'], data)) || null
  }
}

const getPlanDetailsForPlanId = (state, planId) => {
  const plans = path(['plan', 'api', 'plans', 'data', 'plans'], state)
  if (!plans || !plans.length) return null

  const plan = filter(p => parseInt(p.id) === parseInt(planId), plans)
  if (!plan || !plan.length) return null

  return plan[0]
}

const getYearlyPriceForPlanId = (state, planId) => {
  const plan = getPlanDetailsForPlanId(state, planId)
  if (!plan) return null

  return parseInt(plan.price_year) || null
}

export const getSelectedPlanId = state => path(['form', 'planSelection', 'values', 'plan'], state)

export const getSelectedPlanName = (state) => {
  const planId = path(['form', 'planSelection', 'values', 'plan'], state)
  if (!planId) return null

  const plan = getPlanDetailsForPlanId(state, planId)
  if (!plan) return null

  return plan.name
}

export const getSelectedPlanYearlyPrice = (state) => {
  const planId = path(['form', 'planSelection', 'values', 'plan'], state)
  if (!planId) return null

  return getYearlyPriceForPlanId(state, planId)
}

export const extractPlanData = (state) => {
  const slice = path(['plan', 'api', 'plans'], state)
  let plans = path(['data', 'plans'], slice)

  const res = {
    data: null,
    inProgress: slice.inProgress,
    error: slice.error
  }

  if (!slice || !plans) return res

  // If the user is still onboarding, show all plans
  // Otherwise only show the higher/upgradeable plans
  if (!isPendingOnboard(state)) {
    const currentYearlyPrice = getYearlyPriceForPlanId(state, currentPlanId(state))
    plans = filter(p => parseInt(p.price_year) > currentYearlyPrice, plans)
  }

  res.data = plans.map(p => ({
    value: p.id,
    label: `${capitalize(p.name)} Plan ($${p.name === 'free' ? '0.00' : p.price_year.toString()}/yr)`
  }))

  return res
}

const TERM = {
  year: 1,
  month: 2
}

export const fullPlanData = (state) => {
  const planSlice = path(['plan', 'api', 'plans'], state)
  if (!planSlice || !planSlice.data) {
    return {
      data: null,
      inProgress: false,
      error: null
    }
  }

  const _currentPlanId = currentPlanId(state)
  const _isPendingOnboard = isPendingOnboard(state)

  const completeData = {}
  const planIdDetails = {}

  // object with plan features
  const plans = pathOr({}, ['data', 'content', 'plan'], planSlice)
  mapObjIndexed((details, name) => {
    completeData[name] = {
      name,
      features: details.features.asMutable()
    }
  }, plans)

  // list with all plan prices
  const planPrices = pathOr([], ['data', 'plans'], planSlice)

  const currentPlan = find(p => p.id === _currentPlanId, planPrices)

  // map over prices and update plan object
  planPrices.forEach((p) => {
    const term = p.subscription_type === TERM.year ? 'year' : 'month'
    const planBaseName = p.name.replace('_m', '')
    const price = parseInt(p[`price_${term}`])
    planIdDetails[p.id] = { price, term, name: planBaseName }
    completeData[planBaseName][term] = p.asMutable()
    completeData[planBaseName][term].plan_name = p.name
    completeData[planBaseName][term].final_price = parseInt(p[`price_${term}`])
    completeData[planBaseName][term].user_credit_value = parseInt(completeData[planBaseName][term].user_credit_value)
    if (currentPlan) {
      completeData[planBaseName][term].disabled = (
        (!_isPendingOnboard && currentPlan.name === 'free' && planBaseName === 'free') ||
        (currentPlan.name !== 'free' && currentPlan.subscription_type === TERM.year && p.subscription_type === TERM.month) ||
        (currentPlan.name !== 'free' && currentPlan.subscription_type === p.subscription_type && parseInt(price) <= parseInt(currentPlan[`price_${term}`])) ||
        (currentPlan.name !== 'free' && currentPlan.subscription_type === TERM.month && p.subscription_type === TERM.year && parseInt(p.price_month) < parseInt(currentPlan.price_month))
      )
    }
  })

  // If there's no month price for free plan, add it
  if (completeData.free && !path(['free', 'month'], completeData)) {
    completeData.free.month = path(['free', 'year'], completeData)
  }

  completeData.premium.features.smtp_tokenized_gateway = true

  // Turn into array sorted by low to high price
  return {
    planIdDetails,
    dataObj: completeData,
    data: sortBy(p => parseInt(p.year.price))(values(completeData)),
    inProgress: planSlice.inProgress,
    error: planSlice.inProgress
  }
}
