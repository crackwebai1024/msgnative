import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ScrollView, TouchableOpacity, Clipboard } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStylesheet from 'react-native-extended-stylesheet'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { isSmime } from 'commons/Lib/Crypto'
import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStylesheet.create({
  container: {
    flex: 1,
    display: 'flex',
    backgroundColor: palette.white
  },

  text: {
    padding: '1rem',
    fontSize: '0.5rem',
    textAlign: 'center'
  },

  copyContainer: {
    padding: '0.5rem',
    paddingRight: '1rem'
  },

  copyIcon: {
    color: palette.iosBlue,
    fontSize: '1.25rem'
  }
})

const copyToClipboard = (dispatch, string, fm) => () => {
  Clipboard.setString(string)
  dispatch(NotificationActions.displayNotification(fm(m.native.Contact.copiedToClipboard), 'info', 3000))
}

class KeyViewer extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        params: PropTypes.shape({
          key: PropTypes.object.isRequired,
          title: PropTypes.string
        }).isRequired
      }).isRequired
    }).isRequired
  }

  render () {
    const { key } = this.props.navigation.state.params
    return (
      <ScrollView style={s.container}>
        <Text style={s.text}>{key.public}</Text>
      </ScrollView>
    )
  }
}

const IntlKeyViewer = injectIntl(KeyViewer)
IntlKeyViewer.navigationOptions = ({ navigation, screenProps: { fm } }) => {
  const { title, key } = navigation.state.params
  const { dispatch } = navigation
  const options = {
    title,
    tabBarVisible: false,
    headerRight: (
      <TouchableOpacity style={s.copyContainer} onPress={copyToClipboard(dispatch, key.public, fm)}>
        <Icon style={s.copyIcon} name='copy' />
      </TouchableOpacity>
    )
  }
  return options
}

export default IntlKeyViewer
