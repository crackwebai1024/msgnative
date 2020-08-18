import moment from 'moment'
import colors from 'app/Styles/colors'
import { uuidv1ToDate } from 'commons/Lib/Utils'

const CALL_STATES_TRANSLATION_KEYS = {
  UNKNOWN: 'callStateUnknown',
  ANSWERED: 'callStateAnswered',
  REJECTED: 'callStateRejected',
  TIMEOUT: 'callStateTimeout',
  UNSUPPORTED: 'callStateUnsupported',
  CANCELLED: 'callStateCancelled',
  USER_BUSY: 'callStateUserBusy',
  MANUAL: 'callStateManual'
}

const CALL_TYPES = {
  INCOMING: 'INCOMING',
  OUTGOING: 'OUTGOING',
  MISSED: 'MISSED'
}

const CALL_TYPE_TRANSLATION_KEYS = {
  INCOMING: 'callTypeIncoming',
  OUTGOING: 'callTypeOutgoing',
  MISSED: 'callTypeMissed'
}

function _getMomentTime (dateTime, timezone) {
  if (!dateTime) return ''

  if (timezone) {
    return moment.tz(dateTime, timezone)
  }

  const offset = (-1 * (new Date()).getTimezoneOffset())

  return moment(dateTime).utcOffset(offset)
}

function _formatRelative (momentTime, yesterdayString, todayString, hours = true) {
  if (momentTime.format('YYYY-MMM-DD') === moment().format('YYYY-MMM-DD')) {
    return hours ? momentTime.format('h:mm a') : todayString
  }

  // calculate differnece excluding time
  const diff = moment().startOf('day').diff(moment(momentTime).startOf('day'), 'days')

  if (diff === 1) {
    return yesterdayString
  }

  if (diff <= 6) {
    return momentTime.format('dddd')
  }

  return momentTime.format('YYYY-MM-DD')
}

export function getRelativeCallDate (callId, timezone, hours = true, yesterdayString = 'Yesterday', todayString = 'Today') {
  let lastTime = uuidv1ToDate(callId)

  lastTime = _getMomentTime(lastTime, timezone)
  return _formatRelative(lastTime, yesterdayString, todayString, hours)
}

export function getRelativeCallTime (callId, timezone) {
  let lastTime = uuidv1ToDate(callId)

  lastTime = _getMomentTime(lastTime, timezone)
  return lastTime.format('hh:mm A')
}

export function getCallType (callDetails) {
  const isMissed = callDetails.is_missed
  let iconColor = null
  let textColor = null
  let callType = CALL_TYPES.OUTGOING
  let callTypeTranslationKey = CALL_TYPE_TRANSLATION_KEYS.OUTGOING
  let icon = 'call-made'

  if (isMissed) {
    iconColor = colors.pomegranate
    textColor = colors.pomegranate
    callTypeTranslationKey = CALL_TYPE_TRANSLATION_KEYS.MISSED
    callType = CALL_TYPES.MISSED
    icon = 'call-missed'
  } else if (!callDetails.is_caller) {
    callTypeTranslationKey = CALL_TYPE_TRANSLATION_KEYS.INCOMING
    icon = 'call-received'
    callType = CALL_TYPES.INCOMING
  }

  return {
    icon,
    callType,
    callTypeTranslationKey,
    iconStyle: {
      color: iconColor
    },
    textStyle: {
      color: textColor
    }
  }
}

export function getCallStateTranslationKey (callDetails) {
  return CALL_STATES_TRANSLATION_KEYS[callDetails.state]
}
