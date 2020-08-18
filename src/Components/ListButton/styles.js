import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

export default EStyleSheet.create({
  main: {
    height: 48,
    paddingHorizontal: '1.5rem',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: palette.clouds,
    borderBottomWidth: 1
  },

  text: {
    color: palette.wetAsphalt,
    fontSize: '1rem',
    fontWeight: '600'
  }

})
