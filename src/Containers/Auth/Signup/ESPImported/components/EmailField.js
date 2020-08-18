import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View } from 'react-native'
import ReduxFormTextInput from 'app/Components/Form/ReduxFormTextInput'
import Text from 'app/Components/BaseText'
import styles from '../styles'

const EmailField = props => (
  <View>
    <ReduxFormTextInput {...props} />
    { props.meta.touched && props.meta.error && <Text style={styles.addEmailError}>{props.meta.error}</Text> }
  </View>
)

export default EmailField
