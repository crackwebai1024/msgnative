import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View, Image, TouchableOpacity, Platform } from 'react-native'
import Swiper from 'react-native-swiper'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n/native/Dashboard'
import MailboxActions from 'commons/Redux/MailboxRedux'
import UserActions from 'commons/Redux/UserRedux'

import Text from 'app/Components/BaseText'
import OverlayActions from 'app/Redux/OverlayRedux'

import styles from './styles'

class Education extends PureComponent {
  static propTypes = {
    intl: PropTypes.object,
    closeOverlay: PropTypes.func,
    mailboxWelcomeEmailsRequest: PropTypes.func,
    updateAccountRequest: PropTypes.func
  }
  constructor (props) {
    super(props)

    this._endEducation = this._endEducation.bind(this)
    this._getSlides = this._getSlides.bind(this)
  }

  _endEducation () {
    this.props.closeOverlay()
    this.props.mailboxWelcomeEmailsRequest()
    this.props.updateAccountRequest({
      [Platform.OS === 'ios' ? 'has_logged_in_ios' : 'has_logged_in_android']: true
    })
  }

  _getSlides () {
    const fm = this.props.intl.formatMessage
    return [(
      <TouchableOpacity style={styles.slide} activeOpacity={1} key={1}>
        <Image
          source={require('app/Images/education/badge.png')}
          style={styles.image}
        />
        <Text style={styles.titleText}>{fm(m.welcomeToMsgSafe)}</Text>
        <Text style={styles.descriptionText}>
          {fm(m.accountReadyToUse)}
        </Text>
      </TouchableOpacity>
    ), (
      <TouchableOpacity style={styles.slide} activeOpacity={1} key={2}>
        <Image
          source={require('app/Images/education/identification.png')}
          style={styles.image}
        />
        <Text style={styles.titleText}>{fm(m.msgSafeIdentities)}</Text>
        <Text style={styles.descriptionText}>
          {fm(m.identitiesText1)}
        </Text>
        <Text style={[styles.descriptionText, styles.smallHelperText]}>
          {fm(m.identitiesText2)}
        </Text>
      </TouchableOpacity>
    ), (
      <TouchableOpacity style={styles.slide} activeOpacity={1} key={3}>
        <Image
          source={require('app/Images/education/e2ee.png')}
          style={[styles.image, styles.imageE2EE]}
        />
        <Text style={styles.titleText}>{fm(m.endToEndEncryption)}</Text>
        <Text style={styles.descriptionText}>
          {fm(m.endToEndEncryptionText)}
        </Text>
      </TouchableOpacity>
    ), (
      <TouchableOpacity style={styles.slide} activeOpacity={1} key={4}>
        <Image
          source={require('app/Images/education/secure.png')}
          style={[styles.image, styles.imageE2EE]}
        />
        <Text style={styles.titleText}>{fm(m.secureEncryptedVoiceVideo)}</Text>
        <Text style={styles.descriptionText}>{fm(m.secureEncryptedVoiceVideoText)}</Text>
      </TouchableOpacity>
    ), (
      <TouchableOpacity style={styles.slide} activeOpacity={1} key={5}>
        <Image
          source={require('app/Images/education/ephemeral.png')}
          style={[styles.image, styles.imageEphemeral]}
        />
        <Text style={styles.titleText}>{fm(m.encryptedEphemeralChat)}</Text>
        <Text style={styles.descriptionText}>{fm(m.encryptedEphemeralChatText)}</Text>
      </TouchableOpacity>
    ), (
      <TouchableOpacity style={styles.slide} activeOpacity={1} key={6}>
        <Image
          source={require('app/Images/education/logo.png')}
          style={[styles.image, styles.imageLogo]}
        />
        <Text style={styles.titleText}>{fm(m.startWithMsgSafe)}</Text>
        <TouchableOpacity style={styles.button} onPress={this._endEducation}>
          <Text style={styles.buttonText}>{fm(m.takeMeToInbox).toUpperCase()}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )]
  }

  render () {
    const slideList = this._getSlides()
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={this._endEducation}>
            <Text style={styles.closeButtonText}>x</Text>
          </TouchableOpacity>
        </View>
        { slideList && slideList.length !== 0 &&
        <Swiper
          showsButtons
          removeClippedSubviews={false}
          loop={false}
          buttonWrapperStyle={{ alignItems: 'flex-end' }}
          nextButton={<Text style={styles.navButtonText}>›</Text>}
          prevButton={<Text style={styles.navButtonText}>‹</Text>}
          height='100%'
          index={0}
          bounces={false}
          scrollEnabled
          autoplay={false}
        >
          { slideList }
        </Swiper>
        }
      </View>
    )
  }
}

const IntlEducation = injectIntl(Education)

const mapDispatchToProps = {
  closeOverlay: OverlayActions.closeOverlay,
  mailboxWelcomeEmailsRequest: MailboxActions.mailboxWelcomeEmailsRequest,
  updateAccountRequest: UserActions.updateAccountRequest
}

export default connect(null, mapDispatchToProps)(IntlEducation)
