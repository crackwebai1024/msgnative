import { call } from 'redux-saga/effects'

import { executeSql, db } from '../LocalDBSagas'
import { deleteByEmail } from '../MailboxSagas/cacheSagas'

export function * removeSuccess ({ id, payload }) {
  if (!payload || !payload.delete_mail_history) return

  let records = yield call(executeSql, db, `SELECT email from identities_cache WHERE id=?;`, [id])
  const item = records.item(0)
  if (!item) return
  yield call(deleteByEmail, item.email)
}
