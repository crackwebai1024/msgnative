import { getActiveDataFromStoreSlice } from '../Redux/_Utils'

export const extractUserEmailData = (slice) => {
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
