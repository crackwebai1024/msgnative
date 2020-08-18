// import { put, select, fork } from 'redux-saga/effects'
// // import faker from 'faker' // install faker to run the code --> yarn add faker

// import Actions from 'commons/Redux/ContactRedux'

// /**
//  * create new contacts automatically
//  * TO BE USED ONLY FOR TEST PURPOSE
//  */

// export function * createRandomContacts () {
//   let i = 0
//   const identites = yield select(s => s.identity.dataOrder)
//   if (!identites || !identites.length) {
//     yield delay(10000)
//     yield fork(createRandomContacts)
//     return
//   }
//   while (i <= 1000) {
//     const displayName = faker.name.findName()
//     const email = faker.internet.email()
//     const payload = { display_name: displayName, email: email, organization: '', identity_id: identites[0] }
//     yield put(Actions.contactCreate(payload))
//     i += 1
//   }
// }
