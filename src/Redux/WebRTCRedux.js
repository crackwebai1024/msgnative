import { createActions } from 'reduxsauce'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  bootCallProcess: ['contact', 'isAudioOnly', 'fm'],
  bootChatProcess: ['contact', 'needNavBack', 'rootRouteName', 'fm']
})

export const WebRTCTypes = Types
export default Creators

/* No reduer */
/* Its purpose is pourely dispatch other actions in saga */
