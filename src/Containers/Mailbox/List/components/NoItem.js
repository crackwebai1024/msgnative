import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TouchableOpacity } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'

import ListViewError from 'app/Components/ListView/components/ListViewError'
import baseStyles from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'

const NoItem = ({ navigate, intl }) => (
  <ListViewError>
    <Text style={baseStyles.errorText}>{intl.formatMessage(m.native.Mailbox.noEmailsYet)}</Text>
    <TouchableOpacity style={baseStyles.errorAction} onPress={() => navigate({ routeName: 'MailboxCompose' })}>
      <Text style={[baseStyles.errorText, baseStyles.errorActionText]}>{intl.formatMessage(m.native.Mailbox.clickHereToSendOne)}</Text>
    </TouchableOpacity>
  </ListViewError>
)
NoItem.propTypes = {
  navigate: PropTypes.func,
  intl: PropTypes.object
}
const IntlNoItem = injectIntl(NoItem)

const mapDispatchToProps = {
  navigate: NavigationActions.navigate
}

const ConnectedNoItem = connect(null, mapDispatchToProps)(IntlNoItem)

export default ConnectedNoItem
