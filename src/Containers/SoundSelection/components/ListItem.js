import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'

import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'

const s = EStyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '1rem',
    paddingVertical: '0.75rem',
    borderBottomWidth: 1,
    borderBottomColor: palette.clouds
  },

  containerFirst: {
    borderTopWidth: 1,
    borderTopColor: palette.clouds
  },

  text: {
    fontSize: '1rem'
  },

  icon: {
    fontSize: '1.15rem',
    color: '#555'
  }
})

class SoundSelectionItem extends PureComponent {
  constructor (props) {
    super(props)
  }

  _onPress = () => {
    this.props.onPressItem(this.props.item)
  }

  render = () => {
    const { index, item, selected } = this.props
    const style = [s.container]
    if (index === 0) {
      style.push(s.containerFirst)
    }
    return (
      <TouchableOpacity style={style} onPress={this._onPress}>
        <Text style={s.text}>{item.title || item.filename}</Text>
        {selected && <Icon style={s.icon} name='check' />}
      </TouchableOpacity>
    )
  }
}

export default SoundSelectionItem
