import { test } from '../../../../../tests/e2e/helpers/fixtures'
import { testComparisonControls } from '../../../../../tests/e2e/helpers/comparison'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

testComparisonControls()
