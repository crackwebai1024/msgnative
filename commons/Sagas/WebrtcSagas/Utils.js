import { path, find, findIndex, mergeAll } from 'ramda'
import { call, select } from 'redux-saga/effects'
import sdpTransform from 'sdp-transform'

import { areLibrariesAvailable, scanDevices } from 'app/Lib/WebRTC'

// Parses the candidate string
export function parseCandidate (c) {
  if (!c) return
  try {
    const needle = 'candidate'
    const pos = c.indexOf(needle) + needle.length
    const flds = c.substr(pos).split(' ')
    // console.info(flds)
    return {
      component: flds[1],
      type: flds[7],
      protocol: flds[2],
      address: flds[4],
      port: flds[5],
      priority: flds[3]
    }
  } catch (e) {
    console.info('_parseCandidate caught e=', e)
  }
}

export function prioritiseH264OnSDP (sdpString) {
  // console.info('before munging - ', JSON.stringify(sdpString))
  const parsedSDP = sdpTransform.parse(sdpString)

  const videoMediaIndex = findIndex(m => m.type === 'video', parsedSDP.media)
  if (videoMediaIndex === -1) return sdpString

  // Find H264 object on rtp
  const h264 = find(
    c => c.codec === 'H264',
    path(['media', videoMediaIndex, 'rtp'], parsedSDP)
  )
  if (!h264) {
    console.info('prioritiseH264OnSDP: unable to find H264 support in SDP')
    return sdpString
  }

  // Change H264 payload value from number to string
  const h264Payload = h264.payload + ''

  // Extract payloads as array
  const payloads = path(['media', videoMediaIndex, 'payloads'], parsedSDP).split(' ')
  // Find index of H264's payload value in the array
  const payloadsH264Index = payloads.indexOf(h264Payload)
  if (payloadsH264Index === -1) {
    console.info('prioritiseH264OnSDP: unable to find H264 index in SDP payloads')
  }

  // Move the H264's payload value to the beginning of the array
  payloads.splice(payloadsH264Index, 1)
  payloads.unshift(h264Payload)

  // Set the changed payloads string on the parsed SDP object
  parsedSDP.media[videoMediaIndex].payloads = payloads.join(' ')

  const mungedSDP = sdpTransform.write(parsedSDP)
  // console.info('after munging - ', JSON.stringify(mungedSDP))

  return mungedSDP
}

export function * getLocalMedia () {
  const localMedia = {
    audioDevices: [],
    videoDevices: [],
    isCapable: false,
    haveScanned: false,
    haveAudioDevice: false,
    haveVideoDevice: false,
    isReactNative: yield select(s => s.device.isReactNative)
  }
  // console.info('getLocalMedia: initial localMedia -', localMedia)

  const libsAvailable = yield call(areLibrariesAvailable)
  if (!libsAvailable) return localMedia

  const devices = yield call(scanDevices)
  localMedia.haveScanned = true

  if (!localMedia || !localMedia.haveScanned || !devices || !devices.length) return localMedia

  for (const device of devices) {
    if (device.kind.startsWith('video')) {
      console.info('getLocalMedia: found video device=', device)
      localMedia.haveVideoDevice = true
      localMedia.videoDevices.push(device)
    } else if (device.kind.startsWith('audio')) {
      console.info('getLocalMedia: found audio device=', device)
      localMedia.haveAudioDevice = true
      localMedia.audioDevices.push(device)
    }
  }
  if (localMedia.haveAudioDevice || localMedia.haveVideoDevice) {
    localMedia.isCapable = true
  }

  return localMedia
}

const stringToBoolean = x => x === 'true'

export function parseWebRTCStats (stats) {
  const data = {
    isInitiator: null,
    selectedCandidatePairId: null,
    ciphers: {
      dtls: null,
      srtp: null
    },
    codec: {
      audio: null,
      video: null
    },
    candidatePairs: [],
    candidates: {}
  }

  for (let item of stats) {
    const values = mergeAll(item.values)

    switch (item.type) {
      case 'googLibjingleSession':
        data.isInitiator = stringToBoolean(values.googInitiator)
        break

      case 'googComponent':
        // If there's no `selectedCandidatePairId` property
        // then there are no other relevant values on this item
        if (!values.selectedCandidatePairId) break
        data.selectedCandidatePairId = values.selectedCandidatePairId
        data.ciphers.dtls = values.dtlsCipher
        data.ciphers.srtp = values.srtpCipher
        break

      case 'googCandidatePair':
        data.candidatePairs.push({
          id: item.id,
          isActive: stringToBoolean(values.googActiveConnection),
          localCandidateId: values.localCandidateId,
          remoteCandidateId: values.remoteCandidateId
        })
        break

      case 'localcandidate':
      case 'remotecandidate':
        data.candidates[item.id] = {
          ip: values.ipAddress,
          port: values.portNumber,
          priority: values.priority,
          transport: values.transport,
          type: values.candidateType,
          source: item.type === 'localcandidate' ? 'local' : 'remote'
        }
        break

      case 'ssrc':
        if (!item.id.endsWith('_send')) break
        data.codec[values.mediaType] = values.googCodecName
    }
  }

  return data
}
