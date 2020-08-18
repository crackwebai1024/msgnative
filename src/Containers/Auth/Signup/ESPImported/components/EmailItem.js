import React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { View, TouchableOpacity } from 'react-native'
import Text from 'app/Components/BaseText'
import styles from '../styles'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'

const EmailItem = ({ data, setDefaultESP, intl }) => (
  <View style={styles.emailItem}>
    <View>
      <Text style={styles.emailItemAddress}>{data.email}</Text>
      {
        data.is_default
          ? <Text style={styles.emailItemLabel}>{intl.formatMessage(m.native.Auth.primary)}</Text>
          : (
            <TouchableOpacity onPress={() => setDefaultESP(data)}>
              <Text style={[styles.emailItemLabel, styles.emailItemLabelAction]}>{intl.formatMessage(m.native.Auth.setPrimary)}</Text>
            </TouchableOpacity>
          )
      }
    </View>
    <FontAwesome name='check-circle' style={styles.emailItemButton} />
  </View>
)

export default injectIntl(EmailItem)
