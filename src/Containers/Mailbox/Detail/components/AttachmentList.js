import React from 'react'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import { View, TouchableOpacity } from 'react-native'
import { withStateHandlers, branch, renderNothing, compose } from 'recompose'
import Text from 'app/Components/BaseText'
import styles from '../styles'
import AttachementItem from './AttachmentItem'

const MailboxAttachmentList = ({
  attachmentContentIds,
  attachments,
  contentVisible,
  toggleContentVisibility,
  intl: { formatMessage }
}) => (
  <View style={styles.sectionMain}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionMessage}>
        {attachments.length} {formatMessage(m.native.Mailbox.attachments).toUpperCase()}
      </Text>
      <TouchableOpacity onPress={toggleContentVisibility}>
        <Text style={[styles.sectionMessage, styles.sectionAction]}>
          { contentVisible ? formatMessage(m.native.Mailbox.hide).toUpperCase() : formatMessage(m.native.Mailbox.show).toUpperCase() }
        </Text>
      </TouchableOpacity>
    </View>
    {
      contentVisible && <View style={styles.sectionContent}>
        {attachmentContentIds.map(id => (
          <AttachementItem
            key={id}
            data={attachments[id]}
          />
        ))}
      </View>
    }
  </View>
)

const hideIfNoData = hasNoData => branch(hasNoData, renderNothing)

export default compose(
  hideIfNoData(({ attachmentContentIds }) => !attachmentContentIds || !attachmentContentIds.length),
  withStateHandlers(
    { contentVisible: false }, {
      toggleContentVisibility: ({ contentVisible }) => () => ({
        contentVisible: !contentVisible
      })
    }
  ),
  injectIntl
)(MailboxAttachmentList)
