## Patterns

For the actions associated with redux-form

- the request and success actions are present
- store doesn't store the request progress, success or error flags since this information is handled using Promise's `resolve` and `reject` callbacks
- the request action takes `resolve` and `reject` params
- the success action is used to relay response information to the redux store
- the resolve callback tells the redux-form form that the submission was successful
- any errors are relayed back to redux-form using the `reject` callback

For most of the other actions, the request progress, success and error flags are kept in redux store.

-------

For the actions not associated with redux-form, in most cases the actions will have a request, a success and a failure variants. For e.g. the `allContactsRequest`, `allContactsSuccess` and `allContactsFailure`.

-------

## Passing information between different scenes

Use sceneData key to pass around minimal amount of data between scenes (usually the relevant id) like – `RouterActions.sceneKey({ sceneData: { modelId: 2 } })`. The `sceneData` is available at `state.router.sceneData`.

For e.g., the list items on mailbox list page will have a callback, that pass `sceneData: { mailboxDetailId: 99 }`. Now, in the mailbox detail page, read `state.router.sceneData.mailboxDetailId` and pick up the relevant mail object from `state.mailbox.data[state.router.sceneData.mailboxDetailId]`. This way, detail page doesn't have to read the entire `state.mailbox.data` object. Also, since the page is taking just the relevant mail object, it'll be re-rendered when that particular mail object is updated.

------

## data & searchDataResults

Instead of keeping all the server response at a single place (i.e. normal and search responses), it's better to keep them separate so that we always have a copy of normal call. For e.g. if we kept it in a single place and user searched identities, the app store would only have identities for that particular search query and then if he were to move to contact creation or email compose, where user needs to choose an identity, the app would've had to re-fetch all the identities. So, it's a better solution to always maintain a 'neutral' copy of the data that the user is most interested in.

It is possible that the server responds with empty array for normal data fetch or search. Thus, the default values for `data` and `searchDataResults` has to be null, so that empty array/object can be used to denote empty response.
