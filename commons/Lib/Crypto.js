import { CRYPTOAPI } from '../Redux/CryptoRedux'

export const isPgp = k => k.enc_type === CRYPTOAPI.ENC_TYPE.PGP
export const isSmime = k => k.enc_type === CRYPTOAPI.ENC_TYPE.SMIME

export const identifyKeys = (keys) => {
  let smimeKey = null
  let pgpKey = null

  if (keys) {
    for (let i = 0; i < keys.length; i++) {
      if (isPgp(keys[i])) {
        pgpKey = keys[i]
      } else if (isSmime(keys[i])) {
        smimeKey = keys[i]
      }
    }
  }

  return { smimeKey, pgpKey }
}
