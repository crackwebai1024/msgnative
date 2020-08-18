import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'
const styles = EStyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },

  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  verificationMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    borderTopWidth: 1,
    borderTopColor: palette.clouds
  },

  verificationMessageText: {
    fontSize: '0.75rem',
    color: palette.wetAsphalt
  },

  verificationMessageLastSentText: {
    fontSize: '0.65rem',
    marginTop: '0.5rem',
    color: palette.concrete
  },

  verificationMessageButton: {
    marginTop: '0.5rem',
    fontSize: '0.65rem',
    fontWeight: '800',
    color: palette.belizeHole,
    letterSpacing: '0.04rem'
  },

  setDefaultBlockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    paddingTop: '1rem',
    paddingBottom: '1rem',
    marginTop: '1rem'
  },

  defaultStateMessageText: {
    fontSize: '0.75rem',
    color: palette.wetAsphalt,
    textAlign: 'center',
    flexWrap: 'wrap'
  },

  setDefaultButton: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: palette.belizeHole,
    letterSpacing: '0.04rem',
    lineHeight: '1.8rem'
  },

  button: {
    width: '7.5rem',
    height: '1.8rem',
    marginTop: '1rem',
    backgroundColor: palette.clouds,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    alignItems: 'center'
  },

  buttonDisabled: {
    backgroundColor: 'rgba(242, 242, 242, 0.25)',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 0,
    shadowOpacity: 0
  },

  disabled: {
    color: palette.asbestos,
    opacity: 0.5
  }
})

export default styles
