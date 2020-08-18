import EStyleSheet from 'react-native-extended-stylesheet'
import palette from 'app/Styles/colors'

export const ListItem = EStyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  avatarOuter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 53,
    width: 60
  },

  avatarText: {
    fontSize: '0.75rem',
    fontWeight: '600'
  },

  body: {
    flex: 1,
    height: 53,
    paddingRight: '1rem',
    justifyContent: 'center'
  },

  name: {
    color: '#000',
    lineHeight: '1rem'
  },

  email: {
    lineHeight: '1rem',
    color: 'rgb(155, 155, 155)',
    fontSize: '0.8rem'
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  icon: {
    color: palette.belizeHole,
    fontSize: '1.4rem'
  },

  callAction: {
    marginRight: '0.8rem'
  },

  chatAction: {
    marginRight: '0.8rem'
  },

  disabled: {
    opacity: 0.3
  }
})
