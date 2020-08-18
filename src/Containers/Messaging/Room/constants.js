import { ifIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

export const HEADER_HEIGHT = ifIphoneX(125 + getStatusBarHeight(), 125)

// zIndex
export const Z_INDEX_HEADER = 1
export const Z_INDEX_SWITCH_TABS = 1
export const Z_INDEX_EPHEMERAL_WARNING = 3
export const Z_INDEX_ROOM_INFO = 4
