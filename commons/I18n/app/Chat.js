import { defineMessages } from 'react-intl'

const ns = 'app.Chat'
const m = defineMessages({

  title: {
    id: `${ns}.title`,
    defaultMessage: 'Video'
  },

  encrypted: {
    id: `${ns}.encrypted`,
    defaultMessage: 'Encrypted'
  },
  ephemeral: {
    id: `${ns}.ephemeral`,
    defaultMessage: 'Ephemeral'
  },

  anonCallTitle: {
    id: `${ns}.anon-call-title`,
    defaultMessage: 'Start encrypted video call with a MsgSafe.io user'
  },

  yourEmailAddress: {
    id: `${ns}.your-email-ddress`,
    defaultMessage: 'Your email address or name'
  },

  msgsafeEmailAddress: {
    id: `${ns}.msgsafe-email-address`,
    defaultMessage: 'MsgSafe.io email address'
  },

  call: {
    id: `${ns}.call`,
    defaultMessage: 'Call'
  },

  notSupportedDesc: {
    id: `${ns}.not-supported-desc`,
    defaultMessage: 'MsgSafe.io uses cutting-edge technology to encrypt audio & video communications between users and guests. The feature is currently supported on {chrome}, {firefox} and {opera} browsers.'
  },

  notSupportedUnavailableMedia: {
    id: `${ns}.not-supported-unavailable-media`,
    defaultMessage: 'We are unable to detect the required media devices. Please confirm that you have access to a video camera and microphone.'
  },

  initiatingCall: {
    id: `${ns}.initiating-call`,
    defaultMessage: 'Initiating call'
  },

  noAnswer: {
    id: `${ns}.no-answer`,
    defaultMessage: 'No answer'
  },

  audioNotPresent: {
    id: `${ns}.audio-not-present`,
    defaultMessage: 'You are sending video but your microphone has been muted'
  },

  videoNotPresent: {
    id: `${ns}.video-not-present`,
    defaultMessage: 'You are sending audio but your video has been muted'
  },

  audioVideoNotPresent: {
    id: `${ns}.audio-video-not-present`,
    defaultMessage: 'Your audio and video has been muted'
  },

  tryAgain: {
    id: `${ns}.try-again`,
    defaultMessage: 'Try again'
  },

  ringing: {
    id: `${ns}.ringing`,
    defaultMessage: 'Ringing'
  },

  callFinished: {
    id: `${ns}.call-finished`,
    defaultMessage: 'Call finished'
  },

  goBack: {
    id: `${ns}.go-back`,
    defaultMessage: 'Go back'
  },

  inviteGuestPageTitle: {
    id: `${ns}.invite-guest-page-title`,
    defaultMessage: 'Contact invite to start secure video calling'
  },

  inviteGuestFormTitle: {
    id: `${ns}.invite-guest-form-title`,
    defaultMessage: 'Invite someone to call you'
  },

  inviteGuestBodyLabel: {
    id: `${ns}.invite-guest-body-label`,
    defaultMessage: 'Personalize your secure video invite'
  },

  inviteGuestInfoTitle: {
    id: `${ns}.invite-guest-info-title`,
    defaultMessage: 'How to use secure video chat'
  },

  inviteGuestInfoUserGuest: {
    id: `${ns}.invite-guest-info-user-guest`,
    defaultMessage: 'MsgSafe.io provides secure, encrypted audio & video for our users and their guests. <strong>Calls between MsgSafe.io users and guests</strong> are started by taking the following steps:'
  },

  inviteGuestInfoUserGuestPoint1: {
    id: `${ns}.invite-guest-info-user-guest-point-1`,
    defaultMessage: 'Using the form on this page, prepare and send an invite to your guest, so they can call you from their browser.'
  },

  inviteGuestInfoUserGuestPoint2: {
    id: `${ns}.invite-guest-info-user-guest-point-2`,
    defaultMessage: 'We’ll send an email that includes a link for your guest to start call(s) directed towards you.'
  },

  inviteGuestInfoUserGuestPoint3: {
    id: `${ns}.invite-guest-info-user-guest-point-3`,
    defaultMessage: 'The MsgSafe.io web app will ring and notify you of the incoming call.'
  },

  inviteGuestInfoGuestRequirement: {
    id: `${ns}.invite-guest-info-guest-requirement`,
    defaultMessage: 'Guests are not required to login or authenticate in any way.  No plugins are needed.'
  },

  inviteGuestInfoUsers: {
    id: `${ns}.invite-guest-info-users`,
    defaultMessage: '<strong>Calls between MsgSafe.io users</strong> do not require sending or receiving invites.  Users can reach each other directly by using the Call button in Contacts.  If the called user is unavailable, they will receive an email notification with the time of your call.'
  },

  inviteGuestInfoMainRequirement: {
    id: `${ns}.invite-guest-info-main-requirement`,
    defaultMessage: 'With both guest and user-to-user calls, both parties must meet minimum requirements.'
  },

  inviteGuestInfoRequirementDetails: {
    id: `${ns}.invite-guest-info-requirement-details`,
    defaultMessage: "MsgSafe.io uses cutting-edge technology to allow encrypted audio & video communications between guest users and users. Both sides of the conversation must use a supported browser.   These features are currently available to <a href='https://www.google.com/chrome/browser/' target='_blank'>Google Chrome</a>, <a href='https://www.mozilla.org/en-US/firefox/new/' target='_blank'>Mozilla Firefox</a> and <a href='http://www.opera.com/download' target='_blank'>Opera</a> users. No plugins or additional software is required."
  },

  inviteGuestInfoBrowserNameVersion: {
    id: `${ns}.invite-guest-info-browser-name-version`,
    defaultMessage: 'You are using {browser}.'
  },

  inviteGuestInfoBrowserSuggestion: {
    id: `${ns}.invite-guest-info-browser-suggestion`,
    defaultMessage: 'Please use Google Chrome, Mozilla Firefox or Opera and try your call again.'
  },

  inviteGuestInfoNoMic: {
    id: `${ns}.invite-guest-info-no-mic`,
    defaultMessage: 'You are missing a microphone, but can still receive a call.'
  },

  inviteGuestInfoNoCamera: {
    id: `${ns}.invite-guest-info-no-camera`,
    defaultMessage: 'You are missing a camera, but can still receive a call.'
  },

  inviteGuestInfoNoCameraAndMic: {
    id: `${ns}.invite-guest-info-no-camera-and-mic`,
    defaultMessage: 'You are missing a camera and a microphone.'
  },

  inviteGuestInfoAllSet: {
    id: `${ns}.invite-guest-info-all-set`,
    defaultMessage: 'You should be all set!'
  },

  sendInvite: {
    id: `${ns}.send-invite`,
    defaultMessage: 'Send invite'
  },

  inviteGuestDefaultSubject: {
    id: `${ns}.invite-guest-default-subject`,
    defaultMessage: 'Call me!'
  },

  inviteGuestDefaultBody: {
    id: `${ns}.invite-guest-default-body`,
    defaultMessage: 'Please call me using MsgSafe.io Secure Video!'
  },

  secureVideoCall: {
    id: `${ns}.secure-video-call`,
    defaultMessage: 'Secure video call'
  },

  createRoom: {
    id: `${ns}.create-room`,
    defaultMessage: 'Create Chat Room'
  },

  joinRoom: {
    id: `${ns}.join-room`,
    defaultMessage: 'Join a Chat Room'
  },

  rooms: {
    id: `${ns}.rooms`,
    defaultMessage: 'Rooms'
  },

  typing: {
    id: `${ns}.typing`,
    defaultMessage: '{members} {memberCount, number} {memberCount, plural, one {is typing encrypted message} other {are typing encrypted message}}'
  },

  noMoreMessages: {
    id: `${ns}.no-more-messages`,
    defaultMessage: 'No more messages'
  },

  pleaseSelectRoom: {
    id: `${ns}.please-select-room`,
    defaultMessage: 'Please join a chat room'
  },

  loadingMessages: {
    id: `${ns}.loading-messages`,
    defaultMessage: 'loading messages'
  },

  waitingForMembers: {
    id: `${ns}.waiting-for-members`,
    defaultMessage: 'Waiting for members...'
  },

  waitingForConnection: {
    id: `${ns}.waiting-for-connection`,
    defaultMessage: 'Waiting for connection...'
  },
  ephemeralChatMessage: {
    id: `${ns}.ephemeral-chat-message`,
    defaultMessage: 'Ephemeral chat is the safest way to send and receive messages in MsgSafe.io.'
  },
  ephemeralChatMessage1: {
    id: `${ns}.ephemeral-chat-message1`,
    defaultMessage: 'Messages are secret peer to peer directly between you and your contact. There is no message history.'
  },
  connectTerminated: {
    id: `${ns}.connection-terminated`,
    defaultMessage: 'Connection was terminated'
  },
  sendANudge: {
    id: `${ns}.send-a-nudge`,
    defaultMessage: 'Send a Nudge'
  },
  today: {
    id: `${ns}.today`,
    defaultMessage: 'Today'
  },

  yesterday: {
    id: `${ns}.yesterday`,
    defaultMessage: 'Yesterday'
  },

  encryptedChats: {
    id: `${ns}.encrypted-chats`,
    defaultMessage: 'Encrypted Chats'
  },

  statusOnline: {
    id: `${ns}.status-online`,
    defaultMessage: 'Online'
  },

  statusOffline: {
    id: `${ns}.status-offline`,
    defaultMessage: 'Offline'
  },

  e2eeEncrypted: {
    id: `${ns}.2e22-encrypted`,
    defaultMessage: 'End-to-End Encryption'
  },

  masgsafeEncrypted: {
    id: `${ns}.msgsafe-encryption`,
    defaultMessage: '{msgsafe} encryption'
  },

  encryptedChat: {
    id: `${ns}.encrypted-chat`,
    defaultMessage: 'Encrypted chat'
  },

  ephemeralChat: {
    id: `${ns}.ephemeral-chat`,
    defaultMessage: 'Ephemeral chat'
  },

  chatWith: {
    id: `${ns}.chat-with`,
    defaultMessage: 'With'
  },

  chatAs: {
    id: `${ns}.chat-as`,
    defaultMessage: 'As'
  },

  start: {
    id: `${ns}.start`,
    defaultMessage: 'Start'
  },

  startEncryptedChat: {
    id: `${ns}.start-encrypted-chat`,
    defaultMessage: 'Start {msgsafe} encrypted chat...'
  },

  startEphemeralChat: {
    id: `${ns}.start-e2ee-chat`,
    defaultMessage: 'Start end-to-end encrypted chat...'
  },

  identityRequired: {
    id: `${ns}.identity-required`,
    defaultMessage: 'Please choose a mailbox'
  },

  contactRequired: {
    id: `${ns}.contact-required`,
    defaultMessage: 'Please choose a contact to chat with'
  },

  contactCannotChat: {
    id: `${ns}.contact-cannot-chat`,
    defaultMessage: 'You cannot chat with this contact'
  },

  aboutThisConversation: {
    id: `${ns}.about-this-conversation`,
    defaultMessage: 'About this conversation'
  },

  ephemeralChatVerbose: {
    id: `${ns}.ephemeral-chat-verbose`,
    defaultMessage: 'Ephemeral chat keeps you in control of the conversation — and your data — at all times. The solution provides sender controlled, encrypted messaging that helps ensure only the intended receiver sees the message contents. There is no message history, because message history is not possible.'
  },

  encryptedChatVerbose: {
    id: `${ns}.encrypted-chat-verbose`,
    defaultMessage: '...'
  },

  youAre: {
    id: `${ns}.you-are`,
    defaultMessage: 'You are'
  },

  chatStarted: {
    id: `${ns}.chat-started`,
    defaultMessage: 'Chat started by'
  },

  you: {
    id: `${ns}.you`,
    defaultMessage: 'you'
  },

  on: {
    id: `${ns}.on`,
    defaultMessage: 'on'
  },

  members: {
    id: `${ns}.members`,
    defaultMessage: 'Members'
  },

  chat: {
    id: `${ns}.chat`,
    defaultMessage: 'Chat'
  },

  ephemeralDisabledNotice: {
    id: `${ns}.ephemeral-disabled-notice`,
    defaultMessage: 'Both parties should be online for ephemeral chat to work.'
  },

  joinedRoomBy: {
    id: `${ns}.joinedRoomBy`,
    defaultMessage: `You're joined chat room by {contact}`
  },

  userTryingReachNotAvailable: {
    id: `${ns}.userTryingReachNotAvailable`,
    defaultMessage: `The user you are trying to reach is not available.`
  },

  userNudged: {
    id: `${ns}.user-nudged`,
    defaultMessage: 'User nudged!'
  },
  unableToNudge: {
    id: `${ns}.unable-to-nudge`,
    defaultMessage: 'Unable to nudge.'
  },
  somethingWentWrong: {
    id: `${ns}.something-went-wrong`,
    defaultMessage: 'Something went wrong, please try again.'
  },
  youHaveNoConversation: {
    id: `${ns}.you-have-no-conversation`,
    defaultMessage: 'You have no conversations yet.'
  },
  startEncryptedChatByPress: {
    id: `${ns}.start-encrypted-chat-by-press`,
    defaultMessage: 'Start encrypted chats by pressing the + button on CHATS sidebar.'
  },
  chatWithContacts: {
    id: `${ns}.chat-with-contacts`,
    defaultMessage: 'You can chat with contacts who have a MsgSafe.io account.'
  },
  tellAFriend: {
    id: `${ns}.tell-a-friend`,
    defaultMessage: 'Tell a friend about MsgSafe.io'
  },
  identityNotAvailable: {
    id: `${ns}.identity-not-available`,
    defaultMessage: 'The identity is not available'
  }
})

export default m
