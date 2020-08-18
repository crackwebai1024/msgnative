import React, { PureComponent } from 'react'
import Overlay from 'react-native-modal-overlay'
import { path } from 'ramda'
import { connect } from 'react-redux'

import OverlayActions, { OverlayIdentifiers } from 'app/Redux/OverlayRedux'

import { styles, overlayStyles } from './styles'
import Education from './components/Education'

class OverlayContainer extends PureComponent {
  render () {
    const { visible, selected, closeOverlay } = this.props

    return (
      <Overlay
        visible={visible}
        animationType='fadeIn'
        containerStyle={overlayStyles.container}
        childrenWrapperStyle={overlayStyles.childrenWrapper}
        onClose={closeOverlay}
      >
        { selected === OverlayIdentifiers.EDUCATION && <Education /> }
      </Overlay>
    )
  }
}

const mapStateToProps = state => ({
  visible: path(['overlay', 'open'], state),
  selected: path(['overlay', 'identifier'], state)
})

const mapDispatchToProps = {
  closeOverlay: OverlayActions.closeOverlay
}

export default connect(mapStateToProps, mapDispatchToProps)(OverlayContainer)
