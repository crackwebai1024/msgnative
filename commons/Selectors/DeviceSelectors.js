export const WebRTCSupportedBrowsers = {
  chrome: {
    version: 56,
    name: 'Google Chrome'
  },
  firefox: {
    version: 52,
    name: 'Firefox'
  },
  opera: {
    version: 44,
    name: 'Opera'
  }
}

export const isBrowserSupported = (state) => {
  if (!state || !state.device) return false

  let name = state.device.browser_name
  let version = state.device.browser_version

  if (!name || !version) return false

  name = name.toLowerCase()

  if (!WebRTCSupportedBrowsers[name]) return false

  version = parseInt(version.split('.')[0])
  if (!version) return false

  return (version >= WebRTCSupportedBrowsers[name].version)
}

export const isWebRTCSupported = state => state.device && state.device.is_webrtc_supported && isBrowserSupported(state)
