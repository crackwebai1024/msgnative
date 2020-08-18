import { select } from 'redux-saga/effects'

// A function similar to react-intl's formatMessage
// that takes message descriptor and options; returns translated string
export function * formatMessage (message, options) {
  if (!message.id) return null

  const translatedMessage = yield select(s => (s.intl.messages || {})[message.id])

  let finalMessage = translatedMessage || message.defaultMessage

  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      finalMessage = finalMessage.replace(`{${key}}`, options[key])
    }
  }

  return finalMessage
}
