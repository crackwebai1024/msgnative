import createSyncSaga from './SyncSagas'
import createDataCacheSagas from './DataSagas'

/**
 * returns saga package for caching a particular resource
 * @param {Object} configuration
 * * @param {String} resource – resource name to be used for `sync_statistics`
 * * @param {String} tableName – sqlite cache table name
 * * @param {String} reduxSliceKey – redux slice key
 * * @param {String} actionTypePrefix – prefix of all redux actions
 * * @param {String} actionPrefix – prefix of all redux actions (usually the lowercase of `actionTypePrefix`)
 * * @param {Array} fetchActionTypes – additional action types to invoke `fetchFromCache` saga
 * * @param {String} fetchSaga – the saga to be used to fetch initial results when cache is empty
 * * @param {String} apiPath – path of api to be called for syncing
 * * @param {String} apiDataKey – api response list key
 * * @param {Boolean} useWebsocket - should you the websocket or not. defaults to `false`
 * * @param {String} excludeKey – key used in exclude filter during sync
 * * @param {Boolean} isOrderTimestampBased – default `true` – whether the api sync is based on timestamp.
 *          If true, last_sync_ts column of `sync_statistics` is set to max(last_activiity_on, modified_on, created_on)
 *          If false, last_sync_ts column of `sync_statistics` is set to the value of `apiOrderColumn` key in data payload
 * * @param {String} apiOrderColumn – column by which the response is to be sorted
 * * @param {String} apiOldSyncSortOrder – order in which the old sync response is to be sorted
 * * @param {String} apiNewSyncSortOrder – order in which the new sync response is to be sorted
 * * @param {String} apiOldSyncOrderKey – key which contains the last_old_sync value. eg. `lte_ts` or `lt_id`
 * * @param {String} apiNewSyncOrderKey – key which contains the last_new_sync value. eg. `gte_ts` or `gt_id`
 * * @param {String} extraColumns columns – apart from the primary key to be included while inserting/updating/searching records
 * * @param {String} primaryKey – primary column
 * * @param {String} detailActionPrefix – single record fetch api action prefix
 * * @param {String} detailPayloadKey – the key in which search query is sent to details api
 * * @param {String} errorKey – the error key in the translations
 * * @param {String} orderByClause – order by clause for view rendering
 * * @param {Object} allActionTypes – all redux action-types of the resource
 * * @param {Object} allActions – all redux actions of the resource
 * * @param {Boolean} pushAllToRedux – whether to push all data from api to redux on sync success.
 *          Use case: In Identities, new updates should to be pushed immediately to redux.
 *          In others just update the once which are already present in redux and extra records if total data in redux < LIMIT
 * * @param {Boolean} permanentDelete - when user deletes a record, should the record be deleted from cache or just the `is_deleted` flag be updated. Defaults to false.
 * * @param {Boolean} shouldUseCacheOnNewSync - whether to query db for new sync success or to directly push to redux. (default is false)
 *          Use case: In mailbox we sould query the db with appropiate filters applied to prevent wrong data to be inserted in redux
 * * @param {Function} checkIsSearching – function taking redux slice as parameter and expected to return a boolean.
 *          This function is used to handle custom redux slice validation and returns whether the `isSearching` should be set to `true`.
 *          But in case of contacts, being sorted alphabetically, only update the once that are already in redux.
 * * @param {* Funtion} processDataBeforeCaching - (generator function) saga to process/normalize the api response before caching.
 *          Use case - cal history records donot have `created_on` value, which can be generated by its UUID `call_id`.
 *          This created_on value is required by this cache lib for old & new sync.
 * * @param {* Function} handleWhereClauseBasedOnSlice - (generator function) taking redux slice, detailPayload, whereClause, sqlParams as paramters.
 *          The function should return an objects containing `whereClause` and `sqlParams` values
 *          The function should be defined if the resource wants to andle custom filters.
 *          For example - in contacts we have custom filter `is_msgsafe_user`.
 * * @param {* Function} handleGetDataTotal – (generator function) return custom dataTotalCount
 * * @param {* Function} shouldRequestWhenSearching – (generator function) returns whether to request api when searching without validating cache count. defaults to true
 *          Use case: In mailbox, data for all tabs except inbox are kept under `searchResultsData` key.
 * * @param {* Function} getSelectColumns - (genetator function) returns a list of columns to query from the table. Must return atleast `['*']`
 *          and columns list must contain `is_deleted`
 */
function createCacheSagaBindings (configuration) {
  const sagas = [
    ...createSyncSaga(configuration),
    ...createDataCacheSagas(configuration)
  ]

  return sagas
}

export default createCacheSagaBindings
