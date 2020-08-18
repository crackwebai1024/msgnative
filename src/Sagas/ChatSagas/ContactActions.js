import { call, put, select, take } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { NavigationActions, StackActions } from 'react-navigation'
import { curry, path } from 'ramda'

import WebrtcActions from 'commons/Redux/WebrtcRedux'
import ChatActions from 'commons/Redux/ChatRedux'
import { isMyIdentityEmail } from 'commons/Selectors/Identity'
import DeviceContactActions, { DeviceContactTypes } from 'app/Redux/DeviceContactRedux'
import { checkMicCamPermissions, showNoMicCamPermissionModal } from 'app/Lib/Device'
import { showIdentitySelectionPopup } from 'app/Lib/Identity'
import { pickDeviceContactEmailAddressAsync } from 'app/Containers/Contacts/DeviceContactDetail/utils'

// import { formatMessage } from 'commons/I18n/sagas'
const curriedIsMyIdentityEmail = curry(isMyIdentityEmail)

function * pickIdentity (identities, fm) {
  if (identities) { // Msgsafe contact
    if (identities.length === 1) {
      return identities[0]
    }

    const picked = yield call(showIdentitySelectionPopup, identities, fm)

    return picked
  } else { // Device contact
    yield put(
      NavigationActions.navigate({
        routeName: 'IdentitySelection',
        params: {
          disableSwipe: true,
          dispatchAndPop: DeviceContactActions.selectIdentityForWebrtcAction
        }
      })
    )
    const { identity } = yield take(DeviceContactTypes.SELECT_IDENTITY_FOR_WEBRTC_ACTION)

    yield delay(400)

    return identity
  }
}

function * pickEmail (contact, fm) {
  if (contact.email) { // Msgsafe contact
    return contact.email
  }

  if (contact.emailAddresses) { // Device contact
    const picked = yield call(pickDeviceContactEmailAddressAsync, contact.emailAddresses, true, fm)

    yield delay(300)

    return picked.email
  }

  throw new Error('No email address in this contact')
}

const wsConnectedSelector = path(['chat', 'socketConnected'])

export function * handleBootCallProcess ({ contact, isAudioOnly, fm }) {
  const wsGood = yield select(wsConnectedSelector)
  if (!wsGood) {
    console.log('BootCallProcess: WS Connection not ready')
    return
  }
  const hasPermission = yield call(checkMicCamPermissions)
  if (!hasPermission) {
    return showNoMicCamPermissionModal()
  }
  const contactEmail = yield call(pickEmail, contact, fm)

  const isMyIdentity = yield select(curriedIsMyIdentityEmail(contactEmail))
  if (isMyIdentity) {
    throw new Error(`Can't make call to your own identity`)
  }

  const identity = yield call(pickIdentity, contact.identities, fm)

  yield put(WebrtcActions.makeOutboundVideoCallOffer(identity.email, contact.email, contact.display_name, isAudioOnly))
}

export function * handleBootChatProcess ({ contact, fm, needNavBack, rootRouteName }) {
  const wsGood = yield select(wsConnectedSelector)
  if (!wsGood) {
    console.log('BootCallProcess: WS Connection not ready')
    return
  }

  const contactEmail = yield call(pickEmail, contact, fm)

  const isMyIdentity = yield select(curriedIsMyIdentityEmail(contactEmail))
  if (isMyIdentity) {
    throw new Error(`Can't chat with your own identity`)
  }

  const identity = yield call(pickIdentity, contact.identities, fm)

  const roomsMap = yield select(state => state.chat.roomsMap)
  const roomId = roomsMap[`${identity.email}__${contactEmail}`] || roomsMap[`${contactEmail}__${identity.email}`]
  const navigateParams = {}

  if (roomId) {
    navigateParams.roomId = roomId
    yield put(ChatActions.chatSetupExistingRoomRequest(roomId, identity.email, identity.display_name, contactEmail))
  } else {
    navigateParams.roomsMapKey = `${identity.email}__${contactEmail}`
    yield put(ChatActions.chatCreateRoomRequest(identity.email, identity.display_name, contactEmail, false))
  }

  if (needNavBack) {
    yield put(
      StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: rootRouteName })
        ]
      })
    )
  }

  yield put(
    NavigationActions.navigate({
      routeName: 'MessagingRoom',
      params: navigateParams
    })
  )
}
