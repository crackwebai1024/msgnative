import { put, call, select } from 'redux-saga/effects'
import { Alert, PermissionsAndroid, Platform } from 'react-native'
import RNContacts from 'react-native-contacts'
import OpenSettings from 'react-native-open-settings'
// import { isEmail } from 'validator'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/'
import DeviceContactActions from 'app/Redux/DeviceContactRedux'
// import { OverlayIdentifiers } from 'app/Redux/OverlayRedux'

const PERMISSION_DENIED = 'denied'
const PERMISSION_UNDEFINED = 'undefined'
const PERMISSION_AUTHORIZED = 'authorized'

const ifiOS = Platform.OS === 'ios'

const requestPermission = () =>
  new Promise((resolve, reject) => {
    if (ifiOS) {
      RNContacts.requestPermission((err, res) => (err ? reject(err) : resolve(res)))
    } else {
      console.log('requestPermission: contacts - requesting permission')
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
        .then((permission) => {
          console.log('requestPermission: contacts – user response: ', permission)
          if (permission === PermissionsAndroid.RESULTS.GRANTED) {
            resolve(PERMISSION_AUTHORIZED)
          } else {
            resolve(PERMISSION_DENIED)
          }
        })
        .catch(reject)
    }
  })

const checkPermission = () =>
  new Promise((resolve, reject) => {
    if (ifiOS) {
      RNContacts.checkPermission((err, res) => (err ? reject(err) : resolve(res)))
    } else {
      console.log('checkPermission: contacts - checking permission')
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
        .then((permission) => {
          console.log('checkPermission: contacts – response: ', permission)
          if (permission) {
            resolve(PERMISSION_AUTHORIZED)
          } else {
            resolve(PERMISSION_UNDEFINED)
          }
        })
        .catch(reject)
    }
  })

function askPermissionUpdate ({ permission, title, message, cancel, settings }) {
  return new Promise((resolve, reject) => {
    console.log(`askPermissionUpdate: called`)
    if (ifiOS) {
      Alert.alert(
        title,
        message,
        [
          {
            text: cancel,
            style: 'cancel',
            onPress: () => resolve(permission)
          },
          {
            text: settings,
            onPress: () => {
              OpenSettings.openSettings()
              resolve(permission)
            }
          }
        ]
      )
    } else {
      requestPermission()
        .then(resolve)
        .catch(reject)
    }
  })
}

export function * contactsPermissionRequest () {
  let permission
  let requestedFirstTime = false
  try {
    // get permission status from redux state
    permission = yield select(s => s.deviceContact.permission)
    console.log(`contactsPermissionRequest: saved permission – `, permission)

    // if it is undefined in redux state, get it via RNContacts api
    if (permission === PERMISSION_UNDEFINED) {
      permission = yield call(checkPermission)

      // if permission in redux store was 'undefined' and RNContacts returns
      // 'denied' then we asked before but not for this session. So we ask
      // to update it via IOS preferences
      if (permission === PERMISSION_DENIED) {
        yield put(DeviceContactActions.showContactsPermissionAlert())
        const title = yield formatMessage(m.native.Chat.noAccessToContacts)
        const message = yield formatMessage(m.native.Chat.enableAccessInSetting)
        const cancel = yield formatMessage(m.app.Common.cancel)
        const settings = yield formatMessage(m.app.Common.settings)
        permission = yield call(askPermissionUpdate, {
          permission, title, message, cancel, settings
        })

        // yield call(requestContactPermission)
        // yield put(DeviceContactActions.hideContactsPermissionAlert())
      }
    }

    // at this point if the permission is undefined then we did not ask the user
    // before, so ask for it for the first time
    if (permission === PERMISSION_UNDEFINED) {
      permission = yield call(requestPermission)
      requestedFirstTime = true // this is the first time when the user is asked for contacts permission
    }

  // if something went wrong then the permission is still undefined
  } catch (e) {
    permission = PERMISSION_UNDEFINED
  }

  // update the permission state in redux store
  yield put(DeviceContactActions.contactsPermissionSuccess(permission))

  // if the user authorized the app to read contacts and requestedFirstTime is `true`
  if (permission === PERMISSION_AUTHORIZED && requestedFirstTime) {
    console.log(`contactsPermissionRequest: fetching device contacts for the first time`)
    yield put(DeviceContactActions.deviceContactFetch('startup'))
  }
}
