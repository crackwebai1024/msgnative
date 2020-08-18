import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'
import { NavigationActions, StackActions } from 'react-navigation'
import { pathOr, isNil } from 'ramda'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'

import moment from 'moment'
import { connect } from 'react-redux'

import m from 'commons/I18n'
import { timeAgo } from 'commons/Lib/Utils'
import NotificationActions from 'commons/Redux/NotificationRedux'
import UserEmailActions from 'commons/Redux/UserEmailRedux'
import { getDataItemForId } from 'commons/Redux/_Utils'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'

import Text from 'app/Components/BaseText'
import SimpleTiles from 'app/Components/SimpleTiles'
import { Header } from 'app/Components/DetailView'
import HeaderButton from 'app/Components/HeaderButton'
import palette from 'app/Styles/colors'

import styles from './styles'

class ForwardAddressDetail extends Component {
  static propTypes = {
    data: PropTypes.object,
    intl: PropTypes.object,
    isOnline: PropTypes.bool,
    navigation: PropTypes.object.isRequired,
    displayNotification: PropTypes.func,
    useremailRequestConfirmation: PropTypes.func,
    useremailSetDefault: PropTypes.func,
    avatar: PropTypes.any
  }
  constructor (props) {
    super(props)
    this.state = { setDefaultClicked: false }
    this._getHistoryData = this._getHistoryData.bind(this)
    this._requestConfirmationEmail = this._requestConfirmationEmail.bind(this)
    this._renderConfirmMessage = this._renderConfirmMessage.bind(this)
    this._onPressSetDefault = this._onPressSetDefault.bind(this)
  }

  _getHistoryData () {
    const { data, intl } = this.props
    const fm = intl.formatMessage

    const lastActivityOn = data.last_activity_on || data.created_on
    return [
      { title: fm(m.app.Common.lastActivity), description: `${moment.utc(lastActivityOn).fromNow()}` },
      { title: fm(m.app.Common.modified), description: `${moment.utc(data.modified_on).fromNow()}` },
      { title: fm(m.app.Common.created), description: `${moment.utc(data.created_on).fromNow()}` }
    ]
  }

  _requestConfirmationEmail () {
    const {
      data, intl, displayNotification, useremailRequestConfirmation
    } = this.props
    const fm = intl.formatMessage

    useremailRequestConfirmation(
      { id: data.id },
      () => displayNotification(fm(m.native.ForwardAddress.verificationEmailSent), 'success', 3000),
      () => displayNotification(fm(m.native.ForwardAddress.unableToSendVerificationEmail), 'danger', 3000)
    )
  }

  _onPressSetDefault () {
    const {
      data: { id }, useremailSetDefault
    } = this.props
    useremailSetDefault(id)
    this.setState({
      setDefaultClicked: true
    })
  }

  _goToList () {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'ForwardAddressList' })]
    }))
  }

  componentWillReceiveProps (nextProps) {
    if (!isNil(this.props.data) && isNil(nextProps.data)) {
      this._goToList()
    }

    if (!nextProps.data) return

    const { data: { is_default: isDefault } } = nextProps
    if (this.props.data && isDefault !== this.props.data.is_default) {
      this.setState({
        setDefaultClicked: false
      })
    }
  }

  _renderSetDefault () {
    const { data: { is_default: isDefault, is_confirmed: isConfirmed }, intl, isOnline } = this.props
    const { setDefaultClicked } = this.state
    if (!isConfirmed) return null
    const fm = intl.formatMessage

    return (
      <View style={styles.setDefaultBlockContainer}>
        { isDefault ? <View><Text style={styles.defaultStateMessageText}>{fm(m.native.ForwardAddress.defaultStateMessage)}</Text></View>
          : <View><Text style={styles.defaultStateMessageText}>{fm(m.native.ForwardAddress.nonDefaultStateMessage)}</Text></View>
        }
        { !isDefault && <View>
          <TouchableOpacity onPress={this._onPressSetDefault} disabled={!isOnline || setDefaultClicked}
            underlayColor={isOnline && !setDefaultClicked ? 'rgba(242, 242, 242, 0.25)' : 'rgba(255, 255, 255, 0.1)'}
            activeOpacity={0.5}
            style={[styles.button, (!isOnline || setDefaultClicked) && styles.buttonDisabled]}
          >
            <Text style={[styles.setDefaultButton, (!isOnline || setDefaultClicked) && styles.disabled]}>{fm(m.native.ForwardAddress.setDefault)}</Text>
          </TouchableOpacity></View>
        }
      </View>
    )
  }

  _renderConfirmMessage () {
    const { data, intl, isOnline } = this.props
    if (data.is_confirmed) return null
    const fm = intl.formatMessage

    return (
      <View style={styles.verificationMessageContainer}>
        <Text style={styles.verificationMessageText}>{fm(m.native.ForwardAddress.addressNotBeenVerified)}</Text>
        <TouchableOpacity onPress={this._requestConfirmationEmail} disabled={!isOnline}>
          <Text style={[styles.verificationMessageButton, !isOnline && styles.disabled]}>{fm(m.native.ForwardAddress.sendVerificationEmail).toUpperCase()}</Text>
        </TouchableOpacity>
        { data.confirmation_sent_on && <Text style={styles.verificationMessageLastSentText}>{fm(m.native.ForwardAddress.lastConfirmationRequest, { lastTest: timeAgo(data.confirmation_sent_on, intl) })}</Text> }
      </View>
    )
  }

  render () {
    const { data, intl, avatar } = this.props
    const fm = intl.formatMessage

    // Adding a check for the scenario -
    // In the edit screen if the user delete's the ESP, the data object would become undefined.
    if (!data) {
      return (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator animating />
        </View>
      )
    }

    return (
      <ScrollView style={styles.main}>
        <Header name={data.display_name} email={data.email} avatar={avatar} />

        { this._renderConfirmMessage() }

        { this._renderSetDefault() }

        <SimpleTiles
          title={fm(m.app.Billing.history).toUpperCase()}
          titleIconComponent={FontAwesomeIcon}
          titleIconName='history'
          tilesData={this._getHistoryData()}
        />

      </ScrollView>
    )
  }
}

const NavAddButton = withNetworkState(({ navigation, fm, networkOnline }) => (
  <HeaderButton
    title={fm(m.app.Common.edit)}
    onPress={() => navigation.navigate('CreateForwardAddress', { id: navigation.state.params.id })}
    color={palette.link}
    disabled={!networkOnline}
  />
))

const IntlForwardAddressDetail = injectIntl(ForwardAddressDetail)
IntlForwardAddressDetail.navigationOptions = ({ navigation, screenProps: { fm } }) => ({
  tabBarVisible: false,
  title: fm(m.native.ForwardAddress.listTitle),
  headerLeft: <HeaderButton isBack onPress={() => navigation.goBack()} />,
  headerRight: navigation.state.params.noEdit ? null : (
    <NavAddButton navigation={navigation} fm={fm} />
  )
})

const mapStateToProps = (state, ownProps) => ({
  data: pathOr(
    getDataItemForId(state.useremail, ownProps.navigation.state.params.id),
    ['navigation', 'state', 'params', 'detail'],
    ownProps
  ),
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  useremailRequestConfirmation: UserEmailActions.useremailRequestConfirmation,
  useremailSetDefault: UserEmailActions.useremailSetDefault,
  displayNotification: NotificationActions.displayNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlForwardAddressDetail)
