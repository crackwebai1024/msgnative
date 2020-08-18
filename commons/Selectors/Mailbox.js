import { isNil, isEmpty } from 'ramda'

const isTruthy = val => !isNil(val) && !isEmpty(val)

export const isAnyMailboxFilterActive = state =>
  isTruthy(state.mailbox.filterIdentityIds) ||
  isTruthy(state.mailbox.filterDomainIds) ||
  isTruthy(state.mailbox.filterName) ||
  state.mailbox.unreadOnlyFilter

/**
 * @param {object} state     The redux store state
 * @return {number}          The total number of unread emails
 */
export const getTotalUnread = (state) => {
  const { drawerTotals } = state.mailbox
  if (
    !drawerTotals ||
    !drawerTotals.total_is_unread
  ) {
    return 0
  }
  const total_unread_trash = drawerTotals.total_is_unread_trash || 0
  const total_unread_archive = drawerTotals.total_is_unread_archive || 0
  return drawerTotals.total_is_unread - total_unread_trash - total_unread_archive
}
