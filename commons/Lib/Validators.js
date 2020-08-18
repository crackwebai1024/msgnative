import { isURL, isEmail, isUUID, isCreditCard, isFQDN } from 'validator'

const isEmpty = value => value === undefined || value === null || value === ''
const join = rules => (value, data, props) => rules.map(rule => rule(value, data, props)).filter(error => !!error)[0]

export function email (message = 'Invalid email address') {
  return (value) => {
    if (!isEmpty(value) && !isEmail(value)) {
      return message
    }
  }
}

export function url (message = 'Invalid URL') {
  return (value) => {
    if (!isEmpty(value) && !isURL(value)) {
      return message
    }
  }
}

export function uuid (message = 'Invalid UUID') {
  return (value) => {
    if (!isEmpty(value) && !isUUID(value)) {
      return message
    }
  }
}

export function required (message = 'Required') {
  return (value) => {
    if (isEmpty(value)) {
      return message
    }
  }
}

export function fieldRequired (fieldKey, message) {
  return (value, data) => {
    if (isEmpty(data[fieldKey])) {
      return message || `Please enter the ${fieldKey} first`
    }
  }
}

export function minLength (min, message) {
  return (value) => {
    if (!isEmpty(value) && value.length < min) {
      return message || `Must be at least ${min} characters`
    }
  }
}

export function maxLength (max, message) {
  return (value) => {
    if (!isEmpty(value) && value.length > max) {
      return message || `Must be no more than ${max} characters`
    }
  }
}

export function min (min, message) {
  return (value) => {
    if (Number(value) < min) {
      return message || `Must be at least ${min}`
    }
  }
}

export function max (max, message) {
  return (value) => {
    if (Number(value) > max) {
      return message || `Must be no more than ${max}`
    }
  }
}

export function integer (message = 'Must be an integer') {
  return (value) => {
    if (!Number.isInteger(Number(value))) {
      return message
    }
  }
}

export function oneOf (enumeration, message) {
  return (value) => {
    if (!~enumeration.indexOf(value)) {
      return message || `Must be one of: ${enumeration.join(', ')}`
    }
  }
}

export function equalTo (fieldKey, message) {
  return (value, data) => {
    if (!isEmpty(value) && !isEmpty(data) && value !== data[fieldKey]) {
      return message || `Not same as the ${fieldKey}`
    }
  }
}

export function notEqualTo (fieldKey, message) {
  return (value, data) => {
    if (!isEmpty(value) && !isEmpty(data) && value === data[fieldKey]) {
      return message || `Is same as the ${fieldKey}`
    }
  }
}

export function emailUsername (message) {
  return (value) => {
    if (!isEmpty(value) && !(/^([A-Za-z0-9.]+)$/.test(value))) {
      return message
    }
  }
}

export function accountUsername (message) {
  return (value) => {
    if (!isEmpty(value) && !(/^[a-z0-9_.\-@]+$/.test(value))) {
      return message
    }
  }
}

export function accountPassword (message) {
  // must have min 8 characters, 1 uppercase, 1 lowercase, 1 number. allow all special char
  // const r = /^(?=.{8,32}$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*/
  // must have min 8 characters, 1 alpha, 1 number, allow all special char
  const r = /^(?=.{8,64}$)(?=.*[a-zA-Z])(?=.*[0-9]).*/
  return (value) => {
    if (!isEmpty(value) && !(r.test(value))) {
      return message
    }
  }
}

export function domainName (message) {
  return (value) => {
    if (!isEmpty(value) && !isFQDN(value, { require_tld: true })) {
      return message
    }
  }
}

export function domainNameWithOptionalTLD (message) {
  return (value) => {
    if (!isEmpty(value) && !isFQDN(value, { require_tld: true }) && !isFQDN(value, { require_tld: false })) {
      return message
    }
  }
}

export function creditCardNumber (message) {
  return (value) => {
    if (!isEmpty(value) && !isCreditCard(value)) {
      return message
    }
  }
}

export function creditCardCVV (message) {
  return (value) => {
    if (!isEmpty(value) && !(/^[0-9]{3,4}$/.test(value))) {
      return message
    }
  }
}

export function creditCardExpiry (message) {
  return (value) => {
    if (!isEmpty(value) && !(/(0[1-9]|1[0-2])\/20(1[7-9]|[23][0-9])/.test(value))) {
      return message
    }
  }
}

export function invalidIf (predicate, message = 'This field is invalid') {
  return (value, data, props) => {
    const validation = predicate(value, data, props)
    if (validation) {
      if (typeof validation === 'string') return validation
      return message
    }
  }
}

// Take the rule creator, defineMessages's object, any extra arguments for rule creator
export function i18nize (ruleCreator, i18nMessage, args = []) {
  // Return a function that takes props from createValidator
  return (value, data, props) =>
    // That calls rule creator with args and i18n'ed string
    ruleCreator(...args, props.intl.formatMessage(i18nMessage))(value, data)
}

/**
 * Creates a validator function that can be plugged right into the redux-form initializer.
 *
 * Usage -
 *
 * const loginFormValidator = createValidator({
 *   username: [required('Username is required')],
 *   password: [required('Password is required')],
 * })
 *
 * @param rules
 * @return {function}
 */
export function createValidator (rules) {
  return (values = {}, props) => Object
    .entries(rules)
    .reduce((acc, curr) => {
      const [key, rule] = curr
      const ruleFn = join([].concat(rule))
      const error = ruleFn(values[key], values, props)
      if (error) {
        acc[key] = error
      }

      return acc
    }, {})
}
