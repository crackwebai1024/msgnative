import moment from 'moment'
import momentTimezones from 'moment-timezone'

/**
 * Truncates the passed string down the provided character length.
 * Appends the result with ellipsis.
 *
 * @param string
 * @param len
 * @return {String}
 */
export const truncate = (string, len) => {
  if (string.length > len) {
    return `${string.substring(0, len)}...`
  }
  return string
}

/**
 * Converts an object with key-value pairs into a query string.
 *
 * @param params
 * @return {string}
 */
export const makeQueryString = (params) => {
  return Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
}

/**
 * Returns a capitalised version of the string
 *
 * @param string
 * @returns {string}
 */
export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

/**
 * Returns `HH:mm` formatted string if the timestamp is for
 * the same timezone in the local timezone, otherwise returns
 * the time ago string.
 *
 * @param dateTime
 * @param intl
 * @param timezone
 * @return {string}
 */
export const timeAgo = (dateTime, intl, timezone) => {
  if (!dateTime) return ''

  const localDateTime = timezone ? getZoneTimeForUTC(dateTime, timezone) : getLocalTimeForUTC(dateTime)
  const today = moment(new Date()).hour(0).minutes(0).seconds(0)
  const yesterday = moment(new Date()).hour(0).minutes(0).seconds(0)
    .subtract(1, 'days')

  if (localDateTime.diff(today) >= 0) {
    return intl ? intl.formatTime(localDateTime) : localDateTime.format('h:mm a')
  } else if (localDateTime.diff(today) < 0 && localDateTime.diff(yesterday) >= 0) {
    return intl ? intl.formatRelative(Date.now() - 1000 * 60 * 60 * 24) : 'yesterday'
  }
  return intl ? intl.formatDate(localDateTime) : localDateTime.format('l')
}

/**
 * Returns the local time for a given UTC time.
 *
 * @param dateTime
 * @returns {number|Moment}
 */
export const getLocalTimeForUTC = (dateTime) => {
  const offset = getTimezoneOffset()
  return moment.utc(dateTime).utcOffset(offset)
}

/**
 * Returns the timezone time for a given UTC time.
 *
 * @param dateTime
 * @param timezone
 * @returns {number|Moment}
 */
export const getZoneTimeForUTC = (dateTime, timezone) => {
  if (!timezone) return getLocalTimeForUTC(dateTime)
  const offset = momentTimezones.tz.zone(timezone).parse(Date.UTC(dateTime))
  return moment(dateTime)[offset > 0 ? 'subtract' : 'add']({ minutes: Math.abs(offset) })
}

/**
 * Returns the timezone offset in minutes.
 *
 * @returns {number}
 */
export const getTimezoneOffset = () => {
  return (-1 * (new Date()).getTimezoneOffset())
}

/**
 * Returns a random integer between start and end.
 *
 * @param start
 * @param end
 * @returns {number}
 */
export const randRange = (start, end) => {
  return Math.floor(Math.random() * end) + start
}

/**
 * Returns the error message from the error object, if available;
 * otherwise the default message.
 *
 * @param e
 * @param defaultMessage
 * @return {string}
 */
export const getError = (e, defaultMessage = 'An error occurred') => {
  return e && e.message && e.message !== 'null' ? e.message : defaultMessage
}

export const getWindowHeight = () => {
  const body = document.body
  const html = document.documentElement
  return Math.max(
    body.offsetHeight,
    html.clientHeight,
    html.offsetHeight
  )
}

export const getWindowWidth = () => {
  const body = document.body
  const html = document.documentElement
  return Math.max(
    body.offsetWidth,
    html.clientWidth,
    html.offsetWidth
  )
}

export const chunkStr = (str, n) => {
  const res = []
  let i
  let len
  for (i = 0, len = str.length; i < len; i += n) {
    res.push(str.substr(i, n))
  }
  return res
}

export const bytesToReadableStr = (bytes) => {
  const threshold = 1024
  if (Math.abs(bytes) < threshold) return `${bytes} B`
  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let i
  for (i = -1; Math.abs(bytes) >= threshold && i < units.length - 1; i += 1) {
    bytes /= threshold
  }
  return `${bytes.toFixed(1)} ${units[i]}`
}

/**
 * Converts UUID v1 string to integer.
 *
 * @param uuidStr
 * @returns {Number}
 */
export const uuidv1ToTimeInt = (uuidStr) => {
  const uuidArr = uuidStr.split('-')
  const timeStr = [
    uuidArr[2].substring(1),
    uuidArr[1],
    uuidArr[0]
  ].join('')
  return parseInt(timeStr, 16)
}

/**
 * Convert UUID v1 string to milliseconds.
 *
 * @param uuidStr
 * @returns {Number}
 */
export const uuidv1ToMilliseconds = (uuidStr) => {
  const intTime = uuidv1ToTimeInt(uuidStr) - 122192928000000000
  return Math.floor(intTime / 10000)
}

/**
 * Convert UUID v1 string to Date object.
 *
 * @param uuidStr
 * @returns {Date}
 */
export const uuidv1ToDate = (uuidStr) => {
  const intMillisec = uuidv1ToMilliseconds(uuidStr)
  return new Date(intMillisec)
}

/**
 * User can choose a browser time as a timezone, the value
 * of which is an empty string. This function returns a moment
 * instance for it
 * @param {string} timezone The timezone value at state.user.timezone
 */
export const userTimezoneToMoment = (timezone) => {
  return timezone ? momentTimezones.tz(timezone) : moment()
}

/**
 * Calculates the size of the file based on base64 string
 * @param {string} data The base64 string
 * @return {number} the filesize in bytes
 */
export const base64ToFilesize = (data = '') => {
  if (!data) {
    return 0
  }
  return Math.round(data.length * 3 / 4)
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export const shallowEqual = (objA, objB) => {
  if (objA === objB) {
    return true
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false
  }

  var keysA = Object.keys(objA)
  var keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = hasOwnProperty.bind(objB)
  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

export const shallowComparePropsState = (instance, nextProps, nextState) => {
  return (
    !shallowEqual(instance.props, nextProps) ||
    !shallowEqual(instance.state, nextState)
  )
}

export const shallowCompareProps = (instance, nextProps) => {
  return (
    !shallowEqual(instance.props, nextProps)
  )
}

export function convertArrayToMap (data, key) {
  const obj = {}
  data.forEach(d => {
    obj[d[key]] = d
  })
  return obj
}
