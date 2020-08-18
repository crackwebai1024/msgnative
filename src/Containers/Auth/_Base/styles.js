import EStyleSheet from 'react-native-extended-stylesheet'
import palette from 'app/Styles/colors'

export default EStyleSheet.create({
  main: {
    flexDirection: 'column'
  },

  $darkColor: '#34495e',
  $lightColor: '#FFFFFF',

  background: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },

  authBackgroundOverlay: {
    position: 'absolute',
    height: 497,
    top: 71
  },

  backgroundOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.68)'
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '2.5rem',
    paddingBottom: '1rem'
  },

  signUpButton: {
    color: '#0083E8'
  },

  horizontalRuleContainer: {
    display: 'flex',
    flexDirection: 'row'
  },

  horizontalRule: {
    borderBottomColor: 'rgba(255, 255, 255, 0.18)',
    borderBottomWidth: 1,
    width: 18,
    marginTop: '1.5rem',
    marginBottom: '1.5rem'
  },

  horizontalRuleText: {
    backgroundColor: 'transparent',
    color: '#FFF',
    fontSize: 15,
    paddingTop: '0.9rem'
    // fontWeight: 'bold'
  },

  authFieldContainer: {
    width: '84%'
  },

  onboardingFieldWrapper: {
    marginTop: '1.5rem'
  },

  loginFieldWrapper: {
    marginTop: '2.2rem'
  },

  iconInputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.18)',
    borderBottomWidth: 1
  },

  iconInputContainerFocused: {
    borderBottomColor: palette.white
  },

  iconStyle: {
    textAlign: 'center',
    width: '2rem',
    color: 'rgba(255,255,255,0.4)',
    backgroundColor: 'transparent'
  },

  iconStyleFocused: {
    color: palette.white
  },

  form: {
    flex: 1,
    marginTop: '3rem',
    justifyContent: 'center',
    alignItems: 'center',
    width: '85%'
  },

  loginForm: {
    marginTop: '1rem'
  },

  textInput: {
    zIndex: 3,
    padding: 0,
    backgroundColor: 'transparent',
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: '0.55rem',
    paddingBottom: '0.55rem',
    paddingRight: '0.5rem',
    paddingLeft: '0.2rem',
    flex: 1
  },

  textInputLight: {
    fontSize: 15,
    color: '#FFF',
    // borderRadius: '0.4rem',
    fontWeight: '500'
  },

  textInputError: {
    color: palette.tomato
  },

  buttonLogin: {
    marginTop: 0
  },

  button: {
    width: '65%',
    height: 45,
    marginTop: '2.7rem',
    backgroundColor: palette.ceruleanBlue,
    shadowColor: '#000',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.15,
    alignItems: 'center'
  },

  buttonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },

  disabledButtonOpacity: {
    opacity: 0.5
  },

  buttonAlt: {
    backgroundColor: 'rgba(255, 255, 255, 1)'
  },

  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },

  buttonSpinner: {
    // marginLeft: '0.5rem',
    // alignSelf: 'center'
  },

  buttonText: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    letterSpacing: '0.15rem',
    alignSelf: 'center'
  },

  buttonTextAlt: {
    color: 'rgba(0, 0, 0, 0.7)'
  },

  buttonTextActive: {
    color: palette.silver
  },

  buttonTextDisabled: {
    color: palette.silver
  },

  altMessage: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: '3.5rem',
    backgroundColor: 'transparent'
  },

  altMessageLessTopMargin: {
    marginTop: '3rem'
  },

  altMessageText: {
    color: 'white',
    fontSize: '1rem'
  },

  altMessageSignUp: {
    textDecorationStyle: 'solid',
    fontSize: '1.3rem',
    fontWeight: '500',
    color: palette.ceruleanBlue,
    backgroundColor: 'transparent'
  },

  altMessageTextUnderlined: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: palette.white
  },

  altMessageNear: {
    marginTop: '3rem'
  },

  belowButtonMessage: {
    marginTop: '1.5rem',
    fontWeight: '600',
    fontSize: '0.8rem',
    backgroundColor: 'transparent',
    color: palette.ceruleanBlue
  },

  $iconSize: '0.8rem',

  spinnerAnimatedContainer: {
    height: '$iconSize',
    width: '$iconSize',
    // alignSelf: 'flex-end',
    marginLeft: '0.5rem',
    alignSelf: 'center'
  },

  spinnerIcon: {
    height: '$iconSize',
    width: '$iconSize',
    fontSize: '$iconSize',
    color: '#fff'
  },

  error: {
    maxWidth: '90%',
    backgroundColor: '#e74c3c',
    padding: '0.5rem',
    paddingLeft: '0.7rem',
    paddingRight: '0.7rem',
    borderRadius: '0.2rem',
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center'
  },

  fieldErrorContainer: {
    zIndex: 2,
    top: '-0.1rem',
    padding: '0.8rem',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: palette.tomato
  },

  fieldError: {
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '0.5rem',
    marginTop: '0.1rem',
    marginRight: '0.5rem'
  },

  fieldErrorIcon: {
    color: '#fff'
  },

  initialScreenTopTextContainer: {
    width: '72%',
    marginTop: '3rem',
    alignSelf: 'center',
    alignItems: 'center'
  },

  initialScreenTopText: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontWeight: '600',
    fontSize: '1.2rem',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },

  pageTitleText: {
    width: '85%',
    color: '#fff',
    fontSize: '1.1rem',
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontWeight: '600'
  },

  fieldHelpText: {
    color: 'rgba(121, 187, 238, 100)',
    fontSize: '0.97rem',
    backgroundColor: 'transparent',
    marginTop: '1rem',
    marginLeft: '2.2rem',
    fontWeight: '400'
    // letterSpacing: '0.02rem'
  },

  signupScreenLogo: {
    height: 40,
    maxWidth: 150,
    alignSelf: 'flex-start'
  },

  signupScreenButton: {
    marginTop: 0
  },

  termsPrivacyContainer: {
    position: 'absolute',
    bottom: 0
  },
  langSelectionContainer: {
    position: 'absolute',
    top: '1.5rem',
    right: '0.5rem',
    zIndex: 3
  },
  langSelection: {
    color: palette.touchofgray,
    fontSize: '1.1rem',
    backgroundColor: 'transparent',
    fontWeight: '500',
    zIndex: 3,
    // borderColor: palette.touchofgray,
    // borderWidth: 1,
    padding: 8
  }
})
