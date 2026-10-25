import {
  autosaveReady,
  testLocalQueryLayout,
} from '../../../../../tests/e2e/helpers/queryParity'

testLocalQueryLayout(
  new URL('../../../../react/react-query-debounced-autosave', import.meta.url),
  '#root > div.App',
  autosaveReady,
)
