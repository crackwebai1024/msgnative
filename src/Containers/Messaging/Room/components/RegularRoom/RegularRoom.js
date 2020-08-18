import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import InteractionManager from 'app/Components/InteractionManager'

import MessageList from '../MessageList'

export default class RegularRoom extends PureComponent {
  static propTypes = {
    initialScrollPosition: PropTypes.number
  }

  constructor (props) {
    super(props)

    this._setRef = this._setRef.bind(this)
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions(() => {
      const { initialScrollPosition } = this.props

      if (!this.chatViewRef) {
        return
      }

      const scrollView = this.chatViewRef._messageContainerRef

      if (!scrollView || !initialScrollPosition) {
        return
      }

      scrollView.scrollTo({
        y: initialScrollPosition,
        animated: true
      })
    })
  }

  _setRef (ref) {
    this.chatViewRef = ref
  }

  render () {
    return (
      <MessageList
        setRef={this._setRef}
        {...this.props}
      />
    )
  }
}
