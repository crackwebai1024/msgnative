import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { shallowEqual } from 'recompose'
import { SwipeRow } from 'react-native-swipe-list-view'
import EStyleSheet from 'react-native-extended-stylesheet'
import FAIcon from 'react-native-vector-icons/FontAwesome'

import palette from 'app/Styles/colors'
import commonStyles from 'app/Styles/common'

const styles = EStyleSheet.create({
  itemBackground: {
    backgroundColor: palette.white
  },

  itemContainer: {
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    backgroundColor: palette.white
  },

  selectIcon: {
    color: palette.silver,
    fontSize: '1.1rem',
    width: '2rem'
  },

  selectIconSelected: {
    color: palette.peterRiver
  }
})

export default class ListViewSwipeableRow extends Component {
  static propTypes = {
    data: PropTypes.object,
    keyExtractor: PropTypes.func,
    component: PropTypes.func.isRequired,
    onPress: PropTypes.func,
    onLongPress: PropTypes.func,

    // custom props passed to list item component
    listItemProps: PropTypes.object,

    // Enable item selection
    enableItemSelection: PropTypes.bool,
    // Is the item selected
    isSelected: PropTypes.bool,

    swipeLeftOpenValue: PropTypes.number,
    swipeRightOpenValue: PropTypes.number
  }

  static defaultProps = {
    swipeComponent: View,
    swipeLeftOpenValue: 0,
    swipeRightOpenValue: 0,
    listItemProps: {}
  }

  _handlePress = () => {
    const { onPress, data, closeOnRowPress, isRowOpen } = this.props
    if (isRowOpen() && closeOnRowPress) {
      this.props.onCloseSwipeRequested()
    } else if (onPress) {
      onPress(data)
    }
  }

  _handleLongPress = () => {
    const { onLongPress, data } = this.props

    onLongPress && onLongPress(data)
  }

  _getKey = () => {
    return this.props.keyExtractor(this.props.data)
  }

  _getRef = () => {
    return this.props.keyMap[this._getKey()]
  }

  openSwipeRow = (toValue) => {
    this._getRef().manuallySwipeRow(toValue)
  }

  shouldComponentUpdate (nextProps) {
    const updateProps = ['data', 'enableItemSelection', 'isSelected', 'swipeLeftOpenValue', 'swipeRightOpenValue', 'listItemProps']

    if (updateProps.find(key => !shallowEqual(this.props[key], nextProps[key]))) {
      return true
    }

    return false
  }

  _renderSelect = () => {
    const { enableItemSelection, isSelected } = this.props
    if (!enableItemSelection) return null

    return (
      <FAIcon
        name={isSelected ? 'check-circle' : 'circle-thin'}
        style={[styles.selectIcon, isSelected && styles.selectIconSelected]}
      />
    )
  }

  render () {
    const { data } = this.props

    return (
      <View style={styles.itemBackground}>
        <TouchableOpacity
          style={[styles.itemContainer, commonStyles.horizontalAlign]}
          underlayColor={palette.white}
          onPress={this._handlePress}
          onLongPress={this._handleLongPress}
        >
          { this._renderSelect() }
          <this.props.component
            data={data}
            onPress={this._handlePress}
            isRowOpen={this.props.isRowOpen}
            {...this.props.listItemProps}
            onOpenSwipeRequested={this.openSwipeRow}
            onCloseSwipeRequested={this.props.onCloseSwipeRequested}
          />
        </TouchableOpacity>
      </View>
    )
  }
}
