import { put, select, call, takeLatest, take } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
// import { SubmissionError } from 'redux-form'
import { clone, merge, isNil, path } from 'ramda'
import request from 'superagent'
import parseToTree from 'emailjs-mime-parser'
import { TextDecoder } from 'text-encoding'

import { cfg as APIConfig, callAPI } from '../APISagas'
import MailboxActions, { FILTER_PARAMS, MailboxTypes } from 'commons/Redux/MailboxRedux'
import { getError } from 'commons/Lib/Utils'
import {
  // convertStrToUint8Array,
  convertUint8ArrayToStr,
  convertUint8ArrayToBase64Str
} from 'commons/Lib/Encoding'
import { promiseBinaryDataFromFile } from 'commons/Lib/FileReader'
import { createSignature } from 'commons/Services/API/Utils/signature'
import { formatMessage } from 'commons/I18n/sagas'
import m from 'commons/I18n/app/APIErrors'

export const BASE_PAYLOAD = {
  order: 'id',
  sort: 'desc',
  limit: 30,
  filter: FILTER_PARAMS.all,
  include_group: []
}

const REQUEST_TYPE = {
  isRefreshing: false,
  isPaginating: false,
  isSearching: false
}

/**
 * Reads relevant data from state for building the payload.
 *
 * @param state
 */
function getDataForPayloadFromState (state) {
  return {
    filterIdentityIds: state.mailbox.filterIdentityIds,
    filterDomainIds: state.mailbox.filterDomainIds,
    filterName: state.mailbox.filterName,
    unreadOnlyFilter: state.mailbox.unreadOnlyFilter,
    searchQuery: state.mailbox.searchQuery,
    orderBy: state.mailbox.orderBy,
    sortBy: state.mailbox.sortBy,
    dataAvailableCount: state.mailbox.dataOrder ? state.mailbox.dataOrder.length : 0,
    dataTotalCount: state.mailbox.dataTotalCount,
    searchResultsDataAvailableCount: state.mailbox.searchResultsDataOrder && state.mailbox.searchResultsDataOrder.length,
    searchResultsDataTotalCount: state.mailbox.searchResultsDataTotalCount,
    syncDataPendingCount: state.mailbox.syncDataPendingCount
  }
}

/**
 * Build payload data for mailbox based on filters and search query.
 *
 * @param requestType
 * @returns {{payload: {}, requestType: {}}}
 */
function * buildPayload (requestType = {}) {
  // Pull the base payload
  const payload = clone(BASE_PAYLOAD)

  // Form a complete requestType object
  requestType = merge(REQUEST_TYPE, requestType)

  // Get the relevant data from store for building payload
  const data = yield select(getDataForPayloadFromState)

  // check if current device is RN
  const isRN = yield select(s => s.device.isReactNative)

  // Flag to track whether a request is necessary
  let isRequestUnnecessary = false

  // Apply a set of filter
  if (data.filterName) {
    payload.filter = FILTER_PARAMS[data.filterName] || FILTER_PARAMS.all
    // Set isSearching to true since any results with filters should be
    // stored as search result
    requestType.isSearching = true
  }

  if (data.orderBy !== payload.order) {
    payload.order = data.orderBy
    requestType.isSearching = true
  }

  // production RN points to api6 which has the latest backend improvements.
  // Override `order` key to `modified_on`
  if (isRN) {
    payload.order = 'modified_on'
  }

  if (data.sortBy !== payload.sort) {
    payload.sort = data.sortBy
    requestType.isSearching = true
  }

  if (data.unreadOnlyFilter) {
    payload.filter.is_read = false
    requestType.isSearching = true
  }

  if (!payload.include_group) {
    payload.include_group = []
  }

  // Check for identity filters
  if (data.filterIdentityIds && data.filterIdentityIds.length > 0) {
    payload.include_group.push({
      identity_id: data.filterIdentityIds.asMutable()
    })
    requestType.isSearching = true
  }

  if (data.filterDomainIds && data.filterDomainIds.length > 0) {
    payload.include_group.push({
      domain_id: data.filterDomainIds.asMutable()
    })
    requestType.isSearching = true
  }

  // Search
  if (data.searchQuery) {
    const _query = `%${data.searchQuery}%`
    payload.search_or = {
      msg_from: _query,
      msg_from_displayname: _query,
      msg_to: _query,
      msg_to_displayname: _query,
      msg_subject: _query
    }
    requestType.isSearching = true
  }

  // Apply offset
  if (requestType.isPaginating) {
    // If search query is there and available search data is not complete
    if (requestType.isSearching && data.searchResultsDataAvailableCount < data.searchResultsDataTotalCount) {
      payload.offset = data.searchResultsDataAvailableCount

    // Else if available data is not complete
    } else if (data.dataAvailableCount + data.syncDataPendingCount < data.dataTotalCount) {
      payload.offset = data.dataAvailableCount + data.syncDataPendingCount
    }
  }

  // If not currently searching but some search results data is available
  // then clear the search data
  if (!requestType.isSearching && !isNil(data.searchResultsDataAvailableCount)) {
    yield put(MailboxActions.mailboxClearSearchData())

    // Mark the request as unnecessary since the normal data can be rendered
    // with the existing data
    if (data.dataAvailableCount > 0) {
      isRequestUnnecessary = true
    }
  }

  if (data.searchQuery === '') {
    isRequestUnnecessary = true
  }

  return {
    payload,
    requestType,
    isRequestUnnecessary
  }
}

/**
 * Fetch mailbox items.
 */
export function * fetchMailbox ({ requestType: _requestType }) {
  const isRN = yield select(s => s.device.isReactNative)
  const shouldUseCache = isRN
  try {
    const { payload, requestType, isRequestUnnecessary } = yield call(buildPayload, _requestType)
    if (isRequestUnnecessary) {
      return
    }
    yield put(MailboxActions.mailboxRequest(requestType))
    const response = yield callAPI('Mailbox', payload)
    const successActionCreator = shouldUseCache ? MailboxActions.mailboxSuccessForCache : MailboxActions.mailboxSuccess
    yield put(successActionCreator(response.data, requestType))
  } catch (e) {
    const defaultMessage = yield formatMessage(m['failed-to-fetch-mailbox'])
    const err = getError(e, defaultMessage)
    yield put(MailboxActions.mailboxFailure(err))
  }
}

function hasChildren (node) {
  return node.childNodes && node.childNodes.length !== 0
}

function asText (node) {
  const charset = node.contentType.params.charset || 'utf-8'

  return new TextDecoder(charset).decode(node.content).replace(/�/g, ' ')
}

function MIMEParser (payload) {
  return new Promise(async (resolve, reject) => {
    const data = {
      html: '',
      plain: '',
      attachments: {},
      attachmentContentIds: []
    }

    // Use integer as id if there's no existing content id
    let attachmentNoContentIdIndex = 0
    let attachmentIndex = 0

    function doParse (node) {
      if (hasChildren(node)) {
        return node.childNodes.forEach(doParse)
      }
      const contentType = node.contentType.value
      switch (contentType) {
        case 'text/html':
          data.html += asText(node)
          break
        case 'text/plain':
          data.plain += asText(node)
          break
        case 'application/pgp-encrypted':
          break
        case 'application/x-pkcs7-mime': case 'application/pkcs7-mime':
          // If it's the pkcs7 container, re-parse the content
          try {
            const contentTree = parseToTree(node.content)
            if (contentTree.hasOwnProperty('contentType')) {
              doParse(contentTree)
            }
            break
          } catch (e) {
            console.log('MIME parse error - ', e)
            // move to next default if error occur while parsing
          }
        /* eslint:no-fallthrough */
        default:
          let contentId = path(['headers', 'content-id', 0, 'value'], node)
          contentId = contentId && contentId.replace(/<(.*)>/, '$1')

          const b64data = convertUint8ArrayToBase64Str(node.content)

          const contentDisposition = path(['headers', 'content-disposition', 0, 'value'], node)

          // An attachment is inline if the content id for it is present somewhere in the html
          let isInline = !!(contentId && data.html && data.html.indexOf(contentId) > -1)
          let isInlineImage = isInline && !!contentType.match(/image\/(.*)/)

          // If the attachment is explicitly inline
          // and there's no content id on it, i.e. it cannot be
          // referenced from the html and it is an image,
          // then just append it to the `text/html` as an image
          if (contentDisposition === 'inline' && !contentId && contentType.match(/image\/(.*)/)) {
            isInline = true
            isInlineImage = true
            data.html += `<img src='data:${contentType};base64,${b64data}' />`
          }

          // If there's no contentId, then generate one
          if (!contentId) {
            contentId = attachmentNoContentIdIndex++
          }

          data.attachmentContentIds.push(contentId)
          data.attachments[contentId] = {
            type: node.contentType.type,
            contentType,
            contentDisposition,
            name: path(['contentType', 'params', 'name'], node) || 'attachment',
            data: b64data,
            contentId,
            encoding: path(['contentTransferEncoding', 'value'], node),
            isInline,
            isInlineImage,
            // Keep track of index for safari http download
            index: attachmentIndex++
          }
      }
    }

    let parseCompatibleData

    // If the paylaod is Uint8Array, convert it to string and use it
    if (Object.prototype.toString.call(payload) === '[object Uint8Array]') {
      parseCompatibleData = convertUint8ArrayToStr(payload)
    // If the payload is already string, just use it
    } else if (Object.prototype.toString.call(payload) === '[object String]') {
      parseCompatibleData = payload
    // Otherwise convert binary (Blob) data into Uint8Array and feed it to the parser
    } else {
      parseCompatibleData = await promiseBinaryDataFromFile(payload)
    }

    const root = parseToTree(parseCompatibleData)
    doParse(root)
    resolve(data)
  })
}

function createMIMEParserChannel (id, signature, isReactNative) {
  return eventChannel((emit) => {
    let unsubscribed = false

    const handleBlob = blob => (
      MIMEParser(blob)
        // On parsing completion,
        // if not already un-subscribed, emit the data object
        .then(data => !unsubscribed && emit(data))
        .catch(e => console.info('error in MIMEParser promise - ', e))
    )

    const url = `${APIConfig.httpUrl}/d/pickup/mime/${id}/${signature}`

    // superagent's blob support doesn't work on react native (iOS)
    // instead, we just use the fetch API
    if (isReactNative) {
      if (typeof fetch !== 'undefined') {
        fetch(url)
          .then(r => r.text())
          .then(b => handleBlob(b))
          .catch((err) => {
            console.info('fetch error in MIMEParser promise - ', err)
            emit(err)
          })
      }
    // if not native, just use superagent
    } else {
      request
        .get(url)
        .responseType('blob')
        .end((err, res) => {
          if (err) {
            console.info('request error - ', err.message)
            emit(err)
          } else {
            handleBlob(res.body)
          }
        })
    }

    // returning a function for un-subscribing to the channel
    return () => {
      unsubscribed = true
    }
  })
}

/**
 * Fetch mailbox mime payload and parse it.
 *
 * @param id
 */
export function * fetchMailboxMIME ({ id }) {
  const user = yield select(s => s.user.data)
  const isReactNative = yield select(s => s.device.isReactNative)
  const signature = createSignature(user.access_id, user.secret_token)

  try {
    const mimeParserChannel = yield call(createMIMEParserChannel, id, signature, isReactNative)
    const data = yield take(mimeParserChannel)

    // ax.action(ax.EVENTS.MAILBOX, 'Body Decrypt', { Result: 'Success' })
    yield put(MailboxActions.mailboxDetailSuccess({ msg_id: id, ...data }))
  } catch (e) {
    // const err = getError(e, 'Failed to fetch your email, please try again')
    // ax.action(ax.EVENTS.MAILBOX, 'Body Decrypt', { Result: 'Error', Error: e.message, 'Error Code': e.code })
    const isOnline = yield select(s => s.app.isNetworkOnline)
    const err = yield formatMessage(m[!isOnline ? 'connect-to-internet-and-retry' : 'failed-to-fetch-your-email'])
    yield put(MailboxActions.mailboxDetailFailure(err, id))
  }
}

/**
 * Fetch mailbox analytics (map co-ordinates for servers)
 */
export function * fetchMailboxAnalytics ({ id }) {
  const mailboxEvent = yield select(s => (s.mailbox.searchResultsData && s.mailbox.searchResultsData[id]) || (s.mailbox.data && s.mailbox.data[id]))

  if (!mailboxEvent) {
    console.error(`Analytics requested for mailbox event with id ${id} but there's no such event in the redux store`)
    yield put(MailboxActions.mailboxAnalyticsFailure(yield formatMessage(m['failed-to-retrieve-mailbox']), id))
    return
  }

  try {
    const response = yield callAPI('MailboxAnalytics', { id: mailboxEvent.msg_uuid })
    yield put(MailboxActions.mailboxAnalyticsSuccess(response.data, mailboxEvent.id))
  } catch (e) {
    const err = yield formatMessage(m['failed-to-retrieve-mailbox'])
    console.info(`Failed to retrieve the email data for id ${id}`)
    yield put(MailboxActions.mailboxAnalyticsFailure(err, id))
  }
}

/**
 * Updates an email. Used for –
 *
 * - marking read/unread
 * - moving to archive/trash
 */
export function * updateMailbox (params, successAction, { id, resolve, reject }) {
  try {
    const isRN = yield select(s => s.device.isReactNative)
    const response = yield callAPI('UpdateMailbox', { ...params, ids: [id] })
    yield put(successAction(id))
    if (isRN) {
      yield put(MailboxActions.mailboxSuccessForCache(response.data))
    }
    if (typeof resolve === 'function') resolve(id)
  } catch (e) {
    const err = getError(e, yield formatMessage(m['failed-to-update-mailbox']))
    yield put(MailboxActions.mailboxUpdateError(err))
    if (typeof reject === 'function') reject(id)
  }
}

/**
 * Send an email.
 */
export function * sendMail ({ payload, resolve, reject }) {
  try {
    // Immediately resolve since the API call takes time
    if (typeof resolve === 'function') resolve()
    yield callAPI('SendEmail', payload)
    if (!payload.isTwoFactorSend) {
      // ax.form.createSuccess(ax.EVENTS.MAILBOX_COMPOSE)
      yield put(MailboxActions.sendMailSuccess())
    } else {
      yield callAPI('UserProfile')
      yield put(MailboxActions.sendQueuedMailSuccess())
    }
  } catch (e) {
    // ax.form.createError(ax.EVENTS.MAILBOX_COMPOSE, e.message, e.code)
    const err = getError(e, yield formatMessage(m['failed-to-send-email']))
    yield put(MailboxActions.sendMailError(err))
    // if (typeof reject === 'function') reject(new SubmissionError({_error: err}))
  }
}

function * trackAction (name, values) {
  // mixpanel help removal
  // yield call([ax, ax.action], ax.EVENTS.MAILBOX, name, values)
  yield
}

export const mailboxActionSagas = [
  takeLatest(MailboxTypes.MAILBOX_UNREAD_SUCCESS, trackAction, 'Marked Unread', {}),
  takeLatest(MailboxTypes.MAILBOX_ARCHIVE_SUCCESS, trackAction, 'Moved', { Destination: 'Archive' }),
  takeLatest(MailboxTypes.MAILBOX_TRASH_SUCCESS, trackAction, 'Moved', { Destination: 'Trash' }),
  takeLatest(MailboxTypes.MAILBOX_DELETE_SUCCESS, trackAction, 'Deleted', {}),
  takeLatest(MailboxTypes.MAILBOX_CLEAR_TRASH_SUCCESS, trackAction, 'Trash Cleared', {})
]

// Multiselect //
const selectSelectedIds = s => s.mailbox.selectedIds
export function * trashSelected () {
  const selectedIds = yield select(selectSelectedIds)
  console.log('REDUX SAGA!', selectedIds)
}

export function * updateSelectedEmails (params, successAction, { resolve, reject }) {
  const selectedIds = yield select(s => s.mailbox.selectedIds)
  try {
    const isRN = yield select(s => s.device.isReactNative)
    const response = yield callAPI('UpdateMailbox', { ...params, ids: [...selectedIds] })
    yield put(successAction(selectedIds, true))
    if (isRN) {
      yield put(MailboxActions.mailboxSuccessForCache(response.data))
    } else {
      yield put(MailboxActions.mailboxFetch({ isRefreshing: true }))
      yield take(MailboxTypes.MAILBOX_SUCCESS)
    }

    yield put(MailboxActions.mailboxClearSelection())
    if (typeof resolve === 'function') {
      yield call(resolve, selectedIds)
    }
  } catch (e) {
    if (typeof reject === 'function') {
      yield call(reject, e)
    }
  }
}
