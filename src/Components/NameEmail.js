import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View } from 'react-native'

import Text from 'app/Components/BaseText'

/**
 * Component that displays a name and an email.
 *
 * This component is meant to be used to represent
 * a person/identity/alias in a standardized way throughout
 * the app.
 *
 * Email is split at `@` and the two parts are shown on
 * different lines.
 *
 * E.g. Name `John Doe` and email test@example.com is transformed to –
 *
 * John Doe
 * test
 * @example.com
 *
 * This component is used by –
 *
 * - Identity, Contacts list views
 * - Identity & Contacts detail views
 *
 */
export default class NameEmail extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    email: PropTypes.string,
    nameIcon: PropTypes.element,

    style: PropTypes.number,
    nameStyle: PropTypes.object,
    emailStyle: PropTypes.object,
    domainStyle: PropTypes.object,

    // If this is set to true, email username split
    // will be shown as the name, with nameStyle styles.
    highlightEmailAsName: PropTypes.bool
  }

  static defaultProps = {
    highlightEmailAsName: false
  }

  render () {
    const {
      name, email, nameIcon,
      style, nameStyle, emailStyle, domainStyle,
      highlightEmailAsName
    } = this.props

    const emailSplit = (email || '').split('@')

    let nameText = name; let emailText = emailSplit[0]; let domainText = emailSplit[1]

    const areNameEmailSame = name && email && name.trim() === email.trim()
    if (areNameEmailSame && highlightEmailAsName) {
      nameText = emailText
      emailText = null
    } else if (areNameEmailSame && !highlightEmailAsName) {
      nameText = null
    }

    return (
      <View style={style}>
        { !nameText ? null
          : <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={nameStyle}>{nameText}</Text>
            {nameIcon}
          </View>
        }

        { !emailText ? null : <Text style={emailStyle}>{emailText}</Text> }
        { !domainText ? null : <Text style={domainStyle}>@{domainText}</Text> }
        {this.props.children}
      </View>
    )
  }
}
