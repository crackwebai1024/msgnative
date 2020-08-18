import Immutable from 'seamless-immutable'

const initialState = Immutable({
  sceneData: {},
  location: null
})

// ------------------------------------
// Constants
// ------------------------------------
export const LOCATION_CHANGE = 'LOCATION_CHANGE'

// ------------------------------------
// Actions
// ------------------------------------
export function locationChange (location = '/') {
  return {
    type: LOCATION_CHANGE,
    payload: location
  }
}

// ------------------------------------
// Specialized Action Creator
// ------------------------------------
export const updateLocation = ({ dispatch }) => nextLocation => dispatch(locationChange(nextLocation))

export function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case 'REACT_NATIVE_ROUTER_FLUX_FOCUS':
      if (action.scene.sceneData) {
        return state.set('sceneData', state.sceneData.merge(action.scene.sceneData))
      }

      return state

    case LOCATION_CHANGE:
      return state.set('location', action.payload)

    default:
      return state
  }
}
