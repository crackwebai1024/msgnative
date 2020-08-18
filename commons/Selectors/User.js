import { isEmpty, isNil, path } from 'ramda'

export const isLoggedIn = userState => !(isEmpty(userState.data) || isNil(userState.data))

export const isPendingOnboard = state => !path(['user', 'data', 'total_identities'], state)

export const currentPlanId = state => parseInt(path(['user', 'data', 'plan_id'], state)) || null
export const currentPlanName = state => path(['user', 'data', 'plan_name'], state)
