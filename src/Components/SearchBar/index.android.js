import React from 'react'
import Search from 'react-native-search-box'

const androidSearchBar = ({ onChangeText, onCancel }) => (
  <Search
    onChangeText={onChangeText}
    onCancel={onCancel}
  />
)

export default androidSearchBar
