import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { getIconDataForMimeType } from 'app/Lib/FS'

class FileIcon extends PureComponent {
  static propTypes = {
    mimeType: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
  }

  render () {
    const { mimeType, style, ...props } = this.props
    const { color, iconName } = getIconDataForMimeType(mimeType)
    return (
      <Icon
        style={[{ color }, style]}
        name={iconName}
        {...props}
      />
    )
  }
}

export default FileIcon
