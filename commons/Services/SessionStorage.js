
const fakeStorage = {
  setItem: () => null,
  getItem: () => null,
  removeItem: () => null
}

let sessionStorage = window.sessionStorage || fakeStorage

// In some versions of the Safari in IOS when in incognito mode,
// the global sessionStorage/localStorage is available, however
// if you try to setItem it throws QuotaExceededError (DOM Exception 22)
// see https://github.com/marcuswestin/store.js/issues/42
// So we need to make sure that not only the gloabl sessionStorage object
// is available, but also that it's setItem method works
const testKey = 'sessionStorageTestKey'
try {
  sessionStorage.setItem(testKey, 'msgsafe.io')
  sessionStorage.removeItem(testKey)
} catch (error) {
  sessionStorage = fakeStorage
}

export default sessionStorage
