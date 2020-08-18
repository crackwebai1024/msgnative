import EStyleSheet from 'react-native-extended-stylesheet'

const styles = EStyleSheet.create({
  swiper: {
    flex: 1,
    width: '100%'
  },

  closeButtonContainer: {
    alignItems: 'flex-end'
  },

  closeButton: {
    zIndex: 100,
    marginRight: '0.8rem'
  },

  closeButtonText: {
    color: '#C8CCD5',
    fontSize: '1.6rem',
    fontWeight: '400'
  },

  slide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '1.3rem',
    paddingRight: '1.3rem',
    paddingBottom: '4rem'
  },

  textContainer: {
    marginTop: '1rem'
  },

  titleText: {
    marginTop: '2rem',
    color: 'rgb(0, 131, 232)',
    fontSize: '1.6rem',
    textAlign: 'center'
  },

  descriptionText: {
    marginTop: '1.3rem',
    color: 'rgb(32, 48, 90)',
    fontSize: '1rem',
    textAlign: 'center'
  },

  smallHelperText: {
    color: 'rgba(32,48,90, 0.6)',
    fontSize: '0.8rem'
  },

  image: {
    width: '35%',
    maxHeight: 130,
    resizeMode: 'contain',
    zIndex: 999
  },

  imageE2EE: {
    width: '70%'
  },

  imageEphemeral: {
    width: '55%'
  },

  imageLogo: {
    width: '45%',
    marginTop: '1rem'
  },

  navButtonText: {
    color: 'rgba(32, 48, 90, 0.25)',
    fontSize: '2.5rem',
    paddingTop: '0.3rem',
    paddingHorizontal: '0.5rem'
  },

  button: {
    backgroundColor: 'rgb(0, 131, 232)',
    paddingTop: '0.8rem',
    paddingBottom: '0.8rem',
    paddingLeft: '1.8rem',
    paddingRight: '1.8rem',
    borderRadius: 5,
    marginTop: '3rem'
  },

  buttonText: {
    fontSize: '0.7rem',
    color: 'white',
    fontWeight: '900',
    letterSpacing: '0.05rem'
  }
})

export default styles
