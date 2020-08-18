import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white'
  },

  main: {
    paddingBottom: '3.125rem'
  },

  // Sections
  section: {
    alignSelf: 'stretch'
  },

  sectionHeader: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: palette.clouds,
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds,
    backgroundColor: '#f9f9f9'
  },

  sectionHeaderLink: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  sectionHeaderLinkText: {
    color: palette.silver,
    fontSize: '0.75rem',
    fontWeight: '800'
  },

  sectionHeaderLinkIcon: {
    marginLeft: '0.25rem',
    color: palette.silver,
    fontSize: '0.65rem'
  },

  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center'

  },

  sectionTitleText: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: palette.asbestos,
    textAlign: 'center'
  },

  sectionContent: {
    // marginTop: '1.1rem',
  },

  sectionAction: {
    marginTop: '1rem'
  },

  sectionActionText: {
    fontSize: '0.85rem',
    color: palette.midnightBlue,
    textAlign: 'center'
  },

  sectionActionLink: {
    marginTop: '0.7rem'
  },

  sectionActionLinkText: {
    color: palette.link,
    fontSize: '0.8rem',
    textAlign: 'center'
  },

  activityIndicator: {
    marginTop: '3rem',
    marginBottom: '3rem'
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: palette.clouds
  },

  noItemsMessage: {
    padding: '1.7rem'
  },

  noItemsMessageText: {
    color: palette.silver,
    fontSize: '0.75rem',
    fontWeight: '700',
    textAlign: 'center'
  }
})

export default styles
