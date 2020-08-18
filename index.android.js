import { DeviceEventEmitter } from 'react-native'
import 'intl'
import 'intl/locale-data/jsonp/en'
let cleanUp
const listener = (event) => {
  global.COLD_LAUNCH_RESPONSE = event.response
  cleanUp()
}

cleanUp = () => {
  DeviceEventEmitter.removeListener('COLD_LAUNCH_RESPONSE', listener)
}

DeviceEventEmitter.addListener('COLD_LAUNCH_RESPONSE', listener)

// const modules = require.getModules();
// const moduleIds = Object.keys(modules);
// const loadedModuleNames = moduleIds
//   .filter(moduleId => modules[moduleId].isInitialized)
//   .map(moduleId => modules[moduleId].verboseName);
// const waitingModuleNames = moduleIds
//   .filter(moduleId => !modules[moduleId].isInitialized)
//   .map(moduleId => modules[moduleId].verboseName);

// // make sure that the modules you expect to be waiting are actually waiting
// console.log(
//   'loaded:',
//   loadedModuleNames.length,
//   'waiting:',
//   waitingModuleNames.length
// );

// // grab this text blob, and put it in a file named packager/moduleNames.js
// console.log(`module.exports = ${JSON.stringify(loadedModuleNames.sort())};`);

// require.Systrace.beginEvent = (message) => {
//   if(message.includes(problematicModule)) {
//     throw new Error();
//   }
// }

require('./main')
