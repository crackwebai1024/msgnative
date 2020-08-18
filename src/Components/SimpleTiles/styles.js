import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

export default EStyleSheet.create({
  tilesContainer: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '1 rem',
    backgroundColor: '#f9f9f9'
  },

  tilesContainerTitle: {
    flexDirection: 'row',
    marginLeft: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },

  tilesContainerTitleText: {
    color: palette.asbestos,
    fontWeight: '800',
    fontSize: '0.6rem',
    marginLeft: '0.2rem'
  },

  tilesContainerTitleIcon: {
    fontSize: '0.6rem',
    color: palette.asbestos
  },

  tilesGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: '0.2rem',
    paddingRight: '0.2rem'
  },

  tile: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
    marginLeft: '0.3rem',
    marginRight: '0.2rem',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: palette.silver,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1
    }
  },

  tileContent: {
    paddingTop: '0.8rem',
    paddingBottom: '0.8rem',
    alignItems: 'center'
  },

  tileDesc: {
    color: palette.asbestos,
    fontSize: '0.75rem'
  },

  tileValue: {
    marginTop: '0.2rem',
    marginLeft: '0.2rem',
    color: palette.wetAsphalt,
    fontSize: '0.8rem',
    textAlign: 'center'
  },

  tileFooter: {
    flex: 1,
    flexGrow: 1,
    alignSelf: 'stretch',
    padding: '0.2rem',
    paddingLeft: '0.4rem',
    paddingRight: '0.4rem',
    backgroundColor: palette.peterRiver
  },

  tileFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  tileFooterButtonText: {
    fontSize: '0.55rem',
    color: 'white',
    fontWeight: '900'
  },

  tileFooterButtonIcon: {
    fontSize: '0.45rem',
    color: 'white'
  }
})
