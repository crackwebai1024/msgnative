import m from 'commons/I18n'
import { DataPicker } from 'rnkit-actionsheet-picker'

export const pickDeviceContactEmailAddress = (data, callback, cancelCallback, fm = null) => {
  if (!data.emailAddresses) {
    callback(data)
    return
  }

  if (data.emailAddresses.length === 1) {
    callback(data.emailAddresses[0].email)
    return
  }

  const dataSource = data.emailAddresses.map(e => e.email)
  DataPicker.show({
    dataSource,
    titleText: fm ? fm(m.native.Contact.selectEmail) : 'Select Email',
    defaultSelected: [dataSource[0]],
    doneText: fm ? fm(m.app.Common.done) : 'Done',
    cancelText: fm ? fm(m.app.Common.cancel) : 'Cancel',
    numberOfComponents: 1,
    onPickerConfirm: val => callback(val[0]),
    onPickerCancel: cancelCallback
  })
}

export const pickDeviceContactEmailAddressAsync = (emailAddresses, showMsgSafeOnly, fm = null) => {
  const filteredEmails = showMsgSafeOnly ? emailAddresses.filter(one => one.is_msgsafe_user) : emailAddresses

  if (!filteredEmails.length) {
    return Promise.reject(new Error('No email addresses'))
  }

  if (filteredEmails.length === 1) {
    return Promise.resolve(filteredEmails[0])
  }

  return new Promise(resolve => DataPicker.show({
    dataSource: filteredEmails.map(a => a.email),
    titleText: fm ? fm(m.native.Contact.selectEmail) : 'Select Email',
    doneText: fm ? fm(m.app.Common.done) : 'Done',
    cancelText: fm ? fm(m.app.Common.cancel) : 'Cancel',
    numberOfComponents: 1,
    onPickerConfirm: (val, idx) => resolve(filteredEmails[idx])
  }))
}
