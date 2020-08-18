import EStyleSheet from 'react-native-extended-stylesheet'
import { Platform } from 'react-native'
import { ifIphoneX } from 'react-native-iphone-x-helper'

import palette from 'app/Styles/colors'

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0
const FOOTER_HEIGHT = Platform.OS === 'ios' ? 39 : 30

export default EStyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },

  headerContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    ...ifIphoneX({
      paddingTop: STATUSBAR_HEIGHT + 20
    }, {
      paddingTop: STATUSBAR_HEIGHT
    }),
    backgroundColor: Platform.OS === 'ios' ? '#F7F7F7' : '#FFF',
    height: STATUSBAR_HEIGHT + APPBAR_HEIGHT,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },

  headerBack: {
    padding: '0.5rem'
  },

  headerBackIcon: {
    color: palette.iosBlue,
    fontSize: '1.25rem'
  },

  headerTitle: {
    color: '#000',
    paddingRight: '1rem'
  },

  footerContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    ...ifIphoneX({
      height: FOOTER_HEIGHT + 20
    }, {
      height: FOOTER_HEIGHT
    }),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },

  footerShare: {
    marginLeft: '0.25rem',
    marginTop: '0.2rem',
    padding: '0.5rem'
  },

  footerShareIcon: {
    fontSize: Platform.OS === 'ios' ? '1.9rem' : '1.5rem',
    color: palette.iosBlue
  },

  bodyContainer: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT + APPBAR_HEIGHT,
    right: 0,
    bottom: FOOTER_HEIGHT,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
