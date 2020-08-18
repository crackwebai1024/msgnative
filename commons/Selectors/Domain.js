import { getActiveDataFromStoreSlice } from '../Redux/_Utils'
import { sortBy } from 'ramda'

export const extractDomainData = (slice) => {
  const { data, dataOrder } = getActiveDataFromStoreSlice(slice)
  return {
    data: ((dataOrder && dataOrder.asMutable()) || []).map(id => ({
      value: data[id].name,
      label: data[id].name
    })),
    dataRequestInProgress: slice.dataRequestInProgress
  }
}

/**
 * Returns ordered domain data in following order –
 * - preferred domain
 * - user domains
 * - system domains
 *
 * @param slice
 * @param preferredDomainName
 * @param appendPreferredString
 * @returns {{data: null, dataRequestInProgress: (*|boolean)}}
 */
export const extractOrderedDomainData = (slice, preferredDomainName, appendPreferredString = true) => {
  const { data, dataOrder } = getActiveDataFromStoreSlice(slice)

  const result = {
    data: null,
    dataRequestInProgress: slice.dataRequestInProgress
  }

  if (!dataOrder) return result

  const userDomains = []
  const systemDomains = []
  let preferredDomainAvailable = false

  dataOrder && dataOrder.map((id) => {
    const d = data[id]

    const label = d.name

    if (preferredDomainName && d.name === preferredDomainName) {
      preferredDomainAvailable = true
      return
    }

    if (d.is_system_domain) {
      systemDomains.push({
        label,
        value: d.name
      })
    } else {
      userDomains.push({
        label,
        value: d.name
      })
    }
  })

  result.data = sortBy(d => d.label, userDomains.concat(systemDomains))

  if (preferredDomainName && preferredDomainAvailable) {
    result.data.unshift({
      label: appendPreferredString ? `${preferredDomainName} (preferred)` : preferredDomainName,
      value: preferredDomainName
    })
  }

  return result
}

export const extractTldData = (slice) => {
  const { data } = getActiveDataFromStoreSlice(slice)
  return {
    data: slice.tld && slice.tld.map(id => ({
      value: data[id].name,
      label: `${data[id].name} - ${data[id].price}`
    }))
  }
}

export const extractGroupMembers = (slice) => {
  const { data } = getActiveDataFromStoreSlice(slice)
  if (data && data.data && data.data.length) {
    return {
      id: data.data[0].id,
      name: data.data[0].name,
      members: data.data[0].members
    }
  }
}
