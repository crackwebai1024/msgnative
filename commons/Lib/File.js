import base64 from 'base-64'

// Source - http://stackoverflow.com/a/40831598
function b64toBlob (b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = base64.decode(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

export function downloadOnBrowser (b64Data, filename, contentType) {
  const blob = b64toBlob(b64Data, contentType)
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // IE workaround for "HTML7007: One or more blob URLs were
    // revoked by closing the blob for which they were created.
    // These URLs will no longer resolve as the data backing
    // the URL has been freed."
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const csvURL = window.URL.createObjectURL(blob)
    const tempLink = document.createElement('a')
    tempLink.href = csvURL
    tempLink.setAttribute('download', filename)
    tempLink.setAttribute('target', '_blank')
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
  }
}
