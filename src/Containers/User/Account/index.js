import React, { PureComponent } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { isEmpty, isNil, path } from 'ramda'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import Octicons from 'react-native-vector-icons/Octicons'
import LinearGradient from 'react-native-linear-gradient'
import OpenSettings from 'react-native-open-settings'

import UserActions from 'commons/Redux/UserRedux'

import Avatar from 'app/Components/Avatar'
import Text from 'app/Components/BaseText'
import ListButton from 'app/Components/ListButton'
import ListButtonGroup from 'app/Components/ListButtonGroup'
import { FormSectionTitle } from 'app/Components/Form/Common'

import BaseUserView from '../_Base/index'
import styles from './styles'
import m from 'commons/I18n'

const GRADIENT_COLORS = ['#000', `#3d6098`]

class UserAccount extends PureComponent {
  componentWillMount () {
    const { refreshProfile } = this.props
    if (!refreshProfile) return

    return new Promise((resolve, reject) => this.props.refreshProfile({}, resolve, reject))
  }

  _renderPlanLabel () {
    const { userdata, navigation } = this.props
    const planName = userdata.plan_name || ''
    const label = (
      <Text style={styles.plan}>
        {planName.toUpperCase()}
      </Text>
    )

    if (this.props.userdata.plan_name === 'premium') {
      return label
    }

    return (
      <TouchableOpacity onPress={() => navigation.navigate('UpgradePlan')}>
        {label}
      </TouchableOpacity>
    )
  }

  render () {
    const {
      userdata, sumESP, sumDomains, sumContact, sumIdentity, logout, intl
    } = this.props
    const navigate = this.props.navigation.navigate
    const fm = intl.formatMessage
    if (isEmpty(userdata) || isNil(userdata)) {
      return null
    }

    return (
      <BaseUserView navBarVisible={false}>
        <View style={styles.headerBackground} >
          <LinearGradient colors={GRADIENT_COLORS} style={styles.headerBackgroundOverlay} />
          <View style={styles.planWrap}>
            {this._renderPlanLabel()}
          </View>
          <Avatar
            avatarStyle={styles.avatar}
            name={userdata.display_name || userdata.email}
            email={userdata.email}
          />
          <Text style={styles.name}>{userdata.display_name}</Text>
          <Text style={styles.username}>{userdata.username}</Text>
        </View>

        <ScrollView style={styles.content}>
          <FormSectionTitle text={fm(m.native.Setting.configuration)} />
          <ListButtonGroup style={{ marginTop: -3 }}>
            <ListButton
              textLeft={fm(m.native.Setting.contacts)}
              textRight={sumContact}
              iconComponent={EntypoIcon}
              iconName='v-card'
              onPress={() => navigate('Contact')}
            />
            <ListButton
              textLeft={fm(m.native.Setting.identities)}
              textRight={sumIdentity}
              iconComponent={EntypoIcon}
              iconName='v-card'
              onPress={() => navigate('Identity')}
            />
            <ListButton
              textLeft={fm(m.native.Setting.linkedEmailAddresses)}
              textRight={sumESP}
              iconComponent={EntypoIcon}
              iconName='v-card'
              onPress={() => navigate('ForwardAddress')}
            />
          </ListButtonGroup>

          <FormSectionTitle text={fm(m.native.Setting.settings)} />

          <ListButtonGroup style={{ marginTop: -3 }}>

            <ListButton
              textLeft={fm(m.native.Setting.preferences)}
              iconComponent={FAIcon}
              iconName='pencil'
              onPress={() => navigate('EditUserProfile')}
            />

            <ListButton
              textLeft={fm(m.native.Setting.notifications)}
              iconComponent={FAIcon}
              iconName='bell'
              onPress={() => navigate('NotificationSettings')}
            />

            <ListButton
              textLeft={fm(m.native.Setting.deviceSettings)}
              iconComponent={EntypoIcon}
              iconName='key'
              onPress={() => OpenSettings.openSettings()}
            />
          </ListButtonGroup>
          <FormSectionTitle text={fm(m.native.Setting.security)} />

          <ListButtonGroup style={{ marginTop: -3 }}>
            <ListButton
              textLeft={fm(m.native.Setting.changePassword)}
              iconComponent={EntypoIcon}
              iconName='key'
              onPress={() => navigate('ChangePassword')}
            />
            <ListButton
              textLeft={fm(m.native.Setting.logout)}
              iconComponent={EntypoIcon}
              iconName='log-out'
              onPress={logout}
            />
          </ListButtonGroup>

          <FormSectionTitle text={fm(m.native.Setting.plan)} />

          <ListButtonGroup style={{ marginTop: -3 }}>
            {
              userdata.plan_name !== 'premium' &&
              <ListButton
                textLeft={fm(m.native.Setting.upgradePlan)}
                iconComponent={Octicons}
                iconName='package'
                onPress={() => navigate('UpgradePlan')}
              />
            }
            <ListButton
              textLeft={fm(m.native.Setting.privacyPolicy)}
              iconComponent={EntypoIcon}
              iconName='book'
              onPress={() => navigate('Privacy')}
            />
            <ListButton
              textLeft={fm(m.native.Setting.termsOfService)}
              iconComponent={EntypoIcon}
              iconName='book'
              onPress={() => navigate('Terms')}
            />
            <ListButton
              textLeft={fm(m.native.Setting.about)}
              iconComponent={EntypoIcon}
              iconName='v-card'
              onPress={() => navigate('About')}
            />
          </ListButtonGroup>
        </ScrollView>
      </BaseUserView>
    )
  }
}

const mapStateToProps = state => ({
  userdata: state.user.data,
  sumDomains: path(['user', 'data', 'sum_domains'], state) || null,
  sumESP: path(['user', 'data', 'sum_esp'], state) || null,
  sumContact: path(['user', 'data', 'sum_contact'], state) || null,
  sumIdentity: path(['user', 'data', 'total_identities'], state) || null
})

const mapDispatchToProps = {
  refreshProfile: UserActions.refreshProfileRequest,
  logout: UserActions.logoutRequest
}
const IntlUserAccount = injectIntl(UserAccount)
IntlUserAccount.navigationOptions = {
  header: null
}
export default connect(mapStateToProps, mapDispatchToProps)(IntlUserAccount)
