import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Entypo from 'react-native-vector-icons/Entypo'

import Text from 'app/Components/BaseText'
import commonStyles from 'app/Styles/common'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  filterButton: {
    backgroundColor: palette.midnightBlue,
    marginTop: '0.1rem',
    opacity: 0.9,
    padding: '0.5rem',
    borderColor: palette.clouds
  },

  filterButtonText: {
    color: palette.clouds,
    fontSize: '0.75rem',
    fontWeight: '900',
    letterSpacing: '0.02rem'
  },

  filterButtonIcon: {
    color: palette.clouds,
    marginRight: '0.3rem'
  },

  content: {
    justifyContent: 'space-between'
  },

  selectedCount: {
    color: palette.clouds,
    marginTop: '0.2rem',
    fontSize: '0.65rem',
    fontWeight: '600',
    marginLeft: '1rem'
  }
})

export default class MailboxSideMenuItemsFilter extends Component {
  static propTypes = {
    title: PropTypes.string,
    iconName: PropTypes.string,
    onPress: PropTypes.func,
    selectedCount: PropTypes.number
  }

  render () {
    const { title, iconName, onPress, selectedCount } = this.props

    return (
      <View>
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.6}
          onPress={onPress}
        >
          <View style={[commonStyles.horizontalAlign, styles.content]}>
            <View style={commonStyles.horizontalAlign}>
              <Entypo style={styles.filterButtonIcon} name={iconName} />
              <Text style={styles.filterButtonText}>{title.toUpperCase()}</Text>
            </View>

            <Entypo style={styles.filterButtonIcon} name='plus' />
          </View>

          { !selectedCount ? null : <Text style={styles.selectedCount}>{selectedCount} SELECTED</Text> }
        </TouchableOpacity>
      </View>
    )
  }
}
