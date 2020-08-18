import React from 'react'

export const extractRegionDataFromUser = (userSlice, CountryLabel) => {
  let options = []
  if (userSlice.data && userSlice.data.system_regions) {
    userSlice.data.system_regions.forEach(e => {
      options.push({
        value: e,
        label: <CountryLabel code={e} />
      })
    })
  }
  return {data: options}
}

export const extractRegionListFromUser = userSlice => userSlice.data && userSlice.data.system_regions
