import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  headerBackground: {
    height: 170,
    paddingTop: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  headerBackgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(52, 73, 94, 0.9)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgb(151, 151, 151)',
    marginBottom: '0.25rem'
  },

  name: {
    fontSize: '1.4rem',
    fontWeight: '300',
    color: palette.white,
    backgroundColor: 'transparent',
    marginBottom: '0.25rem'
  },

  username: {
    fontSize: '0.85rem',
    color: palette.silver,
    backgroundColor: 'transparent'
  },

  planWrap: {
    position: 'absolute',
    top: 30,
    right: 20
  },

  plan: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: palette.clouds,
    backgroundColor: 'transparent',
    letterSpacing: '0.02rem'
  },

  content: {
    paddingTop: '0.2rem'
  }
})

export default styles
