import EStyleSheet from 'react-native-extended-stylesheet'
import palette from 'app/Styles/colors'

export default EStyleSheet.create({

  container: {
    alignItems: 'center',
    marginTop: '1.2rem',
    width: '100%',
    maxWidth: '100%'
  },

  dots: {
    marginTop: '3rem'
  },

  fieldHelpText: {
    color: 'rgba(121, 187, 238, 100)',
    fontSize: '1rem',
    lineHeight: '1.25rem',
    backgroundColor: 'transparent',
    marginTop: '2.5rem',
    width: '86%',
    fontWeight: '400',
    textAlign: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    letterSpacing: '0.019rem'
  },

  fieldHelpTextHighlighted: {
    color: palette.white,
    marginTop: '0.1rem'
  }
})
