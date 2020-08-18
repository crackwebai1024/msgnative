import { select, call } from 'redux-saga/effects'
import request from 'superagent'
import md5 from 'md5'

import { promiseBase64FromFile } from 'commons/Lib/FileReader'

/*
  STATUS: Not in use currently
*/

const fetchEmailAvatars = emails => {
  // Maybe use the following to preload images on RN
  // FastImage.preload(emails.map(e => ({uri: `https://www.msgsafe.io/avatar/${md5(e)}?s=50&d=404`})))
}

export function * processAvatarForContacts ({ data }) {
  if (!data || !data.contacts || !data.contacts.length) return

  const emails = data.contacts.map(c => c.email)
  yield call(fetchEmailAvatars, emails)
}

export function * processAvatarForUserEmails ({ data }) {
  if (!data || !data.useremails || !data.useremails.length) return

  const emails = data.useremails.map(c => c.email)
  yield call(fetchEmailAvatars, emails)
}

export function * processAvatarForIdentities ({ data }) {
  if (!data || !data.identities || !data.identities.length) return

  const emails = data.identities.map(i => i.email)
  yield call(fetchEmailAvatars, emails)
}

export function * processAvatarForMailbox ({ data }) {
  if (!data || !data.emailevents || !data.emailevents.length) return

  const emails = data.emailevents.map(i => i.msg_from)
  yield call(fetchEmailAvatars, emails)
}

export function * processAvatarForChats ({ data }) {
  if (!data.rooms || !data.rooms.length) {
    return
  }
  const emails = data.rooms.reduce((emails, room) => {
    if (!room.members || !room.members.length) {
      return emails
    }
    return room.members.reduce((emails, member) => {
      if (emails.indexOf(member.email) === -1) {
        emails.push(member.email)
      }
      return emails
    }, emails)
  }, [])
  yield call(fetchEmailAvatars, emails)
}

// Used to fetch avatar to show on inbound call on android
export function * getAnEmailAvatar (email) {
  // If js remote debug mode, fetch blob fails
  const isReactNative = yield select(s => s.device.isReactNative)
  if (isReactNative && global.originalXMLHttpRequest) {
    return null
  }

  try {
    if (email === 'no-reply@notify.msgsafe.com') {
      return null
    }

    const req = request
      .get(`https://www.msgsafe.io/avatar/${md5(email)}?s=50&d=404`)
      .responseType('blob')
    const res = yield req

    return yield call(promiseBase64FromFile, res.body, false) || null
  } catch (e) {
    return null
  }
}
