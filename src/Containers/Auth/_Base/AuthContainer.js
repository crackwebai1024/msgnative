import React, { PureComponent } from 'react'
import { View, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import dismissKeyboard from 'dismissKeyboard'
import * as R from 'ramda'
import LogoHero from 'app/Components/LogoHero'
import KeyboardAwareScrollView from 'app/Components/KeyboardAwareScrollView'
import { DataPicker } from 'rnkit-actionsheet-picker'
import TermsAndPrivacy from './TermsAndPrivacy'
import locales from 'commons/I18n/locales'
import styles from './styles'
import m from 'commons/I18n'
import AppActions from 'commons/Redux/AppRedux'
import MIcon from 'react-native-vector-icons/MaterialIcons'

class AuthMainContainer extends PureComponent {
  constructor (props) {
    super(props)

    this._goToAuthInitial = this._goToAuthInitial.bind(this)
    this.updateScroll = this.updateScroll.bind(this)
    this._renderLangSelection = this._renderLangSelection.bind(this)
    this._showPicker = this._showPicker.bind(this)
  }

  updateScroll (...args) {
    return this.refs.scrollView.updateScroll(...args)
  }

  _goToAuthInitial () {
    const { navigation } = this.props
    navigation.navigate('AuthInitial')
  }

  _valueToTitle (value) {
    const options = this._getLocaleOptions()
    return R.path(['title'], R.find(n => n.value.toLowerCase().startsWith(value.toLowerCase()), options))
  }

  _getLocaleOptions () {
    return locales.map(item => ({
      title: item[1],
      value: item[0]
    }))
  }

  _showPicker () {
    const { intl, applyLocale } = this.props

    const options = this._getLocaleOptions()
    const dataSource = options.map(option => option.title)
    const defaultSelected = [this._valueToTitle(this.props.intl.locale)] || [dataSource[0]]

    dismissKeyboard()

    DataPicker.show({
      dataSource,
      titleText: (intl.messages || {})[m.native.Preferences.preferredLanguage.id] || m.native.Preferences.preferredLanguage.defaultMessage,
      defaultSelected,
      doneText: (intl.messages || {})[m.app.Common.done.id] || m.app.Common.done.defaultMessage,
      cancelText: (intl.messages || {})[m.app.Common.cancel.id] || m.app.Common.cancel.defaultMessage,
      numberOfComponents: 1,
      onPickerConfirm: (selectedData, selectedIndex) => {
        applyLocale(options[selectedIndex].value)
      }
    })
  }

  _renderLangSelection () {
    return (
      <View style={styles.langSelectionContainer}>
        <TouchableOpacity onPress={this._showPicker}>
          <MIcon name='language' style={styles.langSelection} />
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    const { logoProps, hideFooter } = this.props

    return (
      <View style={{ flex: 1, width: '100%' }} ref='main'>
        <Image
          source={require('app/Images/auth_bg.jpg')}
          style={styles.background}
          onPress={this._goToAuthInitial.bind(this)}
        />
        {/* keyboardShouldPersistTaps=true is used to prevent ScrollView from dismissing keyboard,
            because tapping from one TextInput to another causes keyboard to be dismissed too.
            As the alternative, TouchableWithoutFeedback with onPress handler is used. */}
        <KeyboardAwareScrollView
          contentContainerStyle={styles.main}
          keyboardShouldPersistTaps='always'
          ref='scrollView'
        >
          {this._renderLangSelection()}
          <TouchableWithoutFeedback onPress={() => dismissKeyboard()}>
            <View style={[styles.content]}>
              <LogoHero {...logoProps} />
              {this.props.children}
            </View>
          </TouchableWithoutFeedback>

        </KeyboardAwareScrollView>

        { !hideFooter && <TermsAndPrivacy /> }
      </View>
    )
  }
}

const mapStateToProps = state => ({
  intl: state.intl
})

const mapDispatchToProps = {
  applyLocale: AppActions.applyLocale
}

export const AuthContainer = connect(mapStateToProps, mapDispatchToProps)(AuthMainContainer)
