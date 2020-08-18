
# Caching

  

## Contacts

  

### Sync Bootstrap Flow

Whenever the user is logged in (from login / signup process), `AppActions.readyForSync` action is dispatched. `syncContactsPeriodically`, present under `src/ContactActions/Sync.js`, is invoked. The saga does the following tasks

-  **Sync already initiated check** - Checks if the sync is already in process or not. It exits if sync has already started, otherwise sets `state.contact.syncInitiated` to `true`.

- **DB check** - Checks if db has been initialised or not. if not, it waits for the `AppTypes.CACHE_D_B_IS_READY` action to be dispatched.

- **Existing data check** - Checks if we already have contacts in the redux state or not. If there is no data, follows the following steps:
			-- check if we have data in our cache. If cache has data then simply render data from cache.
			-- else, call initial contact fetch
	After the above actions, add some delay before starting the sync process.

- **Start Sync** - After the above steps, simply spawn `syncOldContactsPeriodically` and `syncNewContactsPeriodically`.

---

### New Data Sync

The saga runs continuously after every interval. Calls the get api to fetch all new updates occured after `gt_req_ts`, passed as argument. The api is called with the following arguments:
	- **limit** - number of results to be sent
	- **order** - column name by which the result is to be sorted
	- **sort** - takes in `asc` and `dsc` values. It is the order in which the result is to be sorted 
	- **gt_req_ts** - parameters asks the api to send all contacts which has `last_activity_on`  or `modified_on` timestamps greater than or equal to the `gt_req_ts` value

After the api response, it:
- dispatches **`ContactActions.contactSuccessForCache`** to update the sqlite cache and push new data to redux if needed. The use cases are documented in the saga..
-  invokes **`setContactSyncStatictics`** saga with the api response to save the `last_new_sync_ts` in the `sync_statistics` table. 

---

### Old Data Sync

The saga runs continuously after every interval. Calls the api to fetch all records by passing `offset` (total number of records currently in the cache) in the request params. The api is called with the following arguments:
	- **limit** - number of results to be sent
	- **order** - column name by which the result is to be sorted
	- **sort** - takes in `asc` and `dsc` values. It is the order in which the result is to be sorted 
	- **offset** - total number of records in the cache. 

After the api response, it:
- dispatches **`ContactActions.contactSuccessForCache`** to update the sqlite cache and push new data to redux if needed. The use cases are documented in the saga.

---

### User Action Flow

- **Force Refresh** : On user force refresh, the request to sync latest caches is forcefully invoked. On success of force refresh, the current rendered list is fetched from cached and rendered. (To load all the missing records that the user might be expecting)

- **User Search & Paginate** : When the user starts searching, the results are first rendered from the cache and then the api is invoked. Upoon api success, the full list is re-rendered. 

- **Normal List Paginate** - first fetch the results from the cache and check if it is necessary to request data from  API.  Sync the old sync Will be running in the background, the data for next page will always be available. If the internet is slow 

- **Contact details** - When the user visits a contact's details page, the page is first rendered using the redux / cache and simultaneously api is requested to fetched latest data. The api for details returns following extra keys which are required by the details view.:
	-  `contacts` 
	- `has_contact_email_pgp`
	- `has_contact_email_smime`
	
		**Note** : We should try to optimize this api call and see if we can include all these details in the list api.


----

