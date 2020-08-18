import { takeLatest } from 'redux-saga/effects'

import Actions, { IdentityTypes } from 'commons/Redux/IdentityRedux'
import { fetch } from 'commons/Sagas/IdentitySagas'
import createCacheSagaBindings from 'app/Sagas/LocalDBSagas/Lib'

import * as identitySagas from './index'
import * as cacheSagas from './cacheSagas'

export default [
  // Send identity welcome letters on create
  takeLatest([IdentityTypes.IDENTITY_CREATE_SUCCESS], identitySagas.sendWelcomeLetters),
  takeLatest([IdentityTypes.IDENTITY_REMOVE_SUCCESS], cacheSagas.removeSuccess),

  ...createCacheSagaBindings({
    resource: 'identities',
    tableName: 'identities_cache',
    reduxSliceKey: 'identity',
    actionTypePrefix: 'IDENTITY',
    actionPrefix: 'identity',
    fetchActionTypes: [],
    fetchSaga: fetch,
    apiPath: 'Identities',
    apiDataKey: 'identities',
    excludeKey: 'identity_id',
    apiOrderColumn: 'last_activity_or_modified_on',
    apiOldSyncSortOrder: 'desc',
    apiNewSyncSortOrder: 'desc',
    apiOldSyncOrderKey: 'lte_ts',
    apiNewSyncOrderKey: 'gte_ts',
    extraColumns: ['email', 'display_name'],
    primaryKey: 'id',
    detailActionPrefix: 'getIdentity',
    detailPayloadKey: 'identity_email',
    errorKey: 'failed-to-fetch-identity',
    orderByClause: 'max_ts DESC',
    allActionTypes: IdentityTypes,
    allActions: Actions,
    pushAllToRedux: true,
    checkIsSearching: () => false
  })
]
