import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import ListViewError from 'app/Components/ListView/components/ListViewError'
import baseStyles from 'app/Components/ListView/styles'
import Text from 'app/Components/BaseText'

class NoDataMessage extends Component {
  static propTypes = {
    intl: PropTypes.object,
    onlyMissed: PropTypes.bool
  }

  render () {
    const fm = this.props.intl.formatMessage
    const textStyle = [
      baseStyles.errorText,
      baseStyles.errorActionText,
      { marginBottom: 15 }
    ]
    const translationKey = this.props.onlyMissed ? 'noMissedCalls' : 'youhaveNoCallsYet'
    return (
      <ListViewError>
        <Text style={textStyle}>{fm(m.native.CallHistory[translationKey])}</Text>
      </ListViewError>
    )
  }
}

const IntlNoDataMessage = injectIntl(NoDataMessage)

export default IntlNoDataMessage
