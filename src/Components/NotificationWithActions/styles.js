import EStyleSheet from 'react-native-extended-stylesheet'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import palette from 'app/Styles/colors'

const colorMap = {
  danger: {
    backColor: palette.tomato,
    foreColor: palette.white
  },
  alert: {
    backColor: '#f2dbd8',
    foreColor: '#b13843'
  },
  warning: {
    backColor: '#fff3d9',
    foreColor: '#8c6a39'
  },
  success: {
    backColor: '#def0d7',
    foreColor: '#3d7b37'
  },
  info: {
    backColor: '#d8edf7',
    foreColor: palette.ceruleanBlue
  }
}

export const populateContainerStyle = type => EStyleSheet.create({
  errorContainer: {
    backgroundColor: colorMap[type].backColor
  },

  errorText: {
    color: colorMap[type].foreColor
  },

  primary: {
    height: 45,
    borderRadius: 3,
    backgroundColor: palette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.15
  },

  primaryText: {
    color: colorMap[type].foreColor == palette.white ? colorMap[type].backColor : colorMap[type].foreColor,
    letterSpacing: '0.15rem'
  },

  secondary: {
    height: '1rem',
    marginLeft: '1rem'
  },

  secondaryText: {
    color: colorMap[type].foreColor,
    marginLeft: 0,
    marginRight: 0
  }
})

export default EStyleSheet.create({
  errorText: {
    marginRight: '1.3rem',
    fontSize: 15
  },

  errorContainer: {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingBottom: '1rem',
    ...ifIphoneX({
      paddingTop: '2.7rem'
    }, {
      paddingTop: '1.7rem'
    })
  },

  closeButtonContainer: {
    position: 'absolute',
    right: '-0.5rem',
    top: 0
  },

  closeButton: {
    zIndex: 100
  },

  closeButtonText: {
    fontSize: '1.6rem',
    fontWeight: '400'
  },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '1rem'
  },

  actionButtonBase: {
    // height: 45,
    // borderRadius: 3,
    // shadowColor: '#000',
    // borderWidth: 1,
    // borderColor: 'rgba(0,0,0,0.15)',
    // shadowOffset: {width: 0, height: 4},
    // shadowRadius: 8,
    // shadowOpacity: 0.15,
    alignItems: 'center'
  },

  actionButtonInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },

  actionButtonTextBase: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    // letterSpacing: '0.15rem',
    alignSelf: 'center',
    marginLeft: '1rem',
    marginRight: '1rem'
  }
})
