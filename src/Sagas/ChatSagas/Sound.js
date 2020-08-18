import { Platform, NativeEventEmitter, NativeModules } from 'react-native'
import { eventChannel, delay } from 'redux-saga'
import { select, call, take, race } from 'redux-saga/effects'
import Sound from 'react-native-sound'
import RNCallKit from 'react-native-callkit'

import { WebrtcTypes, ICE_GATHERING_STATE } from 'commons/Redux/WebrtcRedux'
import { createSound } from 'app/Lib/Audio'

const { RNSound } = NativeModules

const CALLKIT_ICON_FNAME = 'callKitIcon.png'
const RING_SOUND_FNAME = 'ring.mp3'
const soundEventManger = new NativeEventEmitter(RNSound)

export async function setSpeakerOn () {
  console.log('setSpeakerOn: entered')
  if (Platform.OS === 'ios') {
    Sound.setSpeakerPhone(true)
  } else if (Platform.OS === 'android') {
    Sound.setMode('VideoChat')
  }
}

export async function setSpeakerOff () {
  console.log('setSpeakerOff: entered')
  if (Platform.OS === 'ios') {
    Sound.setSpeakerPhone(false)
  } else if (Platform.OS === 'android') {
    Sound.setMode('VoiceChat')
  }
}

export function * setupCallKit () {
  yield delay(2000)
  const options = { appName: 'MsgSafe', imageName: CALLKIT_ICON_FNAME }
  const ringtoneSound = yield select(s => s.user.data.video_call_ringtone)
  const { inboundCallOffer, outboundCallData } = yield select(s => s.webrtc)

  // do not setup callkit while on the call
  // because it probably causes the stale callkit state
  if (inboundCallOffer || outboundCallData) {
    return
  }

  if (ringtoneSound) {
    options.ringtoneSound = ringtoneSound
  }
  RNCallKit.setup(options)
}

export function * videoChatRinger () {
  // todo: replace this with a better condition
  // maybe wait for ice gathering state new

  // wait couple of seconds before starting the ringer
  // as on iOS, the speaker is turned off after the call starts
  // and that stop the ringer

  console.info('videoChatRinger: playing ringer')
  // In iOS MultiRoute will be used to play sound in accessory devices and in speaker
  const ringSound = yield call(createSound, RING_SOUND_FNAME, Platform.OS === 'ios' ? 'PlayAndRecord' : 'Playback', -1, 1.0)
  console.info('videoChatRinger: ringSound - ', ringSound)
  ringSound.play()

  console.info('videoChatRinger: waiting until end or answer')

  const stop = yield race({
    videoCallEnded: take(WebrtcTypes.END_VIDEO_CALL),
    isConnected: take(WebrtcTypes.OUTBOUND_VIDEO_CALL_ANSWER_RECEIVED) // Answered
  })
  console.info('videoChatRinger: stopping ringer - ', stop)
  ringSound.stop()
  ringSound.release()
}

export function * videoChatRingerDaemon () {
  while (true) {
    const action = yield take(WebrtcTypes.START_RINGER)
    console.info('videoChatRingerDaemon: action=', action)
    yield call(videoChatRinger)
  }
}

export function * createSpeakerStateListenerChannel () {
  if (Platform.OS === 'ios') {
    return eventChannel((emit) => {
      const callback = (payload) => {
        console.info('createSpeakerStateListenerChannel: speaker state changed to - ', payload)
        emit({
          type: 'OS_SPEAKER_STATE_CHANGED',
          ...payload
        })
      }

      soundEventManger.addListener('RNSoundRouteChange', callback)
      return () => {}
    })
  }
}
