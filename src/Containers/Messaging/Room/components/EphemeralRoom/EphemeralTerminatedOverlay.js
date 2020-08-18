import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, Image, TouchableHighlight } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import Avatar from 'app/Components/Avatar'
import DancingBubble from 'app/Components/Loading/DancingBubble'
import Text from 'app/Components/BaseText'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import palette from 'app/Styles/colors'
import { HEADER_HEIGHT } from '../../constants'

const s = EStyleSheet.create({
  container: {
    paddingHorizontal: '2.34rem',
    height: '100% - 120',
    // paddingBottom: '25rem',
    // marginBottom: -70,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 240, 247, 0.8)',
    // position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 11
  },

  smallText: { //
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'rgb(121, 187, 238)',
    lineHeight: '1rem',
    marginTop: '2rem',
    backgroundColor: 'transparent'
  },

  unlinkIcon: { //
    width: '3.15rem',
    height: '3.15rem',
    marginTop: '2rem'
  },

  terminatedText: { //
    marginTop: '2rem',
    color: 'rgb(0, 131, 232)'
  },

  buttonContent: { //
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },

  buttonText: { //
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    letterSpacing: '0.15rem',
    alignSelf: 'center'
  },

  button: { //
    width: '11.5rem',
    height: '3rem',
    marginTop: '4rem',
    backgroundColor: palette.ceruleanBlue,
    shadowColor: '#000',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.15,
    alignItems: 'center'
  }
})

const EphemeralTerminatedOverlay = ({ turnOffE2ee, intl }) => (
  <View style={s.container}>
    <Image source={require('app/Images/icons/unlink.png')} style={s.unlinkIcon} />
    <Text style={[s.smallText, s.terminatedText]}>
      {intl.formatMessage(m.native.Chat.connectTerminated)}
    </Text>
    <TouchableHighlight
      underlayColor='rgba(255, 255, 255, 0.1)'
      activeOpacity={0.8}
      style={s.button}
      onPress={turnOffE2ee}
    >
      <View style={s.buttonContent}>
        <Text style={s.buttonText}>{intl.formatMessage(m.native.Chat.confirmEphemeralTerminated)}</Text>
      </View>
    </TouchableHighlight>
  </View>
)

export default injectIntl(EphemeralTerminatedOverlay)
