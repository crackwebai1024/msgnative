import MsgSafeChatAPI from 'commons/Services/Chat'

// Create socket
export let chatAPI = new MsgSafeChatAPI()

export function * cleanupChatSocket () {
  console.info('cleanupChatSocket: entered')
  chatAPI.userSessionStarted = false
  chatAPI.close(true)
  chatAPI = new MsgSafeChatAPI()
}
