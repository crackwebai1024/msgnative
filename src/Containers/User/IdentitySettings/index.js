import React, { Component } from 'react'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
// import PropTypes from 'prop-types'
import { find, propEq } from 'ramda'

import UserActions from 'commons/Redux/UserRedux'
import DomainActions from 'commons/Redux/DomainRedux'
import { extractOrderedDomainData } from 'commons/Selectors/Domain'

import WaitFor from 'app/Components/WaitFor'
import EditItemView from 'app/Components/EditView'
import SwitchInput from 'app/Components/Form/SwitchInput'
import { FormSectionTitle } from 'app/Components/Form/Common'
import Picker from 'app/Components/Form/Picker'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
// import { path } from 'ramda'

class IdentitySettings extends Component {
  constructor (props) {
    super(props)

    this._formValuesToPayload = this._formValuesToPayload.bind(this)

    this._focusDomain = this._setFocus.bind(this, 'domain_id')
    this._clearFocus = this._setFocus.bind(this, null)

    this.state = {
      focus: null
    }
  }

  _setFocus (key) {
    if (!key) return
    this.setState({ focus: key }, () => this.setState({ focus: null }))
  }

  _focusProp (key) {
    return {
      focus: this.state.focus === key
    }
  }

  _formValuesToPayload (values) {
    return {
      is_default_http_pickup: values.is_default_http_pickup,
      is_default_strip_html: values.is_default_strip_html,
      pref_domainname: this._getDomainNameById(values.domain_id)
    }
  }

  _getDomainNameById (domainId) {
    if (!domainId || domainId === '_none') {
      return '_none'
    }

    const domain = find(propEq('id', domainId))(this.props.domains)
    if (domain) {
      return domain.name
    }
  }

  _getDomainData (domains) {
    if (!domains || !domains.data) return []
    return domains.data.map(d => ({
      title: d.label,
      value: d.value
    }))
  }

  componentWillUnmount () {
    this.props.clearDomainSearchResultsData()
    this.props.domainClearIsActiveFilter()
  }

  render () {
    const { domains, domainSetIsActiveFilter, intl } = this.props
    const fm = intl.formatMessage
    const waitForData = [
      { value: domains.data, request: domainSetIsActiveFilter }
    ]

    return (
      <WaitFor data={waitForData} doRefresh>

        <EditItemView
          createSuccessMessage={fm(m.native.Preferences.identityUpdated)}
          formValuesToPayload={this._formValuesToPayload}
          {...this.props}
        >

          <Field
            name='domain'
            component={Picker}
            title={fm(m.native.Preferences.preferredDomain)}
            initialMessage={fm(m.native.Preferences.preferredDomainForIdentities)}
            linkText={fm(m.native.Preferences.selectDomain)}
            returnKeyType='next'
            options={this._getDomainData(this.props.domains)}
            props={this._focusProp('domain_id')}
            onSubmitEditing={this._focusEmailUsername}
          />

          <FormSectionTitle text={fm(m.native.Preferences.defaultSettingsForIdentities)} />

          <Field
            name='is_default_http_pickup'
            component={SwitchInput}
            smallLabel={fm(m.native.Preferences.useMsgsafeWebmail)}
            onHelpText={fm(m.native.Preferences.accessReceivedEmails)}
            offHelpText={fm(m.native.Preferences.forwardToPrivateEmail)}
            values={[false, true]}
          />

          <Field
            name='is_default_strip_html'
            component={SwitchInput}
            smallLabel={fm(m.native.Preferences.convertRichText)}
            values={[false, true]}
          />

        </EditItemView>

      </WaitFor>
    )
  }
}

const IdentitySettingsForm = reduxForm({
  form: 'identitySettings'
})(IdentitySettings)

const IntlIdentitySettingsForm = injectIntl(IdentitySettingsForm)

IntlIdentitySettingsForm.navigationOptions = (...args) => ({
  ...EditItemView.navigationOptions(...args),
  title: args[0] && args[0].screenProps && args[0].screenProps.fm(m.native.Preferences.identityPreferences)
})

const mapStateToProps = state => ({
  domains: extractOrderedDomainData(state.domain),

  // Pre-populate identity display name with user's display name
  initialValues: {
    // domain: path(['user', 'data', 'state', 'pref_domainname'], state),
    is_default_http_pickup: state.user.data.is_default_http_pickup,
    is_default_strip_html: state.user.data.is_default_strip_html
  }
})

const mapDispatchToProps = {
  createItemRequest: UserActions.updateIdentitySettingsRequest,
  domainSetIsActiveFilter: DomainActions.domainSetIsActiveFilter,
  domainClearIsActiveFilter: DomainActions.domainClearIsActiveFilter,
  clearDomainSearchResultsData: DomainActions.domainClearSearchData
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlIdentitySettingsForm)
