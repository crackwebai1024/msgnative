import Dimensions from 'Dimensions'

const { width, height } = Dimensions.get('window')

const WebRTCDevice = () => (new Promise.resolve({
  isWebRTCSupported: true,
  hasMicrophone: true,
  hasCamera: true,
  displayWidth: width,
  displayHeight: height,
  browser: '',

  // API specific
  is_webrtc_supported: true,
  has_microphone: true,
  has_camera: true,
  display_width: width,
  display_height: height
}))

export default WebRTCDevice
