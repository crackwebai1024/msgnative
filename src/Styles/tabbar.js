import EStyleSheet from 'react-native-extended-stylesheet'
import { ifIphoneX } from 'react-native-iphone-x-helper'

import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  main: {
    backgroundColor: 'rgb(238, 242, 246)',
    ...ifIphoneX({
      paddingBottom: '1rem',
      height: '4rem'
    }, {})
  },

  icon: {
    fontSize: '1.5rem',
    color: palette.midnightBlue
  },

  iconActive: {
    color: palette.belizeHole
  },

  iconDisabled: {
    color: palette.concrete
  }
})

export default styles
