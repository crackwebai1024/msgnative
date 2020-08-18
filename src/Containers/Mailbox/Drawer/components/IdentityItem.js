import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'
import NameEmail from 'app/Components/NameEmail'
import palette from 'app/Styles/colors'

const styles = EStyleSheet.create({
  section: {
    marginTop: '1.4rem',
    marginBottom: '1.4rem'
  },

  sectionContent: {
    marginTop: '0.7rem'
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '0.4rem',
    paddingLeft: '1.2rem',
    paddingRight: '1.2rem'
  },

  title: {
    color: palette.clouds,
    fontSize: '0.8rem',
    fontWeight: '800',
    letterSpacing: '0.04rem'
  },

  titleIcon: {
    color: palette.clouds,
    marginLeft: '0.2rem'
  },

  itemContainer: {
    flex: 1,
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    borderBottomColor: palette.midnightBlue,
    borderBottomWidth: 1
  },

  'itemContainer:first-child': {
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem'
  },

  'itemContainer:last-child': {
    borderBottomWidth: 0
  },

  item: {
    marginTop: '0.3rem',
    marginBottom: '0.3rem'
  },

  name: {
    flex: 1,
    color: palette.clouds,
    fontSize: '0.85rem',
    fontWeight: '600'
  },

  nameIcon: {
    color: palette.greenSea,
    fontSize: '0.9rem',
    marginLeft: '0.2rem'
  },

  email: {
    color: palette.clouds,
    fontSize: '0.75rem',
    opacity: 0.85
  },

  domain: {
    color: palette.clouds,
    fontSize: '0.75rem',
    fontWeight: '500',
    opacity: 0.82
  }

})

export default class IdentityItems extends Component {
  static propTypes = {
    items: PropTypes.array
  }
  constructor (props) {
    super(props)

    this.activeIcon = <EntypoIcon name='check' style={styles.nameIcon} />
  }

  render () {
    return this.props.items.map((item, index) => (
      <TouchableOpacity
        key={item.key}
        style={EStyleSheet.child(styles, 'itemContainer', index, this.props.items.length)}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <NameEmail
          name={item.name}
          email={item.email}
          nameIcon={item.active ? this.activeIcon : null}
          style={styles.item}
          nameStyle={styles.name}
          emailStyle={styles.email}
          domainStyle={styles.domain}
          active={item.active}
          highlightEmailAsName
        />
      </TouchableOpacity>
    ))
  }
}
