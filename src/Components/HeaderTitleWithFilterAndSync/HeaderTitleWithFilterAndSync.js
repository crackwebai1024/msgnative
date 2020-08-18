import React from 'react'
import PropTypes from 'prop-types'

import { View, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import SpiningIcon from 'app/Components/AnimatedIcon/SpiningIcon'
import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },

  title: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: 'rgba(0, 0, 0, .9)',
    marginHorizontal: 8
  },

  icon: {
    fontSize: Platform.OS === 'ios' ? 13 : 18,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: palette.link,
    marginVertical: 3
  },
  syncIconContainer: {
    color: palette.link,
    marginHorizontal: 8,
    marginVertical: 3
  }
})

const HeaderTitleWithFilterAndSync = ({ title, onPress, onSyncIconPress = false, filterApplied = false }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <Text style={styles.title}>{title}</Text>
      {filterApplied && <Icon style={styles.icon} name='filter' />}
    </TouchableOpacity>
    {onSyncIconPress &&
      <TouchableOpacity onPress={onSyncIconPress} disabled={!onSyncIconPress}>
        <SpiningIcon
          size={Platform.OS === 'ios' ? 13 : 18}
          IconComponent={Icon}
          iconName='refresh'
          containerStyle={styles.syncIconContainer}
          iconStyle={{ color: palette.link }}
        />
      </TouchableOpacity>
    }
  </View>
)

HeaderTitleWithFilterAndSync.propTypes = {
  filterApplied: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  onSyncIconPress: PropTypes.func
}

export default HeaderTitleWithFilterAndSync
