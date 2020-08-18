import WebRTC, {
  MediaStream, MediaStreamTrack, getUserMedia,
  RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
} from 'react-native-webrtc'

export const WebRTCLib = WebRTC

export function areLibrariesAvailable () {
  return (
    typeof WebRTC !== 'undefined' &&
    typeof RTCPeerConnection !== 'undefined' &&
    typeof RTCSessionDescription !== 'undefined' &&
    typeof RTCIceCandidate !== 'undefined' &&
    typeof MediaStream !== 'undefined' &&
    typeof MediaStreamTrack !== 'undefined' &&
    typeof getUserMedia !== 'undefined'
  )
}

export async function scanDevices () {
  const devices = await WebRTCLib.MediaStreamTrack.getSources()
  return devices
}

// native specific
export function getNativeUserMedia (constraints) {
  return WebRTCLib.getUserMedia(constraints)
}

// native specific
export function getNativeSourceIdByDirection (direction = null, localMedia = null) {
  if (!direction || !localMedia) {
    return
  }
  try {
    console.info('getNativeSourceIdByDirection localMedia -', localMedia)
    const n = localMedia.videoDevices.length
    for (let i = 0; i < n; i++) {
      const track = localMedia.videoDevices[i]
      console.info('getNativeSourceIdByDirection track -', track)
      if (track.facing === direction) {
        console.info('getNativeSourceIdByDirection returning track.id -', track.id)
        return track.id
      }
    }
  } catch (e) {
    console.info('getNativeSourceIdByDirection error -', e)
  }
}

// native specific
export function setNativeRemoteDescription (peer, sdp) {
  return new Promise((resolve, reject) => {
    peer.setRemoteDescription(sdp, () => {
      resolve(true)
    }, (e) => {
      console.info('FAILED e -', e)
      reject(e)
    })
  })
}

// native specific
export function createNativeAnswer (peer) {
  return new Promise((resolve, reject) => {
    peer.createAnswer((answer) => {
      resolve(answer)
    }, (e) => {
      console.info('FAILED e -', e)
      reject(e)
    })
  })
}

export function createNativeOffer (peer) {
  return new Promise((resolve, reject) => {
    peer.createOffer((offer) => {
      resolve(offer)
    }, (e) => {
      console.info('FAILED e -', e)
      reject(e)
    })
  })
}

export function setNativeLocalDescription (peer, data) {
  return new Promise((resolve, reject) => {
    peer.setLocalDescription(data, () => {
      resolve(true)
    }, (e) => {
      console.info('FAILED e -', e)
      reject(e)
    })
  })
}

// native specific
export async function getNativeConstraints ({ video, audio }) {
  const constraints = {}

  if (audio) {
    constraints.audio = true
  }

  if (video) {
    const direction = 'front'

    constraints.facingMode = direction

    constraints.video = {
      facingMode: direction,
      optional: []
    }

    const devices = await scanDevices()
    for (const d of devices) {
      if (d.kind.startsWith('video') && d.facing === direction) {
        constraints.video.optional.push({ sourceId: d.id, facingMode: d.facing })
      }
    }

    // Works without having to provide min height, width & framerate
    // Let the library use the default
    constraints.video.mandatory = {
    // minWidth: 500,
    // minHeight: 300,
    // minFrameRate: 30
    }
  }

  return constraints
}
