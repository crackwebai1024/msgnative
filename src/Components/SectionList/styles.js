import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  swipeContainer: {
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  itemText: {
    color: palette.midnightBlue,
    fontSize: '0.9rem'
  },

  statusInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '2rem'
  },

  statusInfoText: {
    textAlign: 'center',
    lineHeight: '1.3rem'
  },

  editMain: {
    flex: 1
  },

  searchBar: {
    height: '2.6rem',
    backgroundColor: palette.peterRiver
  },

  errorContainer: {
    flex: 2
  },

  errorSpacer: {
    flex: 1
  },

  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  errorTextTitle: {
    color: palette.midnightBlue,
    fontWeight: '400',
    textAlign: 'center',
    fontSize: '1.2rem',
    marginLeft: '2.5rem',
    marginRight: '2.5rem',
    marginBottom: '2rem'
  },

  errorText: {
    color: palette.midnightBlue,
    fontWeight: '400',
    textAlign: 'center',
    fontSize: '1rem',
    marginLeft: '2.5rem',
    marginRight: '2.5rem'
  },

  noneTitleText: {
    color: palette.midnightBlue,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: '1.0rem',
    marginLeft: '2rem',
    marginRight: '2rem',
    marginBottom: '1.0rem'
  },

  noneBodyText: {
    color: palette.midnightBlue,
    fontWeight: '100',
    textAlign: 'center',
    fontSize: '0.8rem',
    marginLeft: '2.0rem',
    marginRight: '2.0rem',
    marginBottom: '1.0rem'
  },

  noneBodyActionText: {
    color: palette.belizeHole,
    fontSize: '0.8rem',
    fontWeight: '600'
  },

  errorAction: {
    marginTop: '1.2rem',
    marginLeft: '2.5rem',
    marginRight: '2.5rem'
  },

  errorActionText: {
    color: palette.belizeHole,
    fontSize: '0.9rem',
    fontWeight: '600'
  },

  swipeButton: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center'
  },

  swipeButtonDanger: {
    backgroundColor: 'rgb(208, 2, 27)'
  },

  swipeButtonPrimary: {
    backgroundColor: palette.peterRiver
  },

  swipeButtonDangerText: {
    color: palette.white,
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.05rem'
  },

  navBarLeftIcon: {
    marginLeft: '0.6rem'
  },

  navBarRightIcon: {
    marginRight: '0.6rem'
  },

  navBarMenuIcon: {
    fontSize: '1.6rem',
    color: palette.link
  },

  navBarMenuIconDisabled: {
    color: palette.asbestos
  },

  navBarAddIcon: {
    fontSize: '1.2rem',
    color: palette.link
  },

  navBarRightSpinner: {
    marginRight: '0.6rem'
  },

  navBarButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export const ListItemSwipe = EStyleSheet.create({
  container: {
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  button: {
    width: 70,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonPrimary: {
    backgroundColor: palette.peterRiver
  },

  buttonDanger: {
    backgroundColor: 'rgb(208, 2, 27)'
  },

  icon: {
    color: palette.white,
    fontSize: '1.5rem',
    marginBottom: '0.15rem'
  },

  text: {
    width: 60,
    color: '#fff',
    fontSize: '0.65rem',
    textAlign: 'center',
    lineHeight: '0.8rem'
  }
})

export default styles
