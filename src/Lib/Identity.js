import * as R from 'ramda'
import { DataPicker } from 'rnkit-actionsheet-picker'

import m from 'commons/I18n'

export const showIdentitySelectionPopup = (identities, fm) => {
  if (!identities || !identities.length) return

  const options = identities
    .map(idx => ({
      value: R.pick(['id', 'display_name', 'email'], idx),
      title: idx.email
    }))

  return new Promise(resolve => DataPicker.show({
    dataSource: options.map(o => o.title),
    titleText: fm(m.native.Contact.selectIdentity),
    doneText: fm(m.app.Common.done),
    cancelText: fm(m.app.Common.cancel),
    numberOfComponents: 1,
    onPickerConfirm: (selectedData, selectedIndex) => {
      options[selectedIndex] && resolve(options[selectedIndex].value)
    }
  }))
}

export const showIdentitySelectAndCallback = (identities, callback, fm) => {
  if (!identities || !identities.length) return

  const options = identities
    .map(i => ({
      value: R.pick(['id', 'display_name', 'email'], i),
      title: i.email
    }))

  DataPicker.show({
    dataSource: options.map(o => o.title),
    titleText: fm(m.native.Contact.selectIdentity),
    doneText: fm(m.app.Common.done),
    cancelText: fm(m.app.Common.cancel),
    numberOfComponents: 1,
    onPickerConfirm: (selectedData, selectedIndex) => {
      options[selectedIndex] && callback(options[selectedIndex].value)
    }
  })
}
