import EStyleSheet from 'react-native-extended-stylesheet'

const styles = EStyleSheet.create({
  contentContainer: {
    flexGrow: 1
  },

  mainWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  logo: {
    width: 180,
    height: 64,
    resizeMode: 'contain'
  },

  copyRight: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '400'
  }
})

export default styles
