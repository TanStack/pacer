import { expectPacerDevtools } from '../../../../../tests/e2e/helpers/devtools'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import type { Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

async function openExample(page: Page, exampleUrl: string) {
  await page.goto(exampleUrl)
  await expect(page.getByText('Loading note...', { exact: true })).toBeVisible()
  // Let frameworks that run effects after a paint, such as Preact, catch up.
  await page.clock.runFor(17)
  // Let Query notify after the fake request resolves.
  await page.clock.runFor(301)
  await expect(
    page.getByRole('textbox', { name: 'Note', exact: true }),
  ).toHaveValue('Edit this note.')
}

const savesSent = (page: Page, count: number) =>
  expect(page.getByText(new RegExp(`Saves sent:\\s+${count}\\b`))).toBeVisible()

test('loads the saved note without saving', async ({ page, exampleUrl }) => {
  await openExample(page, exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer/Query Debounced Autosave Example',
    }),
  ).toBeVisible()
  await expect(
    page.getByText('All changes saved', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Edit this note.', { exact: true }).last(),
  ).toBeVisible()
  await savesSent(page, 0)
})

test('saves the latest draft once typing pauses', async ({
  page,
  exampleUrl,
}) => {
  await openExample(page, exampleUrl)
  const note = page.getByRole('textbox', { name: 'Note', exact: true })
  await note.press('End')
  await note.pressSequentially(' More')
  await expect(page.getByText('Unsaved changes', { exact: true })).toBeVisible()
  await page.clock.runFor(999)
  await savesSent(page, 0)

  await page.clock.runFor(1)
  // Let Query notify mutation subscribers.
  await page.clock.runFor(1)
  await expect(page.getByText('Saving...', { exact: true })).toBeVisible()
  await savesSent(page, 1)
  await page.clock.runFor(501)
  await expect(
    page.getByText('All changes saved', { exact: true }),
  ).toBeVisible()
  await expect(
    // The server copy follows the textarea.
    page.getByText('Edit this note. More', { exact: true }).last(),
  ).toBeVisible()
  await savesSent(page, 1)
})

test('saves immediately when the field loses focus', async ({
  page,
  exampleUrl,
}) => {
  await openExample(page, exampleUrl)
  const note = page.getByRole('textbox', { name: 'Note', exact: true })
  await note.press('End')
  await note.pressSequentially(' Now')
  await note.blur()
  // Let Query notify mutation subscribers.
  await page.clock.runFor(1)
  await expect(page.getByText('Saving...', { exact: true })).toBeVisible()
  await savesSent(page, 1)
  await page.clock.runFor(501)
  await expect(
    // The server copy follows the textarea.
    page.getByText('Edit this note. Now', { exact: true }).last(),
  ).toBeVisible()
  // The flushed save replaces the pending one rather than adding another.
  await page.clock.runFor(1000)
  await savesSent(page, 1)
})

test('shows the autosave debouncer in the Pacer devtools next to the Query panel', async ({
  page,
  exampleUrl,
}) => {
  await openExample(page, exampleUrl)
  await expectPacerDevtools(
    page,
    async () => {
      await page
        .getByRole('textbox', { name: 'Note', exact: true })
        .pressSequentially('!')
      await page.clock.runFor(1)
    },
    'Note Autosave Debouncer',
    // The Vue devtools host ignores `defaultOpen`, so open the panel by hand.
    { openFromPluginStrip: true },
  )
  await page
    .getByRole('navigation', { name: 'Plugin panels' })
    .getByRole('button', { name: 'TanStack Query', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Query key ["note"]', exact: true }),
  ).toBeVisible()
})
