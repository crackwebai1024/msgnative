import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Entypo'

import m from 'commons/I18n'
import { withWSState } from 'commons/Lib/NetworkStateProvider'

import baseStyles from 'app/Components/ListView/styles'
import ContactListItem from 'app/Components/ContactListItem'

import ContactSubselect, { FORM_IDENTIFIER } from './ContactSubselect'

// Standalone component so that it can be connected to redux store
// while being used inside navigationOptions of room list view
const HeaderRight = ({ navigation, fm, wsOnline }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('ContactSelection', {
      subselectComponent: ContactSubselect,
      reduxFormIdentifier: FORM_IDENTIFIER,
      title: fm(m.native.Chat.selectContact),
      listItemComponent: ContactListItem,
      disableSwipe: true,
      tabBarVisible: false,
      createScreenIdentifier: 'MessagingCreateRoom',
      forceSection: true,
      headerLeftProps: { isBack: true }
    })}
    disabled={!wsOnline}
  >
    <Icon
      name='plus'
      style={[baseStyles.navBarMenuIcon, baseStyles.navBarRightIcon, !wsOnline && baseStyles.disabled]}
    />
  </TouchableOpacity>
)

export default withWSState(HeaderRight)
