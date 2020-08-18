import React from 'react'
import { View, Platform, Button, TouchableOpacity } from 'react-native'
import { HeaderBackButton } from 'react-navigation'

import Text from 'app/Components/BaseText'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import styles from './styles'

const HeaderButton = ({
  title, onPress, color, isBack, intl, networkOnline, disabled = false, ...props
}) => {
  // Return react-navigation's back button component if –
  // isBack is true OR it's android and there's no or 'cancel' title
  if (isBack || ((!title || title === intl.formatMessage(m.app.Common.cancel)) && Platform.OS === 'android')) {
    if (Platform.OS === 'android') {
      return <HeaderBackButton title={title} onPress={onPress} {...props} />
    }

    return (
      <View {...props}>
        <HeaderBackButton title={title} onPress={onPress} {...props} />
      </View>
    )
  }

  if (Platform.OS === 'ios') {
    return <Button title={title} onPress={onPress} color={color} disabled={disabled || !networkOnline} />
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || !networkOnline} {...props}>
      <Text style={[styles.plainButtonText, { color }, disabled || !networkOnline ? styles.disabled : null]}>
        {title.toUpperCase()}
      </Text>
    </TouchableOpacity>
  )
}

export default injectIntl(withNetworkState(HeaderButton))
