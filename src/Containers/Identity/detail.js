import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { isNil } from 'ramda'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { NavigationActions, StackActions } from 'react-navigation'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import EStyleSheet from 'react-native-extended-stylesheet'
import moment from 'moment'
import emojiFlags from 'emoji-flags'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import MailboxActions from 'commons/Redux/MailboxRedux'
import { getDataItemForId } from 'commons/Redux/_Utils'
import { withNetworkState } from 'commons/Lib/NetworkStateProvider'

import Text from 'app/Components/BaseText'
import SimpleTiles from 'app/Components/SimpleTiles'
import { Header, Button, ButtonGroup } from 'app/Components/DetailView'
import HeaderButton from 'app/Components/HeaderButton'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  main: {
    flex: 1,
    paddingBottom: '3.125rem',
    backgroundColor: '#f9f9f9'
  },

  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  country: {
    marginTop: '0.3rem',
    flexDirection: 'row',
    alignItems: 'center',
    color: palette.concrete,
    fontSize: '0.7rem',
    marginRight: '0.3rem'
  }
})

class IdentityDetail extends Component {
  static propTypes = {
    data: PropTypes.object,
    setFilterIdentityIdForEmails: PropTypes.func,
    navigation: PropTypes.PropTypes.object,
    avatarImage: PropTypes.object,
    intl: PropTypes.object,
    isOnline: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this._goToEmailsForIdentity = this._goToEmailsForIdentity.bind(this)
  }

  _goToEmailsForIdentity () {
    const { data, setFilterIdentityIdForEmails, navigation } = this.props
    setFilterIdentityIdForEmails([data.id])
    navigation.navigate('MailboxList')
  }

  _goToList () {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'IdentityList' })]
    }))
  }

  _getHistoryData () {
    const { data, intl } = this.props
    const fm = intl.formatMessage
    return [
      { title: fm(m.native.Contact.lastActivity), description: `${moment.utc(data.last_activity_on).fromNow()}` },
      { title: fm(m.native.Contact.modified), description: `${moment.utc(data.modified_on).fromNow()}` },
      { title: fm(m.native.Contact.created), description: `${moment.utc(data.created_on).fromNow()}` }
    ]
  }

  _getEmailsCountData () {
    const { data, intl } = this.props
    const fm = intl.formatMessage
    return [
      {
        title: fm(m.native.Contact.received),
        description: data.lt_mail_recv
        // footerButtonText: 'View All'
      },
      {
        title: fm(m.native.Contact.sent),
        description: data.lt_mail_sent
        // footerButtonText: 'View All'
      },
      {
        title: fm(m.native.Contact.blocked),
        description: data.lt_mail_recv_blocked
        // footerButtonText: 'View All'
      }
    ]
  }

  componentWillReceiveProps (nextProps) {
    if (!isNil(this.props.data) && isNil(nextProps.data)) {
      this._goToList()
    }
  }

  render () {
    const { data, avatarImage, intl, isOnline } = this.props
    if (!data) {
      return (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator animating />
        </View>
      )
    }
    const fm = intl.formatMessage
    const country = (data.region && data.region !== 'zz') ? emojiFlags.countryCode(data.region) : { name: 'Random', emoji: '🌎' }

    return (
      <ScrollView style={styles.main}>

        <Header name={data.display_name ? `${data.display_name}` : ''} email={data.email} avatar={avatarImage}>
          <Text style={styles.country}>{country.emoji} {country.name}</Text>
        </Header>

        <ButtonGroup>

          <Button
            text={fm(m.native.Contact.emails)}
            iconComponent={EntypoIcon}
            iconName='mail'
            onPress={this._goToEmailsForIdentity}
            disabled={!isOnline}
          />

        </ButtonGroup>

        <SimpleTiles
          title={fm(m.native.Contact.history)}
          titleIconComponent={FontAwesomeIcon}
          titleIconName='history'
          tilesData={this._getHistoryData()}
        />

        <SimpleTiles
          title={fm(m.native.Contact.emails).toUpperCase()}
          titleIconComponent={FontAwesomeIcon}
          titleIconName='envelope'
          tilesData={this._getEmailsCountData()}
        />

      </ScrollView>
    )
  }
}

const NavEditButton = withNetworkState(({ navigation, fm, networkOnline }) => (
  <HeaderButton
    title={fm(m.app.Common.edit)}
    onPress={() => navigation.navigate('EditIdentity', { id: navigation.state.params.id })}
    color={palette.link}
    disabled={!networkOnline}
  />
))

const IntlIdentityDetail = injectIntl(IdentityDetail)
IntlIdentityDetail.navigationOptions = ({ navigation, screenProps: { fm } }) => ({
  tabBarVisible: false,
  title: fm(m.native.Contact.identity),
  headerRight: (
    <NavEditButton navigation={navigation} fm={fm} />
  ),
  headerLeft: <HeaderButton isBack onPress={() => navigation.goBack()} />
})

const mapStateToProps = (state, ownProps) => ({
  data: getDataItemForId(state.identity, ownProps.navigation.state.params.id, ownProps.navigation.state.params.email),
  isOnline: state.app.isNetworkOnline
})

const mapDispatchToProps = {
  setFilterIdentityIdForEmails: MailboxActions.toggleMailboxIdentityFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlIdentityDetail)
