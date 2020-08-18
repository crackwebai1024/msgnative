import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({

  dotsContainer: {
    flexDirection: 'row',
    // bottom: 80,
    justifyContent: 'center'
  },

  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    height: 8,
    width: 8,
    borderRadius: 4,
    marginLeft: '0.15rem',
    marginRight: '0.15rem'
  },

  dotActive: {
    backgroundColor: 'rgba(255, 255, 255, 1)'
  }

})
