import EStyleSheet from 'react-native-extended-stylesheet'

import palette from './colors'

const layoutStyles = EStyleSheet.create({
  flex: {
    flex: 1
  },

  navBar: {
    zIndex: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4rem',
    padding: '0.7rem',
    // paddingBottom: '1rem',
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },

  navBarTitleText: {
    fontSize: '1rem'
  },

  navBarActionText: {
    fontSize: '1rem',
    color: palette.link
  },

  withNavBar: {
    paddingTop: '4rem'
  },

  withTabBar: {
    // paddingBottom: '3.125rem'
  }
})

export default layoutStyles
