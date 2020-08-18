import EStyleSheet from 'react-native-extended-stylesheet'

const styles = EStyleSheet.create({

  horizontalAlign: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  deleteContainer: {
    marginTop: '1rem',
    backgroundColor: 'white',
    height: '2rem'
  },

  deleteEntity: {
    color: 'red',
    marginLeft: '3rem',
    paddingTop: '0.5rem'
  }

})

export default styles
