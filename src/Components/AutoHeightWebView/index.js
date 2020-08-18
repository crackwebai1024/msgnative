import PropTypes from 'prop-types'

import React, { Component } from 'react'
import { View, Linking, Platform, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview'

const SCALE_PAGE_TO_FIT = Platform.OS === 'android'
const {
  width: ScreenWidth
} = Dimensions.get('window')

// Do not add any comments to this! It will break because all line breaks will removed for
// some weird reason when this script is injected.

const script = `
;(function() {
  var i = 0;
  function updateHeight() {
    const d = document.getElementById('content')
    document.title = d.clientHeight;
    window.location.hash = ++i;
  }
  updateHeight();
  window.addEventListener("load", function() {
    updateHeight();
    setTimeout(updateHeight, 1000);
  });
  window.addEventListener("resize", updateHeight);
}());
`

const style = `
  <style>
    body, html, #content {
      margin: 5px;
      padding: 5px;
    }
    #content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
  </style>
  <script>
    ${script}
  </script>
`

const codeInject = (html) => {
  return `<!DOCTYPE html><html><body><div id="content">${html}</div>${style}</body></html>`
}

/**
 * Wrapped Webview which automatically sets the height according to the
 * content. Scrolling is always disabled. Required when the Webview is embedded
 * into a ScrollView with other components.
 *
 * Inspired by this SO answer http://stackoverflow.com/a/33012545
 * */
export default class AutoHeightWebView extends Component {
  static propTypes = {
    html: PropTypes.string.isRequired,
    injectedJavaScript: PropTypes.string,
    minHeight: PropTypes.number,
    onNavigationStateChange: PropTypes.func
    // style: WebView.propTypes.style
  }

  static defaultProps = {
    minHeight: 100
  }

  constructor (props) {
    super(props)

    this.handleNavigationChange = this.handleNavigationChange.bind(this)

    this.state = {
      realContentHeight: props.minHeight
    }
  }

  handleNavigationChange (navState) {
    if (navState.title) {
      const realContentHeight = parseInt(navState.title, 10) || 0 // turn NaN to 0
      if (realContentHeight > 0) {
        this.setState({ realContentHeight: realContentHeight + 20 })
      }
    }

    if (typeof this.props.onNavigationStateChange === 'function') {
      this.props.onNavigationStateChange(navState)
    }

    const url = navState.url
    if (url && url.indexOf('about:blank') !== 0 && !url.startsWith('data:text')) {
      this.webview.stopLoading()
      Linking.openURL(url)
    }
  }

  render () {
    const { html, style, minHeight, ...otherProps } = this.props

    if (!html) {
      throw new Error('WebViewAutoHeight supports only html')
    }

    /* adding extra style `overflow: 'hidden'` to avoid the following issue in WebView
      https://github.com/react-native-community/react-native-webview/issues/101#issuecomment-430984390
    */
    return (
      <View style={{ width: ScreenWidth, overflow: 'hidden' }}>
        <WebView
          {...otherProps}
          originWhitelist={['*']}
          bounces={false}
          ref={(ref) => { this.webview = ref }}
          source={{ html: codeInject(html) }}
          useWebKit={false}
          style={[style, {
            width: ScreenWidth,
            height: Math.max(this.state.realContentHeight, minHeight)
          }]}
          javaScriptEnabled
          onNavigationStateChange={this.handleNavigationChange}
          scalesPageToFit={SCALE_PAGE_TO_FIT}
        />
      </View>
    )
  }
}
