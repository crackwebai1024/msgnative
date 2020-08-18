import PropTypes from 'prop-types'
import React from 'react'
import { Image, View, TouchableOpacity, Text } from 'react-native'
import BaseText from 'app/Components/BaseText'
import FastImage from 'react-native-fast-image'
import md5 from 'md5'
import { connect } from 'react-redux'
import { path } from 'ramda'

import AvatarActions, { AVATAR_EXISTENCE_STATES } from 'commons/Redux/AvatarRedux'

const s = {
  avatarStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20
  },
  textStyle: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
    fontWeight: '100'
  }
}

class Avatar extends React.PureComponent {
   static propTypes = {
     name: PropTypes.string,
     avatar: PropTypes.any,
     onPress: PropTypes.func,
     avatarStyle: Image.propTypes.style,
     textStyle: Text.propTypes.style,
     avatarExistenceState: PropTypes.number,
     cacheEmailAvatarExistence: PropTypes.func,
     email: PropTypes.string
   }

  static defaultProps = {
    name: '',
    avatar: null,
    onPress: null,
    avatarStyle: {},
    textStyle: {},
    avatarExistenceState: AVATAR_EXISTENCE_STATES.NO,
    size: 50
  }

  _getAvatarString () {
    let name = this.props.name || ''
    const format = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/
    if (!name) {
      return ''
    }

    name = name
      .toUpperCase() // let them be all caps!
      .split(' ') // arrays are easier to work with!
      .map(str => format.test(str[0]) ? null : str[0]) // we only want the first letter of the names
      .slice(0, 3) // we only show three letters

    return name.join('')
  }

  _getAvatarColor () {
    const userName = this.props.name || ''
    let sumChars = 0
    for (let i = 0; i < userName.length; i++) {
      sumChars += userName.charCodeAt(i)
    }

    // inspired by https://github.com/wbinnssmith/react-user-avatar
    // colors from https://flatuicolors.com/
    const colors = [
      '#e67e22', // carrot
      '#2ecc71', // emerald
      '#3498db', // peter river
      '#8e44ad', // wisteria
      '#e74c3c', // alizarin
      '#1abc9c', // turquoise
      '#2c3e50' // midnight blue
    ]

    return colors[sumChars % colors.length]
  }

  _renderPlaceholder () {
    return (
      <View
        style={[
          s.avatarStyle,
          { backgroundColor: 'transparent' },
          this.props.avatarStyle
        ]}
        accessibilityTraits='image'
      />
    )
  }

  _renderAvatar (config = { styles: {}, avatarPath: null }) {
    const { email, cacheEmailAvatarExistence, avatarExistenceState, size } = this.props

    const fastImageProps = {}
    // If there's no device contact avatar and the avatar existence state is unknown
    // then attach onLoad and onError callbacks on FastImage component
    if (!config.avatarPath && avatarExistenceState === AVATAR_EXISTENCE_STATES.UNKNOWN) {
      fastImageProps.onLoad = () => { cacheEmailAvatarExistence(email, AVATAR_EXISTENCE_STATES.YES) }
      fastImageProps.onError = () => { cacheEmailAvatarExistence(email, AVATAR_EXISTENCE_STATES.NO) }
    }

    return (
      <TouchableOpacity
        disabled={!this.props.onPress}
        onPress={() => {
          const { onPress, ...other } = this.props
          onPress && onPress(other)
        }}
        accessibilityTraits='image'
      >
        <FastImage
          source={{ uri: config.avatarPath || `https://www.msgsafe.io/avatar/${md5(email)}?s=${size}&d=404` }}
          // for testing how often the urls are fetched
          // source={{uri: `http://localhost:8081/avatar/${md5(this.props.email)}?s=55&d=404`}}
          style={[s.avatarStyle, this.props.avatarStyle, config.styles]}
          {...fastImageProps}
        />
      </TouchableOpacity>
    )
  }

  _renderWithName (content) {
    return (
      <TouchableOpacity
        disabled={!this.props.onPress}
        onPress={() => {
          const { onPress, ...other } = this.props
          onPress && onPress(other)
        }}
        style={[
          s.avatarStyle,
          { backgroundColor: this._getAvatarColor() },
          this.props.avatarStyle
        ]}
        accessibilityTraits='image'
      >
        <BaseText style={[s.textStyle, this.props.textStyle]}>
          {this._getAvatarString()}
        </BaseText>
        {content}
      </TouchableOpacity>
    )
  }

  render () {
    const { name, email, avatar, avatarExistenceState } = this.props

    if (avatar && typeof avatar === 'function') {
      return avatar()
    }

    // Support avatar string, used by device contact where avatar
    // file path is provided directly
    if (avatar && typeof avatar === 'string') {
      return this._renderAvatar({ avatarPath: avatar })
    }

    // If no name & email, render placeholder
    if (!email && !name) {
      return this._renderPlaceholder()
    }

    // If only name, render initials
    if (!email && name) {
      return this._renderWithName()
    }

    // If avatar exists then just render with email
    if (avatarExistenceState === AVATAR_EXISTENCE_STATES.YES) {
      return this._renderAvatar()
    }

    if (avatarExistenceState === AVATAR_EXISTENCE_STATES.UNKNOWN) {
      // Image existence unknown, render with name
      // We are passing `this._renderAvatar()` to trigger image download
      return this._renderWithName(this._renderAvatar({ styles: { height: 1, width: 1 } }))
    }

    // If avatar doesn't exist but there's name, render initials
    if (avatarExistenceState === AVATAR_EXISTENCE_STATES.NO && name) return this._renderWithName()

    // Return placeholder if nothing else
    return this._renderPlaceholder()
  }
}

const mapStateToProps = (state, ownProps) => ({
  avatarExistenceState: ownProps.email ? (path(['avatar', 'exists', ownProps.email], state) || AVATAR_EXISTENCE_STATES.UNKNOWN) : AVATAR_EXISTENCE_STATES.UNKNOWN
})

const mapDispatchToProps = {
  cacheEmailAvatarExistence: AvatarActions.cacheEmailAvatarExistence
}

export default connect(mapStateToProps, mapDispatchToProps)(Avatar)
