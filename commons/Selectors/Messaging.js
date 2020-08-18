import { path, ifElse, pipe, prop, replace, toUpper } from 'ramda'
import { uuidv1ToDate } from 'commons/Lib/Utils'

export const isRoomE2EEWithoutOtherMembers = (room, isE2ee, memberPublicKey) => {
  if (!room || !room.room_id) return false
  let roomIsE2EEWithoutOtherMembers = false

  if (room && isE2ee && room.members) {
    const otherMembersWithPublicKey = room.members.filter(m => m.email !== room.member_email && memberPublicKey[m.email] && memberPublicKey[m.email].length)
    if (!otherMembersWithPublicKey.length) {
      roomIsE2EEWithoutOtherMembers = true
    }
  }

  return roomIsE2EEWithoutOtherMembers
}

export const isInboundCallUIVisible = state => !!path(['webrtc', 'inboundCallOffer'], state) && !path(['webrtc', 'remoteFeedURL'], state)

const displayNameOrEmailLocal = ifElse(
  prop('display_name'),
  prop('display_name'),
  pipe(prop('email'), replace(/@(\S+)/, ''), replace(/^./, toUpper)) // Strip domain from email and capitalize
)

export const getRoomTitle = (room, username) => {
  if (!room) return null

  if (!room.members && !room.title) return null

  if (room.members && room.members.length === 2 && username) {
    const member = room.members.find(member => member.email !== username)

    return displayNameOrEmailLocal(member)
  }

  if (room.history && room.history.length === 2 && username) {
    const member = room.history.find(member => member.email !== username)

    return displayNameOrEmailLocal(member)
  }

  if (room.members) {
    if (room.members.length) {
      return room.members.length > 3
        ? `${room.members.slice(0, 3).join(', ')} and ${room.members.length - 3} more`
        : room.members.map(displayNameOrEmailLocal).join(', ')
    } else {
      return 'Empty room'
    }
  }

  return ''
}

/**
 * Returns the member from room.members that is NOT
 * the current user, but the contact that she is messaging
 * with
 * @param {object} room
 * @param {object} identityEmail
 * @return {object} Returns room member object or empty member object if not found
 */
export const getContactMember = (room, identityEmail = null) => {
  const nullMember = {
    display_name: '',
    email: '',
    public_key: null
  }

  identityEmail = identityEmail || room.member_email

  if (
    !room ||
    !room.members ||
    !room.members.length ||
    !identityEmail
  ) {
    return nullMember
  }

  const contactMember = room.members && room.members.find(member => member.email !== identityEmail)
  if (contactMember) return contactMember

  const contactMemberFromHistory = room.history && room.history.find(member => member.email !== identityEmail)
  if (contactMemberFromHistory) return contactMemberFromHistory

  return nullMember
}

/**
 * Returns the member from room.members that is
 * the current user
 * @param {object} room
 * @return {object} Returns room member object or empty member object if not found
 */
export const getIdentityMember = (room) => {
  const nullMember = {
    display_name: '',
    email: '',
    public_key: null
  }
  if (
    !room ||
    !room.members ||
    !room.members.length ||
    !room.member_email
  ) {
    return nullMember
  }

  const contactMember = room.members.find(member => member.email === room.member_email)
  if (!contactMember) return nullMember
  return contactMember
}

/**
 *
 * @param {object} state      The redux store state
 * @return {number}           The total count of unread chat rooms
 */
export const getTotalUnreadRooms = (state) => {
  const { data, dataOrder } = state.chat

  if (
    !data ||
    !dataOrder ||
    !dataOrder.length
  ) {
    return 0
  }

  return dataOrder.reduce((sum, roomId) => sum + !!getTotalUnreadForRoomId(state, roomId), 0)
}

export const getTotalUnreadForRoomId = (state, roomId) => (
  (path(['chat', 'data', roomId, 'regular', 'unreadCount'], state) || 0) +
  (path(['chat', 'data', roomId, 'e2ee', 'unreadCount'], state) || 0)
)

export const getMapKeyForRoom = room => `${room.member_email}__${getContactMember(room).email}`

export const getReverseMapKeyForRoom = room => `${getContactMember(room).email}__${room.member_email}`

export const getRoomByMapKey = (state, mapKey) => {
  const { dataOrder } = state.chat
  if (!dataOrder || !dataOrder.length) {
    return null
  }
  const roomId = dataOrder.find((roomId) => {
    const room = state.chat.data[roomId]
    if (!room) {
      return false
    }
    return mapKey === getMapKeyForRoom(room) || mapKey === getReverseMapKeyForRoom(room)
  })
  if (!roomId) {
    return null
  }
  return state.chat.data[roomId]
}

/**
 * Gets the count of unread messages based on last read message and
 * an array of messages in that room.
 * @param {string} lastReadMessageId The last message user has read
 * @param {array<string>} messageIds An array of message ids in the room
 */
export const getUnreadMessagesCount = (lastReadMessageId, messageIds) => {
  // find out the index of the lastReadMessageId among all messages of the
  // room starting from the end
  const newFilteredArray = messageIds.filter(messageId =>
  // return messageId === lastReadMessageId

    uuidv1ToDate(messageId) > uuidv1ToDate(lastReadMessageId))

  // if the lastReadMessage not found among other message ids
  // then user has not read any of the messages, so all messages are
  // unread
  return newFilteredArray.length

  // the count of the unread messages is the
  // index position of the last read message.
  // if the first message from the bottom is last read
  // then index is zero, which means no unread messages
  // if the last read message is second from the bottom
  // then index is 1 which means there is one unread message
  // after it...
  // return lastReadMessageIndex
}
