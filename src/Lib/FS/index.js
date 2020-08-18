import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import mime from 'react-native-mime-types'
import palette from 'app/Styles/colors'

import mimeModifier from './mimeModifier'

export { getRealPathFromUri } from './GetRealPath'

export const DOCS_DIRECTORY_PATH = RNFS.DocumentDirectoryPath
export const TEMP_DOCS_DIRECTORY_PATH = `${Platform.OS === 'ios' ? DOCS_DIRECTORY_PATH : RNFS.ExternalDirectoryPath}/Temp`

export const imageMimeTypes = [
  'jpg', 'jpeg', 'png', 'gif'
]

/**
 * Tells weather or not the mimeType is of image
 * @param {string} mimeType
 * @return Boolean
 */
export const isImage = mimeType => imageMimeTypes.indexOf(mime.extension(mimeType)) > -1

export const mimeTypeToIcons = {
  default: { iconName: 'file', color: palette.concrete },
  pdf: { iconName: 'file-pdf-o', color: palette.pomegranate },
  doc: { iconName: 'file-word-o', color: palette.ceruleanBlue },
  docx: { iconName: 'file-word-o', color: palette.ceruleanBlue },
  pages: { iconName: 'file-word-o', color: palette.ceruleanBlue },
  xls: { iconName: 'file-excel-o', color: palette.nephritis },
  xlsx: { iconName: 'file-excel-o', color: palette.nephritis },
  numbers: { iconName: 'file-excel-o', color: palette.nephritis },
  csv: { iconName: 'file-excel-o', color: palette.nephritis },
  ppt: { iconName: 'file-powerpoint-o', color: palette.tomato },
  pptx: { iconName: 'file-powerpoint-o', color: palette.tomato },
  key: { iconName: 'file-powerpoint-o', color: palette.tomato },
  zip: { iconName: 'file-zip-o', color: palette.wetAsphalt },
  jpeg: { iconName: 'file-image-o', color: palette.turquoise },
  jpg: { iconName: 'file-image-o', color: palette.turquoise },
  png: { iconName: 'file-image-o', color: palette.turquoise },
  gif: { iconName: 'file-image-o', color: palette.turquoise }
}

/**
 * Returns react-native-vector-icons/FontAwesome icon
 * name for given mimeType
 * @param {string} mimeType
 * @return Boolean
 */
export const getIconDataForMimeType = mimeType => mimeTypeToIcons[mime.extension(mimeType)] || mimeTypeToIcons.default

/**
 * Parses full filename to extension and name
 * @param {string} fileName E.g. image.jpg
 * @return {object} { ext: string, name: string }
 */
export const getNameAndExtForFilename = (fileName) => {
  const extDotIndex = fileName.lastIndexOf('.')

  // if there is no dot in the fileName
  // then there is no extension
  if (extDotIndex === -1) {
    return {
      ext: '',
      name: fileName
    }
  }

  const ext = fileName.substr(extDotIndex + 1)
  const name = fileName.substr(0, extDotIndex)

  // if there is only one dot at the beginning (E.g. ".htaccess", ".gitignore"...)
  // then extension is string after dot and there is no name
  if (extDotIndex === 0) {
    return {
      ext: fileName.substr(1),
      name: ''
    }
  }

  return { ext, name }
}

/**
 * Checks if the file for uri exists and returns
 * another name that is not taken. Behaves like MacOS
 * naming of new files & folders.
 * For instance, if passed file:///one/two/three.jpg and
 * there is already a file at that path, then returns "three (1).jpg"
 * @param {string} filepath The uri of the file
 * @return {string}
 */
export async function getAvailableFileName (filepath) {
  const fileName = (filepath || '').split('/').slice(-1)[0]
  const dir = (filepath || '').split('/').slice(0, -1).join('/')
  let fileExists = true
  let availableFileName = fileName
  let counter = 1
  const { name, ext } = getNameAndExtForFilename(fileName)
  while (fileExists) {
    fileExists = await RNFS.exists(`${dir}/${availableFileName}`)
    if (fileExists) {
      availableFileName = `${name} (${counter}).${ext}`
    }
    counter += 1
  }
  return availableFileName
}

/**
 * Writes the file to filesystem. If there is already a file at requested destination
 * it will write it with "(umber)" postfix. E.g. myfile.jpg will be writtent to "myfile (1).jpg"
 * @param {string} directoryPath The path to the directory where the new file will be created
 * @param {string} fileName The name with the extension. E.g. "image.jpg"
 * @param {string} contents The contents of the file
 * @param {string} encoding The encoding of the content. E.g. "base64"
 */
export async function writeFileToDirectory (directoryPath, fileName, contents, encoding) {
  const availableFileName = await getAvailableFileName(`${directoryPath}/${fileName}`)
  const filepath = `${directoryPath}/${availableFileName}`
  await RNFS.writeFile(filepath, contents, encoding)
  return filepath
}

/**
 * Writes file to filesystem like writeFileToDirectory function except
 * it writes it to DOCS_DIRECTORY_PATH
 * @param {string} fileName
 * @param {string} contents
 * @param {string} encoding
 */
export const writeFile = (fileName, contents, encoding) =>
  writeFileToDirectory(DOCS_DIRECTORY_PATH, fileName, contents, encoding)

/**
 * Writes file to filesystem like writeFileToDirectory function except
 * it writes it to TEMP_DOCS_DIRECTORY_PATH
 * @param {string} fileName
 * @param {string} contents
 * @param {string} encoding
 */
export const writeTempFile = (fileName, contents, encoding) =>
  writeFileToDirectory(TEMP_DOCS_DIRECTORY_PATH, fileName, contents, encoding)
