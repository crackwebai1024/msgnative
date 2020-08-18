import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Text from 'app/Components/BaseText'
import { ContactListItemLite } from 'app/Components/ContactListItem'

export const s = EStyleSheet.create({
  textUnconfirmed: {
    color: '#9b9b9b',
    lineHeight: '1rem',
    fontStyle: 'italic'
  },

  iconUnconfirmed: {
    color: 'red',
    fontSize: '1.2rem'
  },

  defaultMark: {
    fontSize: '0.7rem'
  }
})

class ForwardAddressListItem extends PureComponent {
  static propTypes = {
    data: PropTypes.object.isRequired
  }

  renderConfirmAndDefaultStatus () {
    const { data } = this.props
    if (data.is_confirmed && !data.is_default) { return null }

    return <View>
      { !data.is_confirmed
        ? <FontAwesome style={s.iconUnconfirmed} name='warning' />
        : data.is_default &&
        <Text style={s.defaultMark}>default</Text>
      }
    </View>
  }

  render () {
    const { data } = this.props
    return ContactListItemLite({
      data,
      textStyle: !data.is_confirmed && s.textUnconfirmed,
      children: this.renderConfirmAndDefaultStatus()
    })
  }
}

export default ForwardAddressListItem
