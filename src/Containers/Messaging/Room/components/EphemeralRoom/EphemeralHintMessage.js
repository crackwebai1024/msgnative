import React from 'react'
import { View } from 'react-native'
import { injectIntl } from 'react-intl'

import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/Ionicons'

import Text from 'app/Components/BaseText'
import m from 'commons/I18n'

const s = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '2rem',
    paddingBottom: '2rem'
  },

  text: {
    fontSize: '0.9rem',
    lineHeight: '1.15rem',
    textAlign: 'center',
    color: '#79bbee',
    letterSpacing: -0.1
  },

  icon: {
    opacity: 1,
    color: '#79bbee',
    marginBottom: '1rem'
  },

  terminatedStatus: {
    backgroundColor: 'rgba(232, 240, 247, 0.8)'
  }
})

const EphemeralHintMessage = ({ e2eeTerminated, intl }) => {
  const fm = intl.formatMessage

  return (
    <View style={[s.container, e2eeTerminated && s.terminatedStatus]}>
      <Icon name='ios-warning' style={s.icon} size={30} />
      <Text style={s.text}>
        {fm(m.native.Chat.ephemeralDisabledNotice)}
      </Text>
    </View>
  )
}

export default injectIntl(EphemeralHintMessage)
