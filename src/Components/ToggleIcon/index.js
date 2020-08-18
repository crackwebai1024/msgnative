import PropTypes from 'prop-types'
import React, { Component } from 'react'

// import { StyleSheet, View, Text } from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome'

export default class ToggleIcon extends Component {
  static propTypes = {
    currentValue: PropTypes.bool,
    onPress: PropTypes.func,
    iconCfg: PropTypes.object,
    style: PropTypes.object
  }
  static defaultProps = {
    currentValue: null,
    iconCfg: {
      iconTrue: { name: 'circle', color: 'white' },
      iconFalse: { name: 'dot-circle-o', color: 'red' },
      size: 25
    },
    onPress: () => { console.log('ToggleIcon default onPress') }
  }
  constructor (props) {
    super(props)
    this.state = {
      currentValue: this.props.currentValue
    }
  }

  _handleOnPress (newValue) {
    this.props.onPress(newValue)
    this.setState({ currentValue: newValue })
  }

  render () {
    // var curPropValue = this.props.currentValue
    var curStateValue = this.state.currentValue
    var curName = (
      curStateValue === true ? this.props.iconCfg.iconTrue.name : this.props.iconCfg.iconFalse.name
    )
    let newStyle = { ...this.props.style }
    if (curStateValue === true) {
      newStyle.color = this.props.iconCfg.iconTrue.color
    } else {
      newStyle.color = this.props.iconCfg.iconFalse.color
    }
    let newValue = curStateValue !== true

    /*
    console.log(
        'ToggleIcon curPropValue=' + curPropValue + ' curStateValue=' + curStateValue + ' newValue=' + newValue + ' newStyle.color=' + newStyle.color
    )
    */
    return (
      <Icon
        name={curName}
        size={this.props.iconCfg.size}
        style={newStyle}
        onPress={() => this._handleOnPress(newValue)}
      />
    )
  }
}
