import React from 'react'
import SearchBar from 'react-native-search-bar'

const iOSSearchBar = ({ onChangeText, onCancel, placeholder, style, text }) => (
  <SearchBar
    onChangeText={onChangeText}
    onCancelButtonPress={onCancel}
    showsCancelButton
    placeholder={placeholder}
    style={style}
    text={text}
  />
)

export default iOSSearchBar
