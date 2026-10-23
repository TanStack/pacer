import {
  searchReady,
  testLocalQueryLayout,
} from '../../../../../tests/e2e/helpers/queryParity'

testLocalQueryLayout(
  new URL('../../../../react/react-query-debounced-search', import.meta.url),
  'pacer-example > div.App',
  searchReady,
)
