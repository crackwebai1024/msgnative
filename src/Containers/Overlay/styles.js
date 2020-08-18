import EStyleSheet from 'react-native-extended-stylesheet'
import { ifIphoneX } from 'react-native-iphone-x-helper'

export const overlayStyles = {
  container: {
    backgroundColor: 'rgba(32, 48, 90, 0.8)'
  },

  childrenWrapper: {
    flex: 1,
    backgroundColor: 'white',
    padding: 0,
    ...ifIphoneX({
      marginTop: 30,
      marginBottom: 30
    }, {}),
    borderRadius: 8
  }
}

export const styles = EStyleSheet.create({

})
