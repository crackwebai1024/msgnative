import React from 'react'
import { TouchableHighlight, View } from 'react-native'

import Text from 'app/Components/BaseText'
import Spinner from 'app/Components/Spinner'
import styles from './styles'

const AuthActionButton = ({
  isSpinning, title, titleStyle, underlayColor, activeOpacity, ...props
}) => (
  <TouchableHighlight underlayColor={underlayColor} activeOpacity={activeOpacity} {...props}>
    <View style={styles.buttonContent}>
      <Text style={titleStyle}>
        {title}
      </Text>
      {isSpinning && <Spinner containerStyle={styles.spinnerAnimatedContainer} iconStyle={styles.spinnerIcon} />}
    </View>
  </TouchableHighlight>
)

AuthActionButton.defaultProps = {
  underlayColor: 'rgba(255, 255, 255, 0.1)',
  activeOpacity: 0.8
}

export default AuthActionButton
