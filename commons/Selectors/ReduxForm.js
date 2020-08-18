import { path } from 'ramda'

export const getReduxFormValue = (state, formIdentifier, fieldIdentifier) =>
  path(['form', formIdentifier, 'values', fieldIdentifier], state)

export const getReduxFormSyncError = (state, formIdentifier, fieldIdentifier) =>
  path(['form', formIdentifier, 'syncErrors', fieldIdentifier], state)
