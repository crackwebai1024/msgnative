import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableHighlight } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import NameEmail from 'app/Components/NameEmail'
import Avatar from 'app/Components/Avatar'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  header: {
    backgroundColor: palette.white,
    padding: '1rem',
    flexDirection: 'row',
    alignItems: 'center'
  },

  titleContainer: {
    flexShrink: 1,
    paddingLeft: '0.9rem'
  },

  name: {
    fontSize: '1rem',
    color: palette.midnightBlue,
    fontWeight: '500'
  },

  email: {
    marginTop: '0.25rem',
    fontSize: '0.9rem',
    color: palette.wetAsphalt
  },

  domain: {
    marginTop: '0.05rem',
    fontSize: '0.8rem',
    color: palette.asbestos
  }
})

const Header = ({
  name, email, avatar, children
}) => (
  <View style={styles.header}>
    <Avatar name={name || email} avatar={avatar} email={email} />
    <View style={styles.titleContainer}>
      <NameEmail
        name={name}
        email={email}
        nameStyle={styles.name}
        emailStyle={styles.email}
        domainStyle={styles.domain}
        highlightEmailAsName
      />
      {children}
    </View>
  </View>
)

Header.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string
}

export default Header
