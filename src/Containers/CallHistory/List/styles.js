import EStyleSheet from 'react-native-extended-stylesheet'

const styles = EStyleSheet.create({
  tabs: {
    flexDirection: 'row'
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '0.4rem',
    paddingTop: '0.4rem',
    borderBottomColor: 'transparent',
    borderBottomWidth: 4,
    backgroundColor: 'white'
  },

  tabActive: {
    borderBottomColor: 'rgb(0, 131, 232)'
  },

  tabText: {
    fontSize: '0.75rem',
    color: 'rgb(32, 48, 90)',
    fontWeight: '800'
  }
})

export default styles
