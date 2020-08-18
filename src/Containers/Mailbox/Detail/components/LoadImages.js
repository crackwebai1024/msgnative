import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStyleSheet.create({
  container: {
    paddingVertical: '0.75rem',
    paddingHorizontal: '1rem',
    backgroundColor: palette.clouds,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  text: {
    fontSize: '0.75rem',
    color: palette.asbestos
  },

  buttonText: {
    color: palette.belizeHole,
    textDecorationLine: 'underline'
  }
})

const MailboxDetailLoadImages = ({
  textImageBlocked,
  textLoadRemoteImages,
  onPress
}) => (
  <View style={s.container}>
    <Text style={s.text}>{textImageBlocked}</Text>
    <TouchableOpacity style={s.button} onPress={onPress}>
      <Text style={s.buttonText}>{textLoadRemoteImages}</Text>
    </TouchableOpacity>
  </View>
)

export default MailboxDetailLoadImages
