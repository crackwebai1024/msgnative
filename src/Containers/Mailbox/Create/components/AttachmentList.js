import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { injectIntl } from 'react-intl'
import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'
import AttachmentItem from './AttachmentItem'
import mNative from 'commons/I18n/native'

const s = EStyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds,
    paddingHorizontal: '0.7rem',
    paddingVertical: '0.4rem'
  },

  capitialize: {
    textTransform: 'capitalize'
  },

  title: {
    color: palette.silver
  }
})

class AttachmentList extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    onItemRemove: PropTypes.func.isRequired,
    intl: PropTypes.object
  }

  render () {
    const { data, intl } = this.props
    const fm = intl.formatMessage
    if (!data.length) {
      return null
    }
    return (
      <View style={[s.container, s.capitialize]}>
        <Text style={s.title}>{fm(mNative.Mailbox.attachments)}:</Text>
        {data.map((file, index) => (
          <AttachmentItem
            {...file}
            key={file.id}
            onRemove={() => this.props.onItemRemove(file.id)}
            first={index === 0}
          />
        ))}
      </View>
    )
  }
}

export default injectIntl(AttachmentList)
