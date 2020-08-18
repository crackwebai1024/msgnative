import isNil from 'ramda/es/isNil'

function traverseNodes (node) {
  if (!node) return // If no node, return null

  // If node is MessagingRoom and there's params.roomId, return it
  if (node.routeName === 'MessagingRoom' && node.params && node.params.roomId) return node.params.roomId

  // If there's no index or routes, return null
  if (isNil(node.index) || !node.routes || !node.routes.length) return null

  // Call recursive with next node
  return traverseNodes(node.routes[node.index])
}

/**
 * Extracts currently open chat room id from state.
 *
 * @param state
 * @returns {*}
 */
export function getActiveChatRoomId (state) {
  if (!state || !state.nav) return null

  return traverseNodes(state.nav)
}
