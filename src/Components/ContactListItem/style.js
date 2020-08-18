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
    height: 40,
    width: 40
  },

  avatarText: {
    fontSize: '0.75rem',
    fontWeight: '600'
  },

  avatarStatus: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: -1,
    right: -1,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgb(238, 242, 246)',
    backgroundColor: 'rgb(58, 206, 1)'
  },

  body: {
    flex: 1,
    height: 40,
    marginLeft: 10,
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

  icon: {
    color: palette.belizeHole,
    fontSize: '1.4rem'
  },

  timestamp: {
    flex: 4
  },

  unreadCount: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  unreadCountInner: {
    padding: '0.1rem',
    left: 10,
    borderRadius: 20,
    minWidth: 21,
    backgroundColor: 'rgb(240, 75, 76)',
    overflow: 'hidden'
  },

  unreadCountText: {
    padding: '0rem',
    color: '#fff',
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: '600'
  }
})
