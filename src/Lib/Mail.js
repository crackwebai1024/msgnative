import moment from 'moment'
import Immutable from 'seamless-immutable'

function makeDateTimeString (timestamp) {
  return moment(timestamp).format('[On] ddd, MMM D, YYYY [at] hh:mm A')
}

function checkMailData (data) {
  if (!data.detail) {
    console.error(`details not found for mail id ${data.id} and subject '${data.msg_subject}'`)
  }
}

/**
 * Takes the email event data object (along with detail key
 * containing pickup response) and returns formatted email body
 * for reply.
 *
 * Reply format based on Gmail's implementation.
 *
 * @param data
 * @param signature
 * @return {string}
 */
export function makeReplyBody (data, signature) {
  checkMailData(data)

  const sender = `${data.msg_from_displayname} <${data.msg_from}>`
  const replyMessage = `${makeDateTimeString(data.created_on)}, ${sender} wrote:`
  const quotedBody = data && data.detail && data.detail.plain ? data.detail.plain.replace(/(\n|^)/g, '\n> ') : ''

  const body = `\n\n${replyMessage}\n${quotedBody}`

  return signature ? `\n\n${signature}${body}` : body
}

/**
 * Prepare the forward body.
 *
 * @param data
 * @param signature
 *
 * @return {string}
 */
export function makeForwardBody (data, signature) {
  checkMailData(data)

  const sender = `${data.msg_from_displayname} <${data.msg_from}>`
  const recipient = `${data.msg_to_displayname} <${data.msg_to}>`

  const replyMessage = `\nFrom: ${sender}\nDate: ${makeDateTimeString(data.created_on)}\nSubject: ${data.msg_subject ? data.msg_subject : ''}\nTo: ${recipient}`
  const plain = data && data.detail && data.detail.plain ? data.detail.plain : ''
  const body = `\n\n---------- Forwarded message ----------\n${replyMessage}\n${plain}`

  return signature ? `\n\n${signature}${body}` : body
}

/**
 * Prepare the forward attachment.
 *
 * @param data
 *
 * @return {array}
 */
export function makeForwardAttachments (data) {
  checkMailData(data)
  const { detail } = data

  if (!detail.attachmentContentIds || !detail.attachmentContentIds.length) {
    return Immutable([])
  }

  return detail
    .attachmentContentIds
    .map(id =>
      detail.attachments[id].merge({
        id: `${id}`,
        progress: 100
      })
    )
}
