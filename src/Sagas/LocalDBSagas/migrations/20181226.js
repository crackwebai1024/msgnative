/**
 * created on - 26/12/2018
 * add `max_ts` column in contacts, identities, user emails, mailbox and call history tables. Update index as well
 */

import { call } from 'redux-saga/effects'
import { executeTransaction, executeSql, db } from '../dbUtils'

export const NEXT_VERSION = '20190105'
export const PREVIOUS_VERSION = '20181225'
export const VERSION = '20181226'

function * backfillMaxTS () {
  const tables = ['contacts_cache', 'identities_cache', 'user_emails_cache', 'mailbox_cache', 'call_history_cache']
  for (let i = 0; i < tables.length; i += 1) {
    const table = tables[i]
    const query = `UPDATE ${table} SET max_ts = MAX(COALESCE(last_activity_on, created_on), COALESCE(modified_on, created_on));`
    yield call(executeSql, db, query)
  }
}

export function * upgrade () {
  const query = `
    ALTER TABLE contacts_cache ADD COLUMN max_ts int;
    CREATE INDEX idx_contacts_max_ts ON contacts_cache (max_ts);

    ALTER TABLE identities_cache ADD COLUMN max_ts int;
    CREATE INDEX idx_identities_max_ts ON identities_cache (max_ts);

    ALTER TABLE user_emails_cache ADD COLUMN max_ts int;
    DROP INDEX idx_user_emails_cache_is_deleted;
    DROP INDEX idx_user_emails_cache_modified_on;
    CREATE INDEX idx_user_emails_max_ts ON user_emails_cache (max_ts);
    CREATE INDEX idx_user_emails_cache_modified_on ON user_emails_cache (modified_on);
    CREATE INDEX idx_user_emails_cache_is_deleted ON user_emails_cache (is_deleted);

    ALTER TABLE mailbox_cache ADD COLUMN max_ts int;
    CREATE INDEX idx_mailbox_max_ts ON mailbox_cache (max_ts);

    ALTER TABLE call_history_cache ADD COLUMN max_ts int;
    CREATE INDEX idx_call_history_max_ts ON call_history_cache (max_ts);
  `
  const queries = query.split(';')
  yield call(executeTransaction, db, queries)
  yield call(backfillMaxTS)
}
