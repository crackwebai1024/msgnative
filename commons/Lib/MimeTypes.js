import React from 'react'
import ReactDOMServer from 'react-dom/server'
import FAFile from 'react-icons/lib/fa/file'
import FAImage from 'react-icons/lib/fa/file-image-o'
import FAWord from 'react-icons/lib/fa/file-word-o'
import FAPDF from 'react-icons/lib/fa/file-pdf-o'
import FAExcel from 'react-icons/lib/fa/file-excel-o'

export const imageMIMETypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif'
]

export const MIMETypeToIcons = {
  default: FAFile,
  'image/jpeg': FAImage,
  'image/jpg': FAImage,
  'image/png': FAImage,
  'image/gif': FAImage,
  'application/msword': FAWord,
  'application/pdf': FAPDF,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FAExcel,
  'application/vnd.ms-excel': FAExcel
}

export const isImage = mimeType => imageMIMETypes.indexOf(mimeType) > -1

export const isText = mimeType => mimeType === 'text/plain'

export const getIconForMIMEType = (mimeType, getMarkup = false) => {
  const Component = MIMETypeToIcons[mimeType] || MIMETypeToIcons.default

  if (getMarkup) {
    return ReactDOMServer.renderToStaticMarkup(<Component />)
  }

  return Component
}
