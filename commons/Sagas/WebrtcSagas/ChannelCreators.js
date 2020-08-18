import { eventChannel } from 'redux-saga'

// Saga channel for `onicecandidate` callback on peer
export function createIceCandidateChannel (peer) {
  return eventChannel((emit) => {
    // const prevCallback = peer.onicecandidate
    peer.onicecandidate = (e) => {
      emit(e)
    }
    return () => { peer.onicecandidate = null }
  })
}

// Saga channel for `onaddstream` callback on peer
export function createGotRemoteStreamChannel (peer) {
  return eventChannel((emit) => {
    peer.onaddstream = e => emit(e)
    return () => { peer.onaddstream = null }
  })
}

// Saga channel for `onaddstream` callback on peer
export function createIceConnectionStateChangeChannel (peer) {
  return eventChannel((emit) => {
    peer.oniceconnectionstatechange = e => emit(e)
    return () => { peer.oniceconnectionstatechange = null }
  })
}
