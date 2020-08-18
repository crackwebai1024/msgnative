import { connect } from 'react-redux'

export const withNetworkState = connect(s => ({ networkOnline: s.app.isNetworkOnline }))

export const withWSState = connect(s => ({ wsOnline: s.chat.socketConnected }))

export const withNetworkAndWSState = connect(s => ({
  networkOnline: s.app.isNetworkOnline,
  wsOnline: s.chat.socketConnected
}))
