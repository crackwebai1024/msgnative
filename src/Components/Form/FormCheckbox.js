import React, { PureComponent } from 'react'
import { View, TouchableOpacity } from 'react-native'
import CheckBox from 'react-native-check-box'
import Text from 'app/Components/BaseText'

export default class FormCheckbox extends PureComponent {
  render () {
    const {
      input, label, isChecked, onClick, disabled, ...otherProps
    } = this.props
    return (
      <View style={{
        flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'
      }}
      >
        <CheckBox
          isChecked={isChecked}
          onClick={onClick}
          disabled={disabled}
          {...otherProps}
          checkBoxColor='rgba(0,0,0, 0.7)'
        />
        <TouchableOpacity onPress={onClick}>
          <Text style={{ color: 'rgba(0,0,0, 0.7)' }}>
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}
