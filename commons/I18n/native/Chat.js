import { defineMessages } from 'react-intl'

const ns = 'native.Chat'
const m = defineMessages({

  title: {
    id: `${ns}.title`,
    defaultMessage: 'Video'
  },

  call: {
    id: `${ns}.call`,
    defaultMessage: 'Call'
  },

  chat: {
    id: `${ns}.chat`,
    defaultMessage: 'Chat'
  },
  start: {
    id: `${ns}.start`,
    defaultMessage: 'Start'
  },
  encrypted: {
    id: `${ns}.encrypted`,
    defaultMessage: 'Encrypted'
  },
  ephemeral: {
    id: `${ns}.ephemeral`,
    defaultMessage: 'Ephemeral'
  },

  ephemeralDisabledNotice: {
    id: `${ns}.ephemeral-disabled-notice`,
    defaultMessage: 'Both parties should be online for ephemeral chat to work.'
  },

  emails: {
    id: `${ns}.emails`,
    defaultMessage: 'Emails'
  },

  history: {
    id: `${ns}.history`,
    defaultMessage: 'History'
  },

  secureChat: {
    id: `${ns}.secure-chat`,
    defaultMessage: 'Secure Chat'
  },

  selectContact: {
    id: `${ns}.select-contact`,
    defaultMessage: 'Select Contact'
  },

  editContact: {
    id: `${ns}.edit-contact`,
    defaultMessage: 'Edit Contact'
  },

  addContact: {
    id: `${ns}.add-contact`,
    defaultMessage: 'Add Contact'
  },
  saveContact: {
    id: `${ns}.save-contact`,
    defaultMessage: 'Save Contact'
  },
  noChatsFound: {
    id: `${ns}.no-chats-found`,
    defaultMessage: 'No chats found'
  },
  tellAFriendBody: {
    id: `${ns}.tell-a-friend-body`,
    defaultMessage: `Hey,

    I just downloaded MsgSafe.io on my mobile device. MsgSafe.io is a smartphone app that allows me to communicate securely with encrypted email, chat, and even voice and video calling! \n
I’d like you to install it too, so we can be sure that our messages and calls are private and secure. \n
MsgSafe.io is available for iPhone and Android: \n
Download iOS App: https://www.msgsafe.io/apps/ios \n
  Download Android App: https://www.msgsafe.io/apps/android \n
  You can find out more about MsgSafe.io and all the features here: https://www.msgsafe.io \n
  Best Regards, \n

  {displayName}
  `
  },
  getOnIOSAndAndroid: {
    id: `${ns}.get-on-ios-android`,
    defaultMessage: 'Get MsgSafe on iOS and Android'
  },
  youHaveNoConversation: {
    id: `${ns}.you-have-no-conversation`,
    defaultMessage: 'You have no conversations yet.'
  },
  startEncryptedChat: {
    id: `${ns}.start-encrypted-chat`,
    defaultMessage: 'Start encrypted chats by pressing the + button in the top right corner.'
  },
  chatWithContacts: {
    id: `${ns}.chat-with-contacts`,
    defaultMessage: 'You can chat with contacts who have a MsgSafe.io account.'
  },
  tellAFriend: {
    id: `${ns}.tell-a-friend`,
    defaultMessage: 'Tell a friend about MsgSafe.io'
  },
  selectIdentity: {
    id: `${ns}.select-identity`,
    defaultMessage: 'Select Identity'
  },
  cantChatWithYourself: {
    id: `${ns}.cant-chat-with-yourself`,
    defaultMessage: 'You can\'t chat with yourself'
  },
  cantCallYourself: {
    id: `${ns}.cant-call-yourself`,
    defaultMessage: 'You can\'t call yourself'
  },
  couldNotSendImage: {
    id: `${ns}.could-not-send-image`,
    defaultMessage: 'Could not send the image.'
  },
  noMoreMessages: {
    id: `${ns}.no-more-messages`,
    defaultMessage: 'No more messages'
  },
  noMoreHistory: {
    id: `${ns}.no-more-history`,
    defaultMessage: 'No message history'
  },
  fileDownloaded: {
    id: `${ns}.file-downloaded`,
    defaultMessage: 'File {filename} downloaded'
  },
  couldNotDownload: {
    id: `${ns}.could-not-download`,
    defaultMessage: 'Could not download file {filename}'
  },
  availableForChat: {
    id: `${ns}.available-for-chat`,
    defaultMessage: '{name} is Available for Chat'
  },
  ephemeralChatMessage: {
    id: `${ns}.ephemeral-chat-message`,
    defaultMessage: 'Ephemeral chat is the safest way to send and receive messages in MsgSafe.io.'
  },
  ephemeralChatMessage1: {
    id: `${ns}.ephemeral-chat-message1`,
    defaultMessage: 'Messages are secret peer to peer directly between you and your contact. There is no message history.'
  },
  waitingForConnection: {
    id: `${ns}.waiting-for-connection`,
    defaultMessage: 'Waiting for connection...'
  },
  connectTerminated: {
    id: `${ns}.connection-terminated`,
    defaultMessage: 'Connection was terminated'
  },
  roomExists: {
    id: `${ns}.room-exists`,
    defaultMessage: 'Room already exists'
  },
  chatCreated: {
    id: `${ns}.chat-created`,
    defaultMessage: 'Chat created!'
  },
  selectIdentityToStart: {
    id: `${ns}.select-identity-to-start`,
    defaultMessage: 'Select a identity to start a chat from'
  },
  identityForChatting: {
    id: `${ns}.identity-for-chatting`,
    defaultMessage: 'This identity  will be used for chatting'
  },
  identityForCalling: {
    id: `${ns}.identity-for-calling`,
    defaultMessage: 'This identity  will be used for calling'
  },
  identityRequired: {
    id: `${ns}.identity-required`,
    defaultMessage: 'Identity is required'
  },
  contactRequired: {
    id: `${ns}.contact-required`,
    defaultMessage: 'Contact is required'
  },
  notAMsgSafeUser: {
    id: `${ns}.not-a-msgsafe-user`,
    defaultMessage: 'Not a MsgSafe.io user.'
  },
  notDisturb: {
    id: `${ns}.not-disturb`,
    defaultMessage: 'DO NOT DISTURB'
  },
  communicationAs: {
    id: `${ns}.communication-as`,
    defaultMessage: 'You are communicating as:'
  },
  withYourIdentity: {
    id: `${ns}.with-your-identity`,
    defaultMessage: 'With your identity:'
  },
  loadEarlierMessages: {
    id: `${ns}.load-earlier-messages`,
    defaultMessage: 'Load earlier messages'
  },
  isTyping: {
    id: `${ns}.is-typing`,
    defaultMessage: 'is typing...'
  },
  typeAMessage: {
    id: `${ns}.type-a-message`,
    defaultMessage: 'Type a message...'
  },
  noAccessToContacts: {
    id: `${ns}.no-access-to-contacts`,
    defaultMessage: 'MsgSafe.io Does Not Have Access to Your Contacts'
  },
  enableAccessInSetting: {
    id: `${ns}.enable-access-in-setting`,
    defaultMessage: 'Make secure communication as simple as picking your contact. Enable contact access in device settings.'
  },
  sendANudge: {
    id: `${ns}.send-a-nudge`,
    defaultMessage: 'Send a Nudge'
  },
  confirmEphemeralTerminated: {
    id: `${ns}.confirm-ephemeral-terminated`,
    defaultMessage: 'ok'
  }
})

export default m
