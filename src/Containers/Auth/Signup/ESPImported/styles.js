import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const divider = {
  borderTopColor: 'rgb(211, 214, 219)',
  borderTopWidth: 0.5
}

export default EStyleSheet.create({
  container: {
    // marginTop: '1.2rem'
    flex: 1
    // backgroundColor: 'rgb(211, 214, 219)'
  },

  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  emailSectionDivider: divider,
  disabledButtonOpacity: {
    opacity: 0.3
  },
  emailSection: {
    backgroundColor: '#F7F7F7',
    paddingLeft: '0.8rem',
    paddingRight: '0.8rem',
    borderBottomColor: 'rgb(211, 214, 219)',
    borderBottomWidth: 1
  },

  emailSectionTitle: {
    fontSize: '0.88888888rem',
    paddingTop: '0.7rem',
    paddingBottom: '0.7rem'
  },

  emailItem: {
    paddingTop: '0.4rem',
    paddingBottom: '0.4rem',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...divider
  },

  emailItemLabel: {
    fontSize: '0.7rem',
    color: 'rgb(19, 133, 229)',
    fontWeight: '500'
  },

  emailItemLabelAction: {
    textDecorationLine: 'underline'
  },

  emailItemDescription: {
    marginTop: '0.5rem',
    marginBottom: '0.1rem',
    fontSize: '0.65rem',
    color: 'rgb(38, 38, 38)'
  },

  emailItemAddress: {
    marginTop: '0.2rem',
    fontSize: '0.8rem',
    color: 'rgb(74, 78, 85)',
    fontWeight: '500'
  },

  emailItemButton: {
    color: 'rgb(97, 149, 240)',
    fontSize: '1.2rem'
  },

  addEmail: {
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  addEmailText: {
    fontSize: '0.8rem',
    color: 'rgb(19, 133, 229)',
    fontWeight: '500'
  },

  addEmailField: {
    width: '85%',
    height: '2rem',
    padding: 0,
    borderBottomColor: palette.skyBlue,
    borderBottomWidth: 1,
    fontSize: '0.8rem'
  },

  addEmailError: {
    color: palette.pomegranate,
    fontSize: '0.75rem'
  },

  addEmailAction: {
    paddingTop: '.8rem'
  },

  addEmailButtonIcon: {
    color: 'rgb(97, 149, 240)',
    fontSize: '1.2rem'
  },

  advantagesSection: {
    padding: '0.9rem',
    marginRight: '0.8rem'
  },

  advantagesSectionTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'rgb(95, 102, 118)',
    marginBottom: '0.4rem'
  },

  advantagesPoint: {
    marginTop: '0.25rem',
    flexDirection: 'row'
  },

  advantagesPointText: {
    color: 'rgb(95, 102, 118)',
    fontSize: '0.8rem',
    fontWeight: '500'
  },

  advantagesPointIcon: {
    fontSize: '0.7rem',
    marginLeft: '0.25rem',
    marginRight: '0.25rem',
    color: palette.turquoise
  },

  advantagesBottomText: {
    marginTop: '0.8rem'
  },

  advantagesTopText: {
    marginTop: '0.8rem',
    marginBottom: '0.8rem'
  }

})
