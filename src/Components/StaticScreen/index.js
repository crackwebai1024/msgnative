import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ScrollView, TouchableOpacity, View, Text } from 'react-native'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { NavigationActions } from 'react-navigation'

const s = EStyleSheet.create({

  top: {
    height: '4rem',
    paddingTop: '2rem',
    paddingRight: '0.75rem',
    paddingLeft: '1rem',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },

  title: {
    fontSize: '1.25rem',
    fontWeight: '600'
  },

  scroller: {
    paddingRight: '1rem',
    paddingBottom: '2rem',
    paddingLeft: '1rem'
  },

  bottomSpacer: {
    height: '6rem'
  },

  icon: {
    textAlign: 'right',
    fontSize: '1.75rem'
  }
})

class StaticScreen extends Component {
  static propTypes = {
    children: PropTypes.any,
    title: PropTypes.string
  }

  render () {
    const { children, title, goBack } = this.props
    return (
      <View style={s.container}>
        <View style={s.top}>
          <Text style={s.title}>{title || ''}</Text>
          <TouchableOpacity onPress={goBack} >
            <Icon name='close' style={s.icon} />
          </TouchableOpacity>
        </View>
        <ScrollView style={s.scroller}>
          {children}
          <View style={s.bottomSpacer} />
        </ScrollView>
      </View>
    )
  }
}

const mapDispatchToProps = {
  goBack: () => NavigationActions.back({ key: null })
}

const ConnectedStaticScreen = connect(null, mapDispatchToProps)(StaticScreen)

export default ConnectedStaticScreen
