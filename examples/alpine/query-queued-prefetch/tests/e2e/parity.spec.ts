import { testQueryLayout } from '../../../../../tests/e2e/helpers/queryParity'

testQueryLayout(
  new URL('../../../../react/react-query-queued-prefetch', import.meta.url),
  '#app > div.App',
)
