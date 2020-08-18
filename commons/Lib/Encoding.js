import base64 from 'base-64'
import base64_arraybuffer from 'base64-arraybuffer'
import { TextEncoder } from 'text-encoding'

/**
 * Converts a unicode string to base64 encoded from ArrayBuffer
 * and encodes original string as utf8
 */
export const unicodeToUtf8Base64 = (s) => {
  try {
    return base64_arraybuffer.encode(new TextEncoder().encode(s))
  } catch (e) {
    console.log('unicodeToUtf8Base64 error - ', e)
  }
}

// source - https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
export function b64EncodeUnicode (str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode(`0x${p1}`)
  ))
}

export function b64DecodeUnicode (str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''))
}

/**
 * Converts Uint8Array to string.
 *
 * Source - http://stackoverflow.com/a/41798356
 */
export const convertUint8ArrayToStr = (() => {
  const charCache = new Array(128) // Preallocate the cache for the common single byte chars
  const charFromCodePt = String.fromCodePoint || String.fromCharCode
  const result = []

  return function (array) {
    let codePt
    let byte1

    result.length = 0

    for (let i = 0; i < array.length;) {
      byte1 = array[i++]

      if (byte1 <= 0x7F) {
        codePt = byte1
      } else if (byte1 <= 0xDF) {
        codePt = ((byte1 & 0x1F) << 6) | (array[i++] & 0x3F)
      } else if (byte1 <= 0xEF) {
        codePt = ((byte1 & 0x0F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F)
      } else if (String.fromCodePoint) {
        codePt = ((byte1 & 0x07) << 18) | ((array[i++] & 0x3F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F)
      } else {
        codePt = 63 // Cannot convert four byte code points, so use "?" instead
        i += 3
      }

      result.push(charCache[codePt] || (charCache[codePt] = charFromCodePt(codePt)))
    }

    return result.join('')
  }
})()

/**
 * Convert string to Uint8Array.
 *
 * Source - https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330
 *
 * @param s
 * @returns {Uint8Array}
 */
export const convertStrToUint8Array = (s) => {
  let i = 0
  const bytes = new Uint8Array(s.length * 4)
  for (let ci = 0; ci !== s.length; ci++) {
    let c = s.charCodeAt(ci)
    if (c < 128) {
      bytes[i++] = c
      continue
    }
    if (c < 2048) {
      bytes[i++] = c >> 6 | 192
    } else {
      if (c > 0xd7ff && c < 0xdc00) {
        if (++ci === s.length) throw 'UTF-8 encode: incomplete surrogate pair'
        const c2 = s.charCodeAt(ci)
        if (c2 < 0xdc00 || c2 > 0xdfff) throw `UTF-8 encode: second char code 0x${c2.toString(16)} at index ${ci} in surrogate pair out of range`
        c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff)
        bytes[i++] = c >> 18 | 240
        bytes[i++] = c >> 12 & 63 | 128
      } else { // c <= 0xffff
        bytes[i++] = c >> 12 | 224
      }
      bytes[i++] = c >> 6 & 63 | 128
    }
    bytes[i++] = c & 63 | 128
  }
  return bytes.subarray(0, i)
}

/**
 * Convert Uint8Array to base 64 encoded string.
 *
 * To be used when Uint8Array contains binary, that needs to
 * be represented as base64.
 *
 * @param input
 * @returns {string}
 */
export const convertUint8ArrayToBase64Str = (input) => {
  if (input == null) return ''
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  let chr1,
    chr2,
    chr3,
    enc1,
    enc2,
    enc3,
    enc4
  let i = 0

  while (i < input.length) {
    chr1 = input[i++]
    chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here

    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63

    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4)
  }

  return output
}

/**
 * Convert base 64 encoded string, representing binary data
 * to Uint8Array.
 *
 * @param data
 * @returns {Uint8Array}
 */
export const convertBase64StrToUint8Array = (data) => {
  try {
    const raw = base64.decode(data)
    const array = new Uint8Array(new ArrayBuffer(raw.length))

    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i)
    }

    return array
  } catch (e) {
    console.log('convertBase64StrToUint8Array error - ', e, data)
    return data
  }
}

export const concatenateUint8Array = (...arrays) => {
  let totalLength = 0

  for (const arr of arrays) {
    totalLength += arr.length
  }

  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }

  return result
}
