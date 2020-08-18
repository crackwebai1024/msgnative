import * as R from 'ramda'
import { put, call, spawn, select } from 'redux-saga/effects'

import mCommon from 'commons/I18n/app/Common'
import mAPIErrors from 'commons/I18n/app/APIErrors'
import { formatMessage } from 'commons/I18n/sagas'
import Actions from 'commons/Redux/ChatRedux'
import NotificationActions from 'commons/Redux/NotificationRedux'
import { getContactMember } from 'commons/Selectors/Messaging'

import { EVENT_TYPE, ROOM_UPDATE_TYPE } from './Constants'
import { chatAPI } from './WebSocket/index'
import { sendRoomEvent } from './Room'

export function * setupExistingRoomRequest ({
  roomId, identityEmail, identityName, contactEmail, createIfNotExisting = true
}) {
  if (!identityEmail) {
    console.error('setupExistingRoomRequest: no identityEmail')
    return
  }
  const existingRoomInRedux = yield select(R.path(['chat', 'data', roomId]))

  if (existingRoomInRedux) return

  if (contactEmail) {
    const chatData = yield select(s => R.path(['chat', 'data'], s))
    const chatDataMuted = chatData ? chatData.asMutable() : {}
    const roomList = R.map(e => e.members && e.members.length > 1 && `${e.members[0] && e.members[0].email}__${e.members[1] && e.members[1].email}`, R.values(chatDataMuted))

    if (R.values(chatDataMuted).length > 0 && roomList.length > 0 && (R.find(R.equals(`${identityEmail}__${contactEmail}`))(roomList) || R.find(R.equals(`${contactEmail}__${identityEmail}`))(roomList))) {
      const msg = yield formatMessage(mAPIErrors['chat-room-already-exist'], { contactEmail: contactEmail })
      yield put(Actions.chatCreateRoomError(new Error(yield formatMessage(msg, { contactEmail: contactEmail }))))
      return
    }
  }

  try {
    // Join the room
    const joinRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/join',
      args: { room_id: roomId, member: identityEmail },
      push_type: EVENT_TYPE.MESSAGE_INLINE
    })

    // If the room doesn't exist, then just create a new room and be done
    if (joinRes.msg === 'ROOM_NOT_FOUND') {
      if (createIfNotExisting) {
        yield put(Actions.chatCreateRoomRequest(identityEmail, identityName, contactEmail))
      } else {
        const msg = yield formatMessage(mAPIErrors['room-not-found'])
        yield put(NotificationActions.displayNotification(msg, 'danger', 4000))
      }
      return
    }

    // Get the room details
    const roomGetRes = yield call([chatAPI, chatAPI.sendRequest], {
      cmd: '/room/get',
      args: { room_id: [roomId] }
    })

    // Dispatch auto joined room action
    if (roomGetRes && roomGetRes.rooms && roomGetRes.rooms.length) {
      const newRoom = roomGetRes.rooms[0]
      const contact = getContactMember(newRoom, identityEmail)

      // If opponent party has left the room, invite him
      if (!contact.email && contactEmail) {
        const inviteRes = yield call([chatAPI, chatAPI.sendRequest], {
          cmd: '/room/invite',
          args: {
            room_id: roomId,
            member_email: contactEmail
          }
        })
        if (!inviteRes.status) {
          yield call([chatAPI, chatAPI.sendRequest], {
            cmd: '/room/leave',
            args: { room_id: roomId, member: identityEmail }
          })
          const errMsg = yield formatMessage(mCommon.userTryingReachNotAvailable)

          yield put(NotificationActions.displayNotification(errMsg, 'danger', 4000))
          yield put(Actions.chatSetupExistingRoomError(new Error(inviteRes.msg)))

          return
        }
      }

      if (identityEmail && contact.email) {
        yield call([chatAPI, chatAPI.sendRequest], {
          cmd: '/room/map/set',
          args: { room_id: roomId, member_map: `${identityEmail}__${contact.email}` }
        })
      } else {
        console.error('setupExistingRoomRequest: invalid identityEmail or contactEmail', identityEmail, contact.email || contactEmail)
      }

      yield put(Actions.chatAutoJoinedRoom({
        ...newRoom,
        member_email: identityEmail,
        joined: true,
        unreadCount: 0
      }))
    }

    // Make presence on the room known to other members
    yield spawn(sendRoomEvent, ROOM_UPDATE_TYPE.MEMBERSHIP_CHANGE, { roomId })
  } catch (e) {
    // error sretting up chat room
    console.error('setupExistingRoomRequest: error setting up chat room', e)
  }
}

// export function * setupExistingRoom ({ roomId, identityEmail }) {
//   if (!identityEmail) {
//     console.error('no identityEmail')
//     return
//   }
//   const existingRoomInRedux = yield select(R.path(['chat', 'data', roomId]))
//   if (existingRoomInRedux) return

//   // Join the room
//   const joinRes = yield call([chatAPI, chatAPI.sendRequest], {
//     cmd: '/room/join',
//     args: { room_id: roomId, member: identityEmail },
//     push_type: EVENT_TYPE.MESSAGE_INLINE
//   })

//   // If the room doesn't exist, then just create a new room and be done
//   if (joinRes.msg === 'ROOM_NOT_FOUND') {
//     const msg = yield formatMessage(mAPIErrors['room-not-found'])
//     yield put(NotificationActions.displayNotification(msg, 'danger', 4000))
//     return
//   }

//   // Get the room details
//   const roomGetRes = yield call([chatAPI, chatAPI.sendRequest], {
//     cmd: '/room/get',
//     args: { room_id: [roomId] }
//   })

//   // Dispatch auto joined room action
//   if (roomGetRes && roomGetRes.rooms && roomGetRes.rooms.length) {
//     const newRoom = roomGetRes.rooms[0]
//     const contact = getContactMember(newRoom, identityEmail)

//     // If opponent party also left the room, invite him
//     if (!contact.email) {
//       const inviteRes = yield call([chatAPI, chatAPI.sendRequest], {
//         cmd: '/room/invite',
//         args: {
//           room_id: roomId,
//           member_email: identityEmail
//         }
//       })
//       if (!inviteRes.status) {
//         yield call([chatAPI, chatAPI.sendRequest], {
//           cmd: '/room/leave',
//           args: { room_id: roomId, member: identityEmail }
//         })
//         const errMsg = yield formatMessage(mCommon.userTryingReachNotAvailable)

//         yield put(NotificationActions.displayNotification(errMsg, 'danger', 4000))
//         yield put(Actions.chatSetupExistingRoomError(new Error(inviteRes.msg)))

//         return
//       }
//     }

//     if (contact.email) {
//       yield call([chatAPI, chatAPI.sendRequest], {
//         cmd: '/room/map/set',
//         args: { room_id: roomId, member_map: `${identityEmail}__${contact.email}` }
//       })
//     } else {
//       console.error('setupExistingRoom_contact_email:', contact)
//     }

//     yield put(Actions.chatAutoJoinedRoom({
//       ...newRoom,
//       member_email: identityEmail,
//       joined: true,
//       unreadCount: 0
//     }))

//     // Notify about new room join
//     const message = yield formatMessage(mCommon.joinedRoomBy, { contact: newRoom.owner_identity_email })

//     yield put(NotificationActions.displayNotification(message, 'info', 3000))
//   }

//   // Make presence on the room known to other members
//   yield spawn(sendRoomEvent, ROOM_UPDATE_TYPE.MEMBERSHIP_CHANGE, { roomId })
// }
