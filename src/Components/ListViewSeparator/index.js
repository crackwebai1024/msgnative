import React from 'react'
import { View } from 'react-native'

import palette from 'app/Styles/colors'

const styles = {
  flex: 1,
  height: 1,
  backgroundColor: palette.clouds
}

// export default (sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles} />
export default () => <View style={styles} />
