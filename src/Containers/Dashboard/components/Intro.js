import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import EStylesheet from 'react-native-extended-stylesheet'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { NavigationActions } from 'react-navigation'

import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'

const styles = EStylesheet.create({
  main: {
    padding: '1rem',
    paddingBottom: '2rem',
    backgroundColor: '#41A3A7'
  },

  title: {
    textAlign: 'center',
    fontWeight: '800',
    color: palette.clouds,
    fontSize: '1.1rem',
    marginTop: '0.5rem'
  },

  descriptionText: {
    marginLeft: '0.5rem',
    marginRight: '0.5rem',
    marginTop: '1rem',
    fontSize: '0.85rem',
    color: palette.clouds,
    fontWeight: '500',
    lineHeight: '1.3rem'
  },

  button: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '1.75rem',
    backgroundColor: palette.white,
    padding: '0.4rem',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    borderRadius: '0.15rem'
  },

  buttonText: {
    color: '#41A3A7',
    fontSize: '0.75rem',
    fontWeight: '900',
    letterSpacing: '0.03rem'
  },

  buttonIcon: {
    marginRight: '0.5rem'
  }
})

class Intro extends Component {
  constructor (props) {
    super(props)

    this.state = {
      visible: true
    }

    this._goToNewIdentity = this._goToNewIdentity.bind(this)
  }

  _goToNewIdentity () {
    this.props.navigate({ routeName: 'CreateIdentity' })
  }

  render () {
    return (
      <View style={styles.main}>
        <Text style={styles.title}>Welcome to MsgSafe</Text>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>Create virtual email addresses and protect your personal information from marketers, phishing attacks, identity theft and more.</Text>

          <Text style={styles.descriptionText}>Each identity is associated with a virtual email address.</Text>
          <Text style={styles.descriptionText}>Please check your inbox and confirm the email address you entered while signing up.</Text>
          <Text style={styles.descriptionText}>Once your email address is confirmed, begin by creating your first identity –</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={this._goToNewIdentity}>
          <EntypoIcon name='v-card' style={[styles.buttonText, styles.buttonIcon]} />
          <Text style={styles.buttonText}>CREATE IDENTITY</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapDispatchToProps = {
  navigate: NavigationActions.navigate
}

const ConnectedIntro = connect(null, mapDispatchToProps)(Intro)

export default ConnectedIntro
