import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import { getLocalTimeForUTC } from 'commons/Lib/Utils'
import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  header: {
    padding: '1rem',
    // marginTop: '1rem',
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds
  },

  headerFromContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  headerFrom: {
    color: palette.asbestos,
    fontSize: '0.85rem'
  },

  headerSubject: {
    fontSize: '0.95rem',
    fontWeight: '500',
    marginTop: '0.3rem',
    lineHeight: '1.5rem',
    color: palette.midnightBlue
  },

  indicator: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: palette.peterRiver,
    marginRight: '0.4rem'
  },

  time: {
    fontSize: '0.7rem',
    marginTop: '0.5rem',
    color: palette.asbestos
  },

  headerAddresses: {
    marginTop: '0.4rem'
  },

  headerAddress: {
    marginTop: '0.1rem',
    flexDirection: 'row'
  },

  headerAddressTitle: {
    fontSize: '0.72rem',
    color: palette.asbestos,
    minWidth: '2.3rem'
  },

  headerAddressContent: {
    fontSize: '0.72rem',
    color: palette.wetAsphalt
  }
})

class MailboxDetailHeader extends PureComponent {
  static propTypes = {
    fromName: PropTypes.string,
    toName: PropTypes.string,
    fromEmail: PropTypes.string.isRequired,
    toEmail: PropTypes.string.isRequired,
    subject: PropTypes.string,
    time: PropTypes.string.isRequired,
    isRead: PropTypes.bool.isRequired,
    intl: PropTypes.object
  }

  constructor (props) {
    super(props)

    this._toggleEmailHeaderDetailsVisibility = this._toggleEmailHeaderDetailsVisibility.bind(this)

    this.state = {
      emailHeaderDetailsVisible: true
    }
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   return this.state.emailHeaderDetailsVisible !== nextState.emailHeaderDetailsVisible
  // }

  _toggleEmailHeaderDetailsVisibility () {
    this.setState({ emailHeaderDetailsVisible: !this.state.emailHeaderDetailsVisible })
  }

  _renderDetails () {
    const { fromEmail, toEmail, intl } = this.props

    return (
      <View style={styles.headerAddresses}>
        <View style={styles.headerAddress}>
          <Text style={styles.headerAddressTitle}>{ intl.formatMessage(m.native.Mailbox.from) }</Text>
          <Text style={styles.headerAddressContent}>{fromEmail}</Text>
        </View>
        <View style={styles.headerAddress}>
          <Text style={styles.headerAddressTitle}>{ intl.formatMessage(m.native.Mailbox.to) }</Text>
          <Text style={styles.headerAddressContent}>{toEmail}</Text>
        </View>
      </View>
    )
  }

  render () {
    const { fromName, toName, subject, time, isRead } = this.props

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={this._toggleEmailHeaderDetailsVisibility} activeOpacity={0.8}>
          <View>
            <View style={styles.headerFromContainer}>
              {!isRead && <View style={styles.indicator} />}
              <Text style={styles.headerFrom}>{fromName || toName}</Text>
            </View>
            <Text style={styles.headerSubject}>{subject}</Text>
            <Text style={styles.time}>{getLocalTimeForUTC(time).format('DD MMMM YYYY [at] HH:mm')}</Text>
          </View>
        </TouchableOpacity>
        { this.state.emailHeaderDetailsVisible && this._renderDetails() }
      </View>
    )
  }
}

export default injectIntl(MailboxDetailHeader)
