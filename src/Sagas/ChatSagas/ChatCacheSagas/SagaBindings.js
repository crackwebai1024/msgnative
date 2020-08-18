import dataSagaBindings from './DataSagas'
import syncSagaBindings from './SyncSagas'

export default [
  ...dataSagaBindings,
  ...syncSagaBindings
]
