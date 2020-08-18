import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  plainButtonText: {
    paddingLeft: '0.7rem',
    paddingRight: '0.7rem',
    paddingTop: '0.2rem',
    paddingBottom: '0.2rem',
    fontWeight: '600'
  },

  disabled: {
    color: palette.asbestos
  }
})

export default styles
