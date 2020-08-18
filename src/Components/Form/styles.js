import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

export const commonStyles = EStyleSheet.create({
  label: {
    // marginLeft: '0.7rem',
    fontSize: '0.9rem',
    color: '#7f8c8d'
  },

  labelError: {
    color: palette.pomegranate
  },

  labelSuccess: {
    color: 'green'
  },

  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  labelButton: {
    // marginRight: '0.7rem',
  },

  labelButtonText: {
    color: palette.link,
    fontSize: '0.9rem'
  },

  noBottom: {
    borderBottomWidth: 0
  }
})

export const inputStyles = EStyleSheet.create({
  container: {
    padding: '0.7rem',
    paddingTop: '0.8rem',
    paddingBottom: '0.2rem',
    borderBottomColor: palette.clouds,
    borderBottomWidth: 1,
    backgroundColor: palette.white
  },

  inputWrapper: {
    // borderBottomColor: palette.clouds,
    // borderBottomWidth: 1,
    zIndex: -1,
    flexDirection: 'row',
    display: 'flex'
  },

  input: {
    minHeight: '2.5rem',
    paddingTop: '0.1rem',
    fontSize: '0.9rem',
    zIndex: -1,
    flex: 1
  },

  inputDisabled: {
    color: palette.concrete
  },

  inputMultiLine: {
    minHeight: '5.0rem',
    fontSize: '0.9rem'
  },

  inputMultiLineLarge: {
    minHeight: '3rem',
    paddingTop: '0.5rem',
    paddingBottom: '2.5rem'
  },

  inputAutoExpanding: {
    textAlignVertical: 'top' // android-only style
  }
})

export const selectionStyles = EStyleSheet.create({
  container: {
    padding: '0.7rem',
    paddingTop: '0.8rem',
    paddingBottom: '0.9rem',
    borderBottomColor: palette.clouds,
    borderBottomWidth: 1,
    backgroundColor: palette.white
  },

  item: {
    color: '#0271FE',
    fontSize: '0.9rem',
    marginTop: '0.55rem'
  }
})

export const switchStyles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.7rem',
    borderBottomColor: palette.clouds,
    borderBottomWidth: 1,
    backgroundColor: palette.white
  },

  textContainer: {
    flex: 1
  },

  text: {
    fontSize: '0.9rem',
    color: '#2c3e50',
    lineHeight: '1.2rem'
  },

  smallText: {
    fontSize: '0.9rem'
  },

  helpText: {
    marginTop: '0.3rem',
    fontSize: '0.9rem',
    color: '#7f8c8d'
  },

  // Add top and bottom margin to take more space
  // to compensate for the presence of 2 lines of helpText
  // Otherwise the entire section can move up and down based on
  // changing height of the text.
  // Use case – see the on and off help text for "Active" field
  // in contact edit screen
  spaceySwitch: {
    marginTop: '0.65rem',
    marginBottom: '0.65rem',
    marginLeft: '1.5rem'
  }
})

export const formSectionStyles = EStyleSheet.create({
  title: {
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '0.5rem',
    paddingTop: '2rem',
    color: palette.concrete
  }
})
