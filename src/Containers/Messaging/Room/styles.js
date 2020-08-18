import EStyleSheet from 'react-native-extended-stylesheet'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  isTypingMessage: {
    marginTop: '0.4rem',
    marginLeft: '0.5rem',
    marginBottom: '0.2rem',
    color: palette.concrete
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f5f8',
    ...ifIphoneX({ // safe area view when iphone x
      paddingBottom: 35
    }, {
      paddingBottom: 0
    })
  },

  background: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  }
})

export default styles
