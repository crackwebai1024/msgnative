import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableHighlight } from 'react-native'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import { injectIntl, intlShape } from 'react-intl'
import m from 'commons/I18n'
import DancingBubble from 'app/Components/Loading/DancingBubble'
import Text from 'app/Components/BaseText'
import ChatActions from 'commons/Redux/ChatRedux'
import palette from 'app/Styles/colors'
import { getContactMember } from 'commons/Selectors/Messaging'
import NotificationActions from 'commons/Redux/NotificationRedux'

const isLgScreen = '@media (min-width: 350) and (min-height: 640)'

const s = EStyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: '1.5rem',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    [isLgScreen]: {
      height: '22.68rem',
      marginTop: '2rem'
    }
  },

  text: {
    textAlign: 'center',
    fontSize: '1.0rem',
    lineHeight: '1.3rem',
    backgroundColor: 'transparent'
    // letterSpacing: -0.1
  },

  smallText: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'rgb(121, 187, 238)',
    lineHeight: '1rem',
    marginTop: '2rem',
    backgroundColor: 'transparent'
  },

  middleContent: {
    display: 'flex',
    marginTop: '2rem',
    justifyContent: 'center',
    alignItems: 'center'
  },

  waitingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },

  buttonText: {
    fontSize: '0.68rem',
    fontWeight: '800',
    fontStyle: 'normal',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#ffffff',
    alignSelf: 'center'
  },

  buttonDisabledText: {
    color: 'rgba(216, 216, 216, 0.75)',
    fontStyle: 'italic'
  },

  button: {
    width: '10rem',
    height: '2.8rem',
    marginTop: '1.7rem',
    backgroundColor: palette.ceruleanBlue,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    alignItems: 'center',
    [isLgScreen]: {
      marginTop: '3.7rem'
    }
  },

  buttonDisabled: {
    backgroundColor: 'rgba(242, 242, 242, 0.25)',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 0,
    shadowOpacity: 0
  }
})

class EphemeralWaitingOverlay extends Component {
  static propTypes = {
    data: PropTypes.object,
    intl: intlShape,
    connected: PropTypes.bool,
    displayNotification: PropTypes.func,
    isNudgeSent: PropTypes.bool,
    displayName: PropTypes.string,
    chatSendNudgeRequest: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      isNudgeDisabled: false
    }
    this.timeOutId = null
    this._disableNudge = this._disableNudge.bind(this)
    this._enableNudge = this._enableNudge.bind(this)
    this.nudge = this.nudge.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    const { intl, displayNotification } = this.props
    if (nextProps.isNudgeSent === true && this.props.isNudgeSent !== true) {
      this.timeOutId = setTimeout(() => {
        this._enableNudge()
      }, 30000)
      displayNotification(intl.formatMessage(m.native.Snackbar.userNudged), 'success', 4000)
    } else if (nextProps.isNudgeSent === false && this.props.isNudgeSent !== false) {
      displayNotification(intl.formatMessage(m.app.Chat.unableToNudge), 'danger', 4000)
      this._enableNudge()
    }
  }

  nudge () {
    if (this.state.isNudgeDisabled) {
      return
    }

    this._disableNudge()
    this.props.chatSendNudgeRequest(this.props.data.room_id, this.props.displayName)
  }

  _disableNudge () {
    this.setState({
      isNudgeDisabled: true
    })
  }

  _enableNudge () {
    this.setState({
      isNudgeDisabled: false
    })
  }

  componentWillUnmount () {
    if (this.timeOutId != null) {
      clearTimeout(this.timeOutId)
    }
  }

  render () {
    const { connected, intl } = this.props
    const { isNudgeDisabled } = this.state

    return (
      <View style={s.container}>
        <View style={s.waitingContainer}>
          <DancingBubble bubbleStyle={{ width: 9, height: 9, marginHorizontal: 2 }} jumpHeight={15} />
          <Text style={s.smallText}>
            {intl.formatMessage(m.native.Chat.waitingForConnection)}
          </Text>
        </View>
        <View style={s.middleContent}>
          <Text style={[s.text, connected ? { color: 'rgba(32,48,90,0.4)' } : { color: 'rgb(255,255,255)' }]}>
            {intl.formatMessage(m.native.Chat.ephemeralChatMessage)}
          </Text>
          <Text style={[s.text, connected ? { color: 'rgba(32,48,90,0.4)' } : { color: 'rgb(255,255,255)' }]}>
            {intl.formatMessage(m.native.Chat.ephemeralChatMessage1)}
          </Text>
          <TouchableHighlight
            underlayColor={isNudgeDisabled ? 'rgba(242, 242, 242, 0.25)' : 'rgba(255, 255, 255, 0.1)'}
            activeOpacity={isNudgeDisabled ? 1 : 0.8}
            style={[s.button, isNudgeDisabled && s.buttonDisabled]}
            onPress={this.nudge}
          >
            <View style={s.buttonContent}>
              <Text style={[s.buttonText, isNudgeDisabled && s.buttonDisabledText]}>
                {intl.formatMessage(m.native.Chat.sendANudge).toUpperCase()}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const intlEphemeralWaitingOverlay = injectIntl(EphemeralWaitingOverlay)

const mapDispatchToProps = {
  chatSendNudgeRequest: ChatActions.chatSendNudgeRequest,
  displayNotification: NotificationActions.displayNotification
}

const mapStateToProps = (state, ownProps) => {
  const contact = ownProps.data && getContactMember(ownProps.data)

  return {
    displayName: contact && contact.display_name ? contact.display_name : '',
    isNudgeSent: ownProps.data && ownProps.data.is_ephemeral_nudge_sent
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(intlEphemeralWaitingOverlay)
