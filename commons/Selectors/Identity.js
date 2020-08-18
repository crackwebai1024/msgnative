import { getActiveDataFromStoreSlice } from '../Redux/_Utils'

export const extractIdentityData = (slice) => {
  const { data, dataOrder } = getActiveDataFromStoreSlice(slice)

  return {
    data: ((dataOrder && dataOrder.asMutable()) || []).map(id => ({
      value: id,
      name: data[id].display_name,
      label: data[id].email
    })),
    dataRequestInProgress: slice.dataRequestInProgress
  }
}

export const isMyIdentityEmail = (email, state) => Object
  .values(state.identity.data || {}) // state.identity.data may be null
  .find(idt => idt.email === email)
