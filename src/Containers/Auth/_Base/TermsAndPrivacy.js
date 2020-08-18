import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions } from 'react-navigation'
import EStyleSheet from 'react-native-extended-stylesheet'

import m from 'commons/I18n'

const s = EStyleSheet.create({
  container: {
    paddingTop: '.5rem',
    paddingBottom: '1rem',
    backgroundColor: 'transparent',
    // display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
    width: '11rem'
  },
  item: {
    color: 'rgba(255,255,255, 0.3)',
    fontSize: '1rem',
    textDecorationLine: 'underline'
  },
  terms: {
    alignSelf: 'flex-start',
    width: '5.5rem',
    textAlign: 'center'
  },
  privacy: {
    alignSelf: 'flex-end',
    width: '5.5rem',
    textAlign: 'center'
  }
})

class TermsAndConditions extends Component {
  constructor (props) {
    super(props)
    this._goToTerms = this._goToTerms.bind(this)
    this._goToPrivacy = this._goToPrivacy.bind(this)
  }

  _goToTerms () {
    this.props.navigate({ routeName: 'Terms' })
  }

  _goToPrivacy () {
    this.props.navigate({ routeName: 'Privacy' })
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <View style={s.container}>
        <Text onPress={this._goToTerms} style={[s.item, s.terms]}>{fm(m.app.Terms.terms)}</Text>
        <Text onPress={this._goToPrivacy} style={[s.item, s.privacy]}>{fm(m.app.Terms.privacy)}</Text>
      </View>
    )
  }
}

const mapDispatchToProps = {
  navigate: NavigationActions.navigate
}

const ConnectedTermsAndConditions = connect(null, mapDispatchToProps)(injectIntl(TermsAndConditions))

export default ConnectedTermsAndConditions
