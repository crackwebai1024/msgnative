import EStyleSheet from 'react-native-extended-stylesheet'
// import palette from 'app/Styles/colors'

const base = {
  color: '#fff',
  backgroundColor: 'transparent'
}

export default EStyleSheet.create({

  content: {
    marginTop: '1.5rem',
    alignItems: 'center',
    width: '100%'
  },

  hiUserText: {
    ...base,
    fontSize: '1rem',
    width: '85%',
    fontWeight: '700',
    letterSpacing: '0.06rem',
    textAlign: 'center'
  },

  welcomeText: {
    ...base,
    marginTop: '0.05rem',
    fontSize: '1.2rem',
    textAlign: 'center'
  },

  permissionsText: {
    ...base,
    fontSize: '0.95rem',
    marginTop: '1.5rem',
    lineHeight: '1.05rem',
    maxWidth: '15rem',
    textAlign: 'center',
    fontWeight: '600'
  },

  bottomContainer: {
    marginTop: '8rem'
  },

  bottomAction: {
    ...base,
    fontSize: '0.8rem',
    marginTop: '1.5rem',
    lineHeight: '1.05rem',
    maxWidth: '15rem',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: '1rem'
  }

})
