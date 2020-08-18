import PropTypes from 'prop-types'
import React from 'react'
import { onlyUpdateForKeys, defaultProps, setPropTypes, setDisplayName, compose } from 'recompose'
import { Modal, View, TouchableOpacity, TouchableHighlight } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Text from 'app/Components/BaseText'
import { default as styles, populateContainerStyle } from './styles'

const ActionButton = ({
  text, onPress, backStyle, textStyle
}) => (
  <TouchableHighlight
    style={[styles.actionButtonBase, backStyle]}
    onPress={onPress}
    underlayColor='rgba(255, 255, 255, 0.8)'
    activeOpacity={0.8}
  >
    <View style={styles.actionButtonInner}>
      <Text style={[styles.actionButtonTextBase, textStyle]}>{text.toUpperCase()}</Text>
    </View>
  </TouchableHighlight>
)

const NotificationWithActions = ({
  type, visible, content, primaryAction, secondaryAction, onClose
}) => {
  const typeColored = populateContainerStyle(type)

  return (
    <Modal
      animationType='fade'
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.errorContainer, typeColored.errorContainer]}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.errorText, typeColored.errorText]}>{content}</Text>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeButtonText, typeColored.errorText]}>
                <Icon name='close' size={23} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {
          (primaryAction || secondaryAction) &&
          <View style={styles.actionsContainer}>
            {primaryAction && <ActionButton {...primaryAction} backStyle={typeColored.primary} textStyle={typeColored.primaryText} />}
            {secondaryAction && <ActionButton {...secondaryAction} backStyle={typeColored.secondary} textStyle={typeColored.secondaryText} />}
          </View>
        }
      </View>
    </Modal>
  )
}

export default compose(
  setDisplayName('NotificationWithActions'),
  onlyUpdateForKeys(['visible']),
  setPropTypes({
    type: PropTypes.oneOf(['danger', 'alert', 'warning', 'success', 'info'])
  }),
  defaultProps({
    type: 'info'
  })
)(NotificationWithActions)
