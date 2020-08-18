import SharedPreferences from 'react-native-shared-preferences'

export const getItem = (key) => {
  return new Promise((resolve, reject) => {
    try {
      SharedPreferences.getItem(key, resolve)
    } catch (e) {
      reject(e)
    }
  })
}
