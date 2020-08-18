import EStyleSheet from 'react-native-extended-stylesheet'
import { ifIphoneX } from 'react-native-iphone-x-helper'

import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  container: {
    opacity: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(238, 242, 246)',
    ...ifIphoneX({
      paddingBottom: 10
    }, {})
  },

  tabItem: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },

  icon: {
    fontSize: '1.5rem',
    color: palette.midnightBlue
  },

  activeIcon: {
    color: palette.peterRiver
  },

  unreadCounter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -7,
    right: -7,
    height: 17,
    minWidth: 17,
    borderRadius: 17,
    overflow: 'hidden',
    paddingHorizontal: '0.2rem',
    backgroundColor: 'rgb(240, 75, 76)'
  },

  unreadCounterText: {
    fontSize: '0.7rem',
    color: '#fff',
    textAlign: 'center'
  }
})

export default styles
