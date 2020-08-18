import React from 'react'
import { View } from 'react-native'

import Avatar from 'app/Components/Avatar'
import Text from 'app/Components/BaseText'

import { ListItem as s } from './style'

export const ContactListItemLite = ({
  Component, data, children, textStyle, ...props
}) => {
  Component = Component || View

  return (
    <Component style={s.container} {...props}>
      <View style={s.avatarOuter}>
        <Avatar
          textStyle={s.avatarText}
          name={data.display_name || data.email}
          email={data.email}
          // Present for device contact objects
          avatar={data.thumbnailPath}
        />
        {data.isOnline && <View style={s.avatarStatus} />}
      </View>
      <View style={s.body}>
        <Text style={[s.name, textStyle]} numberOfLines={1}>{data.display_name || data.email || ''}</Text>
        {
          data.email ? <Text style={[s.email, textStyle]} numberOfLines={1}>{data.email}</Text> : null
        }
      </View>
      {children}
    </Component>
  )
}

export default ContactListItemLite
