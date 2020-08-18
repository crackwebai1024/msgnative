export const isRemoteVideoPlaying = (state) => {
  const { isConnected, remoteFeedURL, remoteCameraEnabled } = state.webrtc
  return isConnected && remoteFeedURL && remoteCameraEnabled
}

export const isLocalVideoPlaying = (state) => {
  const { localFeedURL, localCameraEnabled } = state.webrtc
  return Boolean(localFeedURL && localCameraEnabled)
}
