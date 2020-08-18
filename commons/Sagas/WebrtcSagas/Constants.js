export const OUTBOUND_CALL_TIMEOUT_MS = 60000
export const INBOUND_CALL_TIMEOUT_MS = 60000

// DEFAULT_ICE is TCP
export const DEFAULT_ICE = {
  iceServers: [
    {
      urls: 'turn:blink.msgsafe.io:443?transport=tcp',
      username: 'a9a2b514',
      credential: '00163e7826d6'
    }
    // // TODO: test purpose only
    // {
    //   urls: 'turn:s2.xirsys.com:80?transport=tcp',
    //   username: '8a63bcac-e16a-11e7-a86e-a62bc0457e71',
    //   credential: '8a63bdd8-e16a-11e7-b7e2-48f12b7ac2d8'
    // },

    // {
    //   urls: 'turn:turn.msgsafe.io:443?transport=tcp',
    //   username: 'a9a2b514',
    //   credential: '00163e7826d6'
    // },
  ]
}

export const DEFAULT_ICE_UDP = {
  iceServers: [
    {
      urls: 'turn:turn.msgsafe.io:443',
      username: 'a9a2b514',
      credential: '00163e7826d6'
    }
  ]
}

export const audioOnlyConstraints = {
  audio: true,
  video: false
}

/* In prod we shouldnt bother with HOST sdp */
export const ALLOW_HOST_SDP = true

// browser specific
export const DEFAULT_BROWSER_CONSTRAINTS = {
  video: true,
  audio: true
}
