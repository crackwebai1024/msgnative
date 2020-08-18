import EStyleSheet from 'react-native-extended-stylesheet'
import palette from 'app/Styles/colors'

export const ListItemStyle = EStyleSheet.create({
  timestamp: {},
  callTypeContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center'
  },
  callTypeText: {
    lineHeight: '1rem',
    color: 'rgb(155, 155, 155)',
    fontSize: '0.8rem',
    marginLeft: 5
  },
  videoTypeIcon: {
    marginRight: 5
  },
  callTypeIcon: {
    lineHeight: '1rem',
    color: 'rgb(155, 155, 155)',
    fontSize: '0.8rem'
  },
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

  body: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    paddingRight: '1rem',
    justifyContent: 'center'
  },

  title: {
    color: '#000',
    lineHeight: '1rem'
  },

  icon: {
    color: palette.belizeHole,
    fontSize: '1.4rem'
  },

  deleteIconWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '0.3rem'
  },

  deleteIcon: {
    padding: '0rem',
    color: 'rgb(240, 75, 76)',
    textAlign: 'center',
    fontSize: '1.3rem',
    fontWeight: '600'
  }
})

export const ListItemSwipeStyle = EStyleSheet.create({
  container: {
    justifyContent: 'flex-end'
  }
})
