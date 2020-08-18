import React from 'react'
import { ScrollView, View, Image } from 'react-native'
import DeviceInfo from 'react-native-device-info'

import Text from 'app/Components/BaseText'
import { injectIntl } from 'react-intl'
import BaseUserView from '../_Base/index'
import styles from './styles'
import m from 'commons/I18n'

const buildJson = require('../../../../build.json')

const AboutApp = () => (
  <ScrollView contentContainerStyle={styles.contentContainer}>
    <View style={styles.mainWrapper}>
      <Image
        style={styles.logo}
        source={require('app/Images/logo_black.png')}
      />
      <Text>
        Version {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
      </Text>
      <Text>{buildJson.app.tag}</Text>
      <Text style={styles.copyRight}>
        © {new Date().getFullYear()} {buildJson.metadata.builder}
      </Text>
    </View>
  </ScrollView>
)

const IntlAboutApp = injectIntl(AboutApp)

IntlAboutApp.navigationOptions = ({ navigation, screenProps }) => ({
  title: screenProps.fm(m.native.Setting.about)
})

export default IntlAboutApp
