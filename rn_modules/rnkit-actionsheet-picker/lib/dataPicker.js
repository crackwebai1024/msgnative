/* @flow */

/**
  * dataPicker.js
  *
  * @author SimMan (liwei0990#gmail.com)
  * @Time at 2016-12-01 15:04:33
  * Copyright 2011-2016 RNKit.io, Inc.
  */
'use strict'

import {
  NativeModules,
  processColor,
  Platform,
  NativeEventEmitter
} from 'react-native'

const { RNKitASDataPicker } = NativeModules
const nativeEventEmitter = new NativeEventEmitter(RNKitASDataPicker)

let listener = null

const dataPickerDefaultArgs = {
  titleText: '',
  titleTextColor: '#393939',
  doneText: '确定',
  doneTextColor: '#269ff7',
  cancelText: '取消',
  cancelTextColor: '#269ff7',
  numberOfComponents: 1
}

let DataPicker = {
  show: (args) => {
    const options = { ...dataPickerDefaultArgs, ...args }
    try {
      RNKitASDataPicker.showWithArgs({
        ...options,
        titleTextColor: processColor(options.titleTextColor),
        doneTextColor: processColor(options.doneTextColor),
        cancelTextColor: processColor(options.cancelTextColor),
        wheelBgColor: processColor(options.wheelBgColor),
        titleBgColor: processColor(options.titleBgColor),
        outTextColor: processColor(options.outTextColor),
        centerTextColor: processColor(options.centerTextColor),
        dividerColor: processColor(options.dividerColor),
        shadeBgColor: processColor(options.shadeBgColor)
      }, (resp) => {
        if (resp.type === 'done') {
          options.onPickerConfirm && options.onPickerConfirm(
            Platform.OS === 'android' ? resp.selectedData.reverse() : resp.selectedData,
            Platform.OS === 'android' ? resp.selectedIndex.reverse() : resp.selectedIndex
          )
        } else {
          options.onPickerCancel && options.onPickerCancel()
        }
      })
      listener && listener.remove()
      listener = nativeEventEmitter.addListener('DataPickerEvent', event => {
        options.onPickerDidSelect && options.onPickerDidSelect(event.selectedData, event.selectedIndex)
      })
    } catch (e) {
      listener && listener.remove()
      options.onPickerCancel && options.onPickerCancel()
    }
  }
}

export default DataPicker
