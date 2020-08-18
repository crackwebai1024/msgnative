import hmac from 'crypto-js/hmac-sha256'
import base64 from 'crypto-js/enc-base64'
import utf8 from 'crypto-js/enc-utf8'

function genNonce (len) {
  /* Note: This is weak with Math.random(); replace with native bits */
  let txt = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < len; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return txt
}

function b64Url (s) {
  let n = null
  try {
    n = base64.stringify(s)
    n = n.replace(/=+$/, '')
    n = n.replace(/\+/g, '-')
    n = n.replace(/\//g, '_')
    return n
  } catch (e) {
    console.error(`error=${e.message}`)
  }
}

export function createSignature (userAccessId, userSecretToken) {
  if (!userAccessId || !userSecretToken) {
    console.info('createSignature: missing param')
    return
  }

  /* Header */
  const hdr = {
    typ: 'JWT',
    alg: 'HS256',
    kid: userAccessId
  }
  const hdr_str = b64Url(utf8.parse(JSON.stringify(hdr)))
  // console.info('hdr_str=' + hdr_str);

  /* Data to sign */
  const ts = new Date().toISOString()
  const data = {
    sig_ts: ts,
    sig_nonce: genNonce(8)
  }
  // console.info(data);
  const data_str = b64Url(utf8.parse(JSON.stringify(data)))
  const token = `${hdr_str}.${data_str}`

  /* Sign it */
  let signed = hmac(token, userSecretToken)
  signed = b64Url(signed)

  const signed_token = `${token}.${signed}`
  return signed_token
}
