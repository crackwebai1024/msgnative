import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import Text from 'app/Components/BaseText'

import styles from '../styles'

export default injectIntl(({ intl, messageKey = m.app.Common.loadingEllipses }) => (
  <View style={styles.footerSpinner}>
    <ActivityIndicator />
    <Text style={styles.footerSpinnerText}>{intl.formatMessage(messageKey).toUpperCase()}</Text>
  </View>
))
