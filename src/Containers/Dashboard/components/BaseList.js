import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, ActivityIndicator, TouchableOpacity } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'

import ListItem from 'app/Components/ListItem'
import Text from 'app/Components/BaseText'
import renderSeparator from 'app/Components/ListViewSeparator'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import styles from '../styles'

class BaseList extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    actionText: PropTypes.string,
    onActionPress: PropTypes.func,
    onItemPress: PropTypes.func,

    data: PropTypes.object,
    dataOrder: PropTypes.array,
    inProgress: PropTypes.bool,
    error: PropTypes.string,

    itemCount: PropTypes.number,
    listItemComponent: PropTypes.func.isRequired
  }

  static defaultProps = {
    itemCount: 5
  }

  _renderContent () {
    const {
      title,
      data,
      dataOrder,
      itemCount,
      listItemComponent,
      inProgress,
      onItemPress,
      noItemsMessage,
      intl
    } = this.props

    if (!data || !dataOrder) {
      return inProgress ? <ActivityIndicator animating style={styles.activityIndicator} /> : null
    }

    if (data && dataOrder.length === 0) {
      return (
        <View style={styles.noItemsMessage}>
          <Text style={styles.noItemsMessageText}>{(noItemsMessage || intl.formatMessage(m.app.Common.listItemsNotFound)).toUpperCase()}</Text>
        </View>
      )
    }

    const list = dataOrder.slice(0, itemCount).map(key => (
      <View key={key}>
        <ListItem
          component={listItemComponent}
          key={data[key].id}
          data={data[key]}
          onPress={onItemPress}
        />
        {renderSeparator(0, key)}
      </View>

    ))

    return (
      <View style={[styles.sectionContent, styles.borderTop]}>
        {list}
      </View>
    )
  }

  _renderAction () {
    const { actionText, onActionPress } = this.props

    if (!actionText) return

    return (
      <TouchableOpacity style={styles.sectionHeaderLink} activeOpacity={0.7} onPress={onActionPress}>
        <Text style={styles.sectionHeaderLinkText}>{actionText}</Text>
        <Entypo name='chevron-thin-right' style={styles.sectionHeaderLinkIcon} />
      </TouchableOpacity>
    )
  }

  render () {
    const { title } = this.props

    return (
      <View style={styles.section}>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>{title}</Text>
          </View>
          { this._renderAction() }
        </View>

        { this._renderContent() }

      </View>
    )
  }
}

export default injectIntl(BaseList)
