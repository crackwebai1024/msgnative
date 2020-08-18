/**
 * Convert a FileReader instance to a Promise that resolves with the result.
 * @param  {FileReader} filereader) Browser FileReader instance.
 * @return {Promise} Promise that resolves with the FileReader result,
 * and rejects with any error.
 */
export const promiseRead = filereader => new Promise((resolve, reject) => {
  filereader.onload = () => {
    resolve(filereader.result)
  }

  filereader.onerror = () => {
    reject(filereader.error)
  }
})

const isDebuggingEnabled = (typeof atob !== 'undefined')
/**
 * Read a file and return its content in base64.
 * @param  {File} file Browser File instance.
 * @return {Promise} Promise that resolves with the content in base64.
 */
export const promiseBase64FromFile = (file, dropMime = true) => {
  const filereader = new FileReader()
  // eg data:application/octet-stream;base64,QkV...
  filereader.readAsDataURL(file)

  return promiseRead(filereader)
    .then(result => (dropMime ? result.slice(1 + result.indexOf(',')) : result))
}

export const promiseBinaryDataFromFile = (file) => {
  const filereader = new FileReader()
  filereader.readAsBinaryString(file)

  return promiseRead(filereader)
    .then(result => result)
}

export const promiseUint8ArrayDataFromFile = (file) => {
  const filereader = new FileReader()
  filereader.readAsArrayBuffer(file)

  return promiseRead(filereader)
    .then(result => new Uint8Array(result))
}
