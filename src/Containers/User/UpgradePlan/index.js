import React, { Component } from 'react'
import { connect } from 'react-redux'
import { WebView } from 'react-native'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'

const WEB_VIEW_URL = __DEV__ ? 'http://localhost:3000' : 'https://www.msgsafe.io'

class UpgradePlan extends Component {
  render () {
    const { accessId, secretToken } = this.props
    const uri = `${WEB_VIEW_URL}/plan?isWebView=1#msgsafe-auth-hash&${accessId}&${secretToken}`
    console.info('UPGRADE PLAN', uri)
    return (
      <WebView
        useWebKit
        source={{ uri }}
      />
    )
  }
}
const IntlUpgradePlan = injectIntl(UpgradePlan)
IntlUpgradePlan.navigationOptions = ({ screenProps: { fm } }) => ({
  title: fm(m.native.Setting.upgradePlan)
})

const mapStateToProps = state => ({
  accessId: state.user.data.access_id,
  secretToken: state.user.data.secret_token
})

const ConnectedUpgradePlan = connect(mapStateToProps)(IntlUpgradePlan)

export default ConnectedUpgradePlan
