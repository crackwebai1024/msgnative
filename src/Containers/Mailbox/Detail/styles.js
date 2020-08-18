import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'

export default EStyleSheet.create({

  sectionMain: {
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds
  },

  sectionMainWithTopBorder: {
    borderTopWidth: 1,
    borderTopColor: palette.clouds
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: '0.6rem',
    paddingBottom: '0.6rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },

  sectionMessage: {
    fontSize: '0.9rem',
    lineHeight: '1.5rem',
    fontWeight: '700',
    color: palette.asbestos
  },

  sectionAction: {
    fontSize: '0.85rem',
    color: palette.belizeHole
  },

  sectionContent: {
    // marginTop: '0.5rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },

  attachment: {
    marginTop: '0.2rem',
    marginBottom: '0.7rem'
  },

  attachmentFilename: {
    flexDirection: 'row',
    alignItems: 'center'
    // justifyContent: 'center',
  },

  attachmentFilenameText: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: palette.wetAsphalt,
    marginLeft: '0.4rem'
  },

  attachmentFilenameIcon: {
    fontSize: '0.75rem'
  },

  attachmentAction: {
    fontWeight: '800',
    fontSize: '0.72rem',
    color: palette.belizeHole,
    marginLeft: '0.5rem'
  },

  attachmentContent: {
    marginTop: '0.5rem',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    alignItems: 'center'
  },

  textAttachment: {
    marginTop: '0.7rem',
    borderWidth: 1,
    padding: '0.6rem',
    borderColor: palette.clouds
  },

  textAttachmentText: {
    fontSize: '0.8rem'
  }
})
