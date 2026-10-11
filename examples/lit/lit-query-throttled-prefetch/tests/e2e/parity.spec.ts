import { testQueryLayout } from '../../../../../tests/e2e/helpers/queryParity'

testQueryLayout(
  new URL('../../../../react/react-query-throttled-prefetch', import.meta.url),
  'pacer-example > div.App',
)
