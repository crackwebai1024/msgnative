/**
 * created on - 05/01/2019
 * replace `first_message_id` with `last_restricted_message_id`
 * replace `identity_id` with `member_email` on `chat_room_cache`
 * add unique constraint for (`room_id` and `contact_id`) on `chat_room_member_cache` table to avoid duplicate entries
 */

import { call } from 'redux-saga/effects'
import { dropTable } from '../dbUtils'

export const NEXT_VERSION = null
export const PREVIOUS_VERSION = '20181226'
export const VERSION = '20190105'

const tables = [
  { name: 'chat_room_cache', resource: 'chat' },
  { name: 'chat_room_member_cache', resource: 'chat' },
  { name: 'chat_message_cache', resource: 'chat' },
  { name: 'chat_sync_statistics', resource: 'chat' }
]

export function * upgrade (createTableIfNecessary) {
  for (let i = tables.length - 1; i >= 0; i -= 1) {
    const config = tables[i]
    yield call(dropTable, config.name, config.resource)
  }

  for (let i = 0; i < tables.length; i += 1) {
    const config = tables[i]
    yield call(createTableIfNecessary, config)
  }
}
