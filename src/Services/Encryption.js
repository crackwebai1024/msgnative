import Sodium from 'react-native-sodium'
import Base64 from 'base64-js'

import {
  convertBase64StrToUint8Array,
  convertUint8ArrayToBase64Str,
  unicodeToUtf8Base64
} from 'commons/Lib/Encoding'

export async function crypto_box_keypair () {
  const keyPair = await Sodium.crypto_box_keypair()
  return {
    privateKey: convertBase64StrToUint8Array(keyPair.sk),
    publicKey: convertBase64StrToUint8Array(keyPair.pk)
  }
}

export const crypto_box_NONCEBYTES = Sodium.crypto_box_NONCEBYTES

export async function randombytes_buf (...args) {
  return Sodium.randombytes_buf(...args)
    .then(base64Str => convertBase64StrToUint8Array(base64Str))
}

export async function crypto_box_easy (plainText, nonceBinary, publicKeyBinary, privateKeyBinary) {
  return Sodium.crypto_box_easy(
    typeof plainText === 'string' ? unicodeToUtf8Base64(plainText) : Base64.fromByteArray(plainText),
    convertUint8ArrayToBase64Str(nonceBinary),
    convertUint8ArrayToBase64Str(publicKeyBinary),
    convertUint8ArrayToBase64Str(privateKeyBinary)
  )
    .then(base64Str => convertBase64StrToUint8Array(base64Str))
}

export async function crypto_box_open_easy (encryptedBinary, nonceBinary, publicKeyBinary, privateKeyBinary) {
  return Sodium.crypto_box_open_easy(
    convertUint8ArrayToBase64Str(encryptedBinary),
    convertUint8ArrayToBase64Str(nonceBinary),
    convertUint8ArrayToBase64Str(publicKeyBinary),
    convertUint8ArrayToBase64Str(privateKeyBinary)
  )
    .then(base64Str => convertBase64StrToUint8Array(base64Str))
}
