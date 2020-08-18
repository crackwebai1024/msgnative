import React from 'react'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Avatar from 'app/Components/Avatar'
import Text from 'app/Components/BaseText'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'

const s = EStyleSheet.create({
  container: {
    paddingHorizontal: '2.34rem',
    height: '18rem',
    marginTop: '2rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible'
  },

  text: {
    textAlign: 'center',
    fontSize: '1.0rem',
    lineHeight: '1.3rem',
    backgroundColor: 'transparent',
    color: 'rgba(32,48,90,0.4)'
  },

  middleContent: {
    marginTop: '2rem'
  },

  avatarContainer: {
    position: 'relative',
    width: 88
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44
  },

  avatarStatus: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: 6,
    right: 6,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgb(238, 242, 246)',
    backgroundColor: 'rgb(58, 206, 1)'
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.25rem',
    width: '7rem'
  },

  titleText: {
    color: 'rgb(0, 131, 232)',
    fontSize: '0.8rem',
    backgroundColor: 'transparent',
    textAlign: 'center'
  }
})

const EphemeralEarlierMessage = ({
  connected, contact, intl
}) => (
  <View style={s.container}>
    <View style={s.avatarContainer}>
      <Avatar email={contact.email} avatarStyle={s.avatar} name={contact.display_name} />
      {connected && <View style={s.avatarStatus} /> }
    </View>
    <View style={s.titleContainer}>
      <Text style={s.titleText}>{intl.formatMessage(m.native.Chat.availableForChat, { name: contact.display_name })}</Text>
    </View>
    <View style={s.middleContent}>
      <Text style={s.text}>
        {intl.formatMessage(m.native.Chat.ephemeralChatMessage)}
      </Text>
      <Text style={s.text}>
        {intl.formatMessage(m.native.Chat.ephemeralChatMessage1)}
      </Text>
    </View>
  </View>
)

export default injectIntl(EphemeralEarlierMessage)
