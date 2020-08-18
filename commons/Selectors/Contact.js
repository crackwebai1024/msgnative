import { path } from 'ramda'

export const getContactByEmail = email => (state) => {
  const c = state.contact
  return path(['searchResultsData', email], c) || path(['data', email], c)
}
