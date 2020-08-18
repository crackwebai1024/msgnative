import KeyStorageSagaBindings from './KeyStorageSagas'
import DeleteSyncSagaBindings from './DeleteSync'

export default [
  ...KeyStorageSagaBindings,
  ...DeleteSyncSagaBindings
]
