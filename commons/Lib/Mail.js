import moment from 'moment'
import sanitizeHtml from 'sanitize-html'
import {path} from 'ramda'

function makeDateTimeString (timestamp) {
  return moment(timestamp).format('[On] ddd, MMM D, YYYY [at] hh:mm A')
}

function getContent (data) {
  let content = ''

  if (!data.detail) {
    console.error(`details not found for mail id ${data.id} and subject '${data.msg_subject}'`)
    return content
  }

  if (data.detail.html) {
    content = sanitizeHtml(data.detail.html, { allowedTags: [], allowedAttributes: [] })
    content = content.replace(/^\s*\n/gm, '\n') // Remove excessive spaces and empty lines
  } else if (data.detail.plain) {
    content = data.detail.plain
  } else {
    console.error(`html or plain not found for mail id ${data.id} and subject '${data.msg_subject}'`)
  }

  return content
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
export function makeReplyBody (data, signature = null) {
  const content = getContent(data)

  const sender = `${data.msg_from_displayname} <${data.msg_from}>`
  const replyMessage = `${makeDateTimeString(data.created_on)}, ${sender} wrote:`
  const quotedBody = content.replace(/(\n|^)/g, '\n> ')

  return signature ? `\n${signature}\n\n${replyMessage}\n${quotedBody}` : `\n\n${replyMessage}\n${quotedBody}`
}

/**
 *
 *
 * @param data
 * @param signature
 */
export function makeForwardBody (data, signature = null) {
  const content = getContent(data)

  const sender = `${data.msg_from_displayname} <${data.msg_from}>`
  const recipient = `${data.msg_to_displayname} <${data.msg_to}>`

  const replyMessage = `\nFrom: ${sender}\nDate: ${makeDateTimeString(data.created_on)}\nSubject: ${data.msg_subject ? data.msg_subject : ''}\nTo: ${recipient}`

  return signature ? `\n${signature}\n\n---------- Forwarded message ----------\n${replyMessage}\n${content}`
    : `\n\n---------- Forwarded message ----------\n${replyMessage}\n${content}`
}

/**
 *
 *
 * @param data
 */
export function makeForwardAttachments (data) {
  const attachmentContentIds = path(['detail', 'attachmentContentIds'], data)
  if (!attachmentContentIds || !attachmentContentIds.length) {
    return []
  }

  return attachmentContentIds.map(id => data.detail.attachments[id])
}
