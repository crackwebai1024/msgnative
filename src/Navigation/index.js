import { createStackNavigator, createBottomTabNavigator } from 'react-navigation'
import { Platform, Easing, Animated } from 'react-native'
// for v2
// import StackViewStyleInterpolator from 'react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator'

import MainTabBar from 'app/Components/MainTabBar'
import Terms from 'app/Components/Terms'
import Privacy from 'app/Components/Privacy'

import Launch from 'app/Containers/Auth/launch'
import AuthInitial from 'app/Containers/Auth/initial'
import SignupForm from 'app/Containers/Auth/Signup/Form'
import SignupContacts from 'app/Containers/Auth/Signup/Contacts'
import SignupIdentity from 'app/Containers/Auth/Signup/Identity'
import SignupESPImported from 'app/Containers/Auth/Signup/ESPImported'
import LoginScreen from 'app/Containers/Auth/login'
import PasswordResetScreen from 'app/Containers/Auth/passwordReset'
import PasswordResetRequestScreen from 'app/Containers/Auth/passwordResetRequest'

// import Dashboard from 'app/Containers/Dashboard'

import MailboxList from 'app/Containers/Mailbox/List'
import MailboxDetail from 'app/Containers/Mailbox/Detail'
import MailboxCompose from 'app/Containers/Mailbox/Create'
// import IdentityFilterModal from 'app/Containers/Mailbox/Drawer/IdentityFilterModal'

import IdentityList from 'app/Containers/Identity'
import EditIdentity from 'app/Containers/Identity/edit'
import IdentityDetail from 'app/Containers/Identity/detail'

import ForwardAddressList from 'app/Containers/ForwardAddress/List'
import ForwardAddressDetail from 'app/Containers/ForwardAddress/Detail'
import CreateForwardAddress from 'app/Containers/ForwardAddress/Create'

import CallHistoryList from 'app/Containers/CallHistory/List'
import CallHistoryDetail from 'app/Containers/CallHistory/Detail'
import CreateCall from 'app/Containers/CallHistory/Create'

import ContactList from 'app/Containers/Contacts/List'
import DeviceContactDetail from 'app/Containers/Contacts/DeviceContactDetail'
import ContactDetail from 'app/Containers/Contacts/Detail'
import EditContact from 'app/Containers/Contacts/edit'
import ContactKeyViewer from 'app/Containers/Contacts/KeyViewer'
import ContactKeyAdder from 'app/Containers/Contacts/KeyAdder'

import AboutApp from 'app/Containers/User/About'
import UserAccount from 'app/Containers/User/Account'
import EditUserProfile from 'app/Containers/User/EditProfile'
import ChangePassword from 'app/Containers/User/ChangePassword'
import IdentitySettings from 'app/Containers/User/IdentitySettings'
import NotificationSettings from 'app/Containers/User/NotificationSettings'
import UpgradePlan from 'app/Containers/User/UpgradePlan'

import MessagingList from 'app/Containers/Messaging/RoomList'
import MessagingRoom from 'app/Containers/Messaging/Room'
import MessagingCreate from 'app/Containers/Messaging/Create'

import VideoChat from 'app/Containers/VideoChat'
import FileViewer from 'app/Containers/FileViewer'
import SoundSelection from 'app/Containers/SoundSelection'

export const NavigationTypes = {
  BACK: 'Navigation/BACK',
  INIT: 'Navigation/INIT',
  NAVIGATE: 'Navigation/NAVIGATE',
  RESET: 'Navigation/RESET',
  SET_PARAMS: 'Navigation/SET_PARAMS',
  URI: 'Navigation/URI'
}

let navigationOptions = {}
if (Platform.OS === 'android') {
  navigationOptions.headerTitleStyle = {
    fontFamily: 'sans-serif'
  }
}

const AuthNavigator = createStackNavigator({
  AuthInitial: { screen: AuthInitial },
  Login: { screen: LoginScreen },
  SignupForm: { screen: SignupForm },
  SignupContacts: { screen: SignupContacts },
  SignupESPImported: { screen: SignupESPImported },
  SignupIdentity: { screen: SignupIdentity },
  PasswordReset: { screen: PasswordResetScreen },
  PasswordResetRequest: { screen: PasswordResetRequestScreen }
}, {
  tabBarVisible: false
})

const MailboxNavigator = createStackNavigator({
  MailboxList: { screen: MailboxList },
  MailboxDetail: { screen: MailboxDetail },
  MailboxCompose: { screen: MailboxCompose },
  IdentitySelection: { screen: IdentityList },
  CreateIdentity: { screen: EditIdentity },
  ContactSelection: { screen: ContactList },
  EditContact: { screen: EditContact },
  ForwardAddressDetail: { screen: ForwardAddressDetail },
  CreateForwardAddress: { screen: CreateForwardAddress }
}, {
  headerMode: 'float',
  navigationOptions
})

MailboxNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible
  }
}

const MessagingNavigator = createStackNavigator({
  MessagingRoomList: { screen: MessagingList },
  MessagingRoom: { screen: MessagingRoom },
  MessagingCreateRoom: { screen: MessagingCreate },
  MailboxCompose: { screen: MailboxCompose },
  IdentitySelection: { screen: IdentityList },
  CreateIdentity: { screen: EditIdentity },
  ContactSelection: { screen: ContactList },
  ContactDetail: { screen: ContactDetail },
  EditContact: { screen: EditContact }
}, {
  headerMode: 'screen',
  navigationOptions
})

const IdentityNavigator = createStackNavigator({
  IdentityList: { screen: IdentityList },
  CreateIdentity: { screen: EditIdentity },
  EditIdentity: { screen: EditIdentity },
  IdentityDetail: { screen: IdentityDetail },
  ContactSelection: { screen: ContactList }
}, {
  navigationOptions
})

MessagingNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    ...navigationOptions,
    tabBarVisible
  }
}

const CallHistoryNavigator = createStackNavigator({
  CallHistoryList: { screen: CallHistoryList },
  CallHistoryDetail: { screen: CallHistoryDetail },
  ContactSelection: { screen: ContactList },
  CreateCall: { screen: CreateCall },
  IdentitySelection: { screen: IdentityList },
  CreateIdentity: { screen: EditIdentity },
  ContactDetail: { screen: ContactDetail },
  EditContact: { screen: EditContact },
  EditIdentity: { screen: EditIdentity },
  IdentityDetail: { screen: IdentityDetail }
}, {
  headerMode: 'screen',
  navigationOptions
})

CallHistoryNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible
  }
}

const ContactNavigator = createStackNavigator({
  ContactList: { screen: ContactList },
  IdentitySelection: { screen: IdentityList },
  CreateIdentity: { screen: EditIdentity },
  DeviceContactDetail: { screen: DeviceContactDetail },
  ContactDetail: { screen: ContactDetail },
  EditContact: { screen: EditContact },
  MailboxCompose: { screen: MailboxCompose },
  ContactKeyViewer: { screen: ContactKeyViewer },
  ContactKeyAdder: { screen: ContactKeyAdder }
}, {
  navigationOptions
})

ContactNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible
  }
}

const ForwardAddressNavigator = createStackNavigator({
  ForwardAddressList: { screen: ForwardAddressList },
  ForwardAddressDetail: { screen: ForwardAddressDetail },
  CreateForwardAddress: { screen: CreateForwardAddress }
})

ForwardAddressNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = false
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    ...navigationOptions,
    tabBarVisible
  }
}

const AccountNavigator = createStackNavigator({
  UserAccount: { screen: UserAccount },
  EditUserProfile: { screen: EditUserProfile },
  ChangePassword: { screen: ChangePassword },
  IdentitySettings: { screen: IdentitySettings },
  NotificationSettings: { screen: NotificationSettings },
  Identity: { screen: IdentityNavigator, navigationOptions: { header: null } },
  // Contact: { screen: ContactNavigator, navigationOptions: { header: null } },
  ForwardAddress: { screen: ForwardAddressNavigator, navigationOptions: { header: null } },
  UpgradePlan: { screen: UpgradePlan },
  SoundSelection: { screen: SoundSelection },
  About: { screen: AboutApp }
}, {
  navigationOptions
})

AccountNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    ...navigationOptions,
    tabBarVisible
  }
}

const UserAreaNavigator = createBottomTabNavigator({
  // Dashboard: { screen: Dashboard },
  Mailbox: { screen: MailboxNavigator },
  Messaging: { screen: MessagingNavigator },
  CallHistory: { screen: CallHistoryNavigator },
  Contact: { screen: ContactNavigator },
  Account: { screen: AccountNavigator }
}, {
  tabBarComponent: MainTabBar,
  navigationOptions: {
    gesturesEnabled: false
  }
})

const AppNavigator = createStackNavigator({
  Launch: { screen: Launch },
  Auth: { screen: AuthNavigator },
  UserArea: { screen: UserAreaNavigator },
  VideoChat: { screen: VideoChat },
  FileViewer: { screen: FileViewer },
  Terms: { screen: Terms },
  Privacy: { screen: Privacy }
}, {
  headerMode: 'none',
  navigationOptions: {
    gesturesEnabled: false
  },
  transitionConfig: () => ({
    transitionSpec: {
      duration: 300,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing
    }
    // screenInterpolator: (sceneProps) => {
    // if (
    //   sceneProps.index === 0 &&
    //   sceneProps.scene.route.routeName !== 'VideoChat' &&
    //   sceneProps.scenes.length > 2
    // ) return null

    // Otherwise, use the usual horizontal animation.
    // return StackViewStyleInterpolator.forHorizontal(sceneProps)
    // }
  })
})

export default AppNavigator
