import PropTypes from 'prop-types'
import React from 'react'
import { View, TouchableOpacity, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: '0.9rem',
    position: 'absolute',
    bottom: 0
  },

  tab: {
    padding: 2,
    paddingBottom: Platform.OS === 'ios' ? '0.5rem' : 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },

  tabText: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#20305a',
    fontWeight: '800'
  },

  tabActive: {
    borderBottomColor: palette.ceruleanBlue
  },

  tabActiveText: {
    color: palette.ceruleanBlue
  },

  unreadCount: {
    borderRadius: 20,
    minWidth: 20,
    padding: '0.1rem',
    backgroundColor: 'rgb(240, 75, 76)',
    overflow: 'hidden',
    marginTop: Platform.OS === 'ios' ? '-0.5rem' : 0,
    marginLeft: '.5rem'
  },

  unreadCountText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: '600'
  }
})

const SwitchTabs = ({ tabs, selected, onSelect }) => (
  <View style={s.container}>
    {tabs.map((tab, index) => {
      const isActive = index === selected
      const tabWidth = { width: `${100 / tabs.length}%` }

      return (
        <TouchableOpacity key={index} style={[s.tab, tabWidth, isActive && s.tabActive]} onPress={() => !isActive && onSelect(index)}>
          <Text style={[s.tabText, isActive && s.tabActiveText]}>{tab.label.toUpperCase()}</Text>
          {tab.unreadCount ? <View style={s.unreadCount}>
            <Text style={s.unreadCountText}>{tab.unreadCount}</Text>
          </View> : null}
        </TouchableOpacity>
      )
    })}
  </View>
)

SwitchTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    unreadCount: PropTypes.number
  })),
  selected: PropTypes.number,
  onSelect: PropTypes.func
}

SwitchTabs.defaultProps = {
  selected: 0
}

export default SwitchTabs
