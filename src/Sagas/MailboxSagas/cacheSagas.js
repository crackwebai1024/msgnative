import { call, put } from 'redux-saga/effects'
import { reduce } from 'ramda'

import MailboxActions from 'commons/Redux/MailboxRedux'
import cacheConfig from 'app/Sagas/LocalDBSagas/Lib/SyncConfig'
import { executeSql, db } from '../LocalDBSagas'

export function * clearTrash () {
  if (!cacheConfig.mailbox.cacheEnabled) return
  const query = `
    DELETE mailbox_cache
    WHERE is_trash=?;
  `
  yield call(executeSql, db, query, [1])
}

export function * deleteSelected ({ selectedIds }) {
  if (!cacheConfig.mailbox.cacheEnabled) return
  const questionMarks = reduce((s) => s ? `${s}, ?` : '?', '', selectedIds)
  const query = `
    DELETE FROM mailbox_cache
    WHERE id IN (${questionMarks});
  `
  yield call(executeSql, db, query, selectedIds)
}

export function * deleteByEmail (email) {
  let query = `
    SELECT id FROM mailbox_cache
    WHERE msg_from=? OR msg_to=?;
  `
  const records = yield call(executeSql, db, query, [email, email])
  if (!records.length) return
  const ids = []
  for (let i = 0; i < records.length; i += 1) {
    ids.push(records.item(i).id)
  }

  yield put(MailboxActions.mailboxDeleteSelectedSuccess(ids, false))
}
