import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View, TouchableOpacity } from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'

import Text from 'app/Components/BaseText'
import styles from './styles'

export default class SimpleTiles extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    titleIconComponent: PropTypes.func.isRequired,
    titleIconName: PropTypes.string.isRequired,
    tilesData: PropTypes.array.isRequired
  }

  static defaultProps = {
    title: '',
    tilesData: []
  }

  _renderTileFooter (tile) {
    if (!tile.footerButtonText) return

    return (
      <TouchableOpacity style={styles.tileFooter}>
        <View style={styles.tileFooterButton}>
          <Text style={styles.tileFooterButtonText}>{tile.footerButtonText.toUpperCase()}</Text>
          <FontAwesomeIcon name='chevron-right' style={styles.tileFooterButtonIcon} />
        </View>
      </TouchableOpacity>
    )
  }

  _renderTiles () {
    const { tilesData } = this.props

    return tilesData.map(tile => (
      <View style={styles.tile} key={tile.title}>
        <View style={styles.tileContent}>
          { tile.title && <Text style={styles.tileDesc}>{tile.title}</Text> }
          <Text style={styles.tileValue}>{tile.description}</Text>
        </View>
        {this._renderTileFooter(tile)}
      </View>
    ))
  }

  render () {
    const { title, titleIconName } = this.props

    return (
      <View style={styles.tilesContainer}>

        <View style={styles.tilesContainerTitle}>
          <this.props.titleIconComponent name={titleIconName} style={styles.tilesContainerTitleIcon} />
          <Text style={styles.tilesContainerTitleText}>{title}</Text>
        </View>

        <View style={styles.tilesGroup}>
          {this._renderTiles()}
        </View>

      </View>
    )
  }
}
