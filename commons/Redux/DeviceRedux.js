import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { UserTypes } from './UserRedux'

import { getDeviceInfoForRedux } from 'app/Lib/Device'

const { Types, Creators } = createActions({
  updateMicVideoPermission: ['mic', 'camera']
})

const device = getDeviceInfoForRedux()
export const INITIAL_STATE = Immutable(device)
export const DeviceTypes = Types
const DeviceCreators = Creators
export default DeviceCreators

const reset = () => INITIAL_STATE
const updateMicVideoPermission = (state, { mic, camera }) => {
  if (camera == null || camera === undefined) {
    return state.merge({
      has_microphone: mic
    })
  }
  return state.merge({
    has_microphone: mic,
    has_camera: camera
  })
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.UPDATE_MIC_VIDEO_PERMISSION]: updateMicVideoPermission,
  [UserTypes.LOGOUT]: reset
})
