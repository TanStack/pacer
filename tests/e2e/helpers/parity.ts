import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/** Reads the visible example layout, excluding framework roots and devtools. */
async function readLayout(
  page: Page,
  rootSelector: string,
  names: Array<[string, string]>,
) {
  return page.locator(rootSelector).evaluate(
    (root, replacements) =>
      Array.from(
        root.querySelectorAll('h1, table, fieldset, label, input, button, pre'),
      ).map((element) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return {
          tag: element.tagName,
          text:
            element.tagName === 'PRE'
              ? undefined
              : replacements.reduce(
                  (text, [name, baseline]) => text.replaceAll(name, baseline),
                  (element as HTMLElement).innerText
                    .replace(/\s+/g, ' ')
                    .trim(),
                ),
          font: style.font,
          color: style.color,
          background: style.backgroundColor,
          border: style.border,
          padding: style.padding,
          margin: style.margin,
          radius: style.borderRadius,
          geometry: {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
          },
        }
      }),
    names,
  )
}

/** Compares real layout and computed styles at desktop and phone widths. */
export async function expectMatchingExampleLayout(
  page: Page,
  baseline: Page,
  rootSelector = '#app > div:first-child',
  names: Array<[string, string]> = [],
  baselineRoot = '#root > div:first-child',
) {
  // Use the target framework's API names in the baseline before measuring.
  // A longer name can legitimately wrap onto another line on a phone.
  await baseline.locator(baselineRoot).evaluate((root, replacements) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      for (const [name, baselineName] of replacements) {
        node.textContent =
          node.textContent?.replaceAll(baselineName, name) ?? ''
      }
    }
  }, names)
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await baseline.setViewportSize(viewport)
    const actual = await readLayout(page, rootSelector, names)
    const expected = await readLayout(baseline, baselineRoot, names)
    const label = `Layout at ${viewport.width}px`
    expect(actual, label).toHaveLength(expected.length)
    for (let index = 0; index < expected.length; index++) {
      const { geometry: actualGeometry, ...actualAppearance } = actual[index]!
      const { geometry: expectedGeometry, ...expectedAppearance } =
        expected[index]!
      const elementLabel = `${label}, element ${index} (${expectedAppearance.tag})`
      expect(actualAppearance, elementLabel).toEqual(expectedAppearance)
      // Fractional text metrics can straddle an integer rounding boundary.
      // Allow one CSS pixel in geometry while keeping text and styles exact.
      for (const dimension of ['x', 'y', 'width', 'height'] as const) {
        expect(
          Math.abs(actualGeometry[dimension] - expectedGeometry[dimension]),
          `${elementLabel}, ${dimension}`,
        ).toBeLessThanOrEqual(1)
      }
    }
  }
}
