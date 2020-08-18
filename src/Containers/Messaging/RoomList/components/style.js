import EStyleSheet from 'react-native-extended-stylesheet'

export const ListItemStyle = EStyleSheet.create({
  timestamp: {},

  unreadCount: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  unreadCountInner: {
    padding: '0.1rem',
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

export const ListItemSwipeStyle = EStyleSheet.create({
  container: {
    justifyContent: 'flex-end'
  }
})
