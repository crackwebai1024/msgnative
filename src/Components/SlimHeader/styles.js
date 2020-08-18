import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

export default EStyleSheet.create({
  main: {
    backgroundColor: palette.belizeHole,
    padding: '0.5rem',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem'
  },

  title: {
    color: palette.white,
    fontSize: '0.75rem',
    fontWeight: '700'
  },

  subtitle: {
    color: palette.white,
    fontSize: '0.7rem',
    fontWeight: '800'
  }
})
