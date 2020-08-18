import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { AppTypes } from './AppRedux'
/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  loginRequest: ['username', 'password', 'resolve', 'reject'],
  loginSuccess: ['data', 'username', 'password'],
  loginError: ['error'],

  updateUser: ['data'],

  signupRequest: ['payload', 'resolve', 'reject'],
  signupSuccess: ['data', 'email'],

  usernameCheckRequest: ['username', 'resolve', 'reject'],
  forgotUsernameRequest: ['payload', 'resolve', 'reject'],
  emailCheckRequest: ['email', 'resolve', 'reject'],
  emailCheckForEspRequest: ['email', 'resolve', 'reject'],
  emailCheckForIdentity: ['email', 'resolve', 'reject'],
  logoutRequest: null,
  logout: null,

  passwordResetRequestRequest: ['payload', 'resolve', 'reject'],
  passwordResetRequest: ['payload', 'resolve', 'reject'],

  emailConfirmationRequest: null,

  updateAccountRequest: ['payload', 'resolve', 'reject'],
  updateAccountSuccess: ['data'],

  updateAccountStateSuccess: ['data'],

  updateIdentitySettingsRequest: ['payload', 'resolve', 'reject'],

  refreshProfileRequest: ['payload', 'resolve', 'reject'],
  refreshProfileSuccess: ['data']
})

export const UserTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  data: {}
})

/* ------------- Reducers ------------- */

export const updateUser = (state, { data }) => {
  // fallback to default values for old users
  if (!data.notification_sound) {
    data.notification_sound = 'friendly.mp3'
  }
  if (!data.video_call_ringtone) {
    data.video_call_ringtone = 'classic.mp3'
  }
  return state.set('data', data)
}

export const updateAccountStateSuccess = (state, { data }) => state.setIn(['data', 'state'], data)

export const logout = state => state.set('data', Immutable({}))

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.UPDATE_USER]: updateUser,

  [Types.UPDATE_ACCOUNT_STATE_SUCCESS]: updateAccountStateSuccess,
  [Types.REFRESH_PROFILE_SUCCESS]: updateUser,

  [Types.LOGOUT]: logout,
  [AppTypes.ENSURE_DATA_CLEAN_UP_ON_LOGOUT]: logout
})
