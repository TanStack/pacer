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
          x: Math.round(rect.left + window.scrollX),
          y: Math.round(rect.top + window.scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
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
    expect(
      await readLayout(page, rootSelector, names),
      `Layout at ${viewport.width}px`,
    ).toEqual(await readLayout(baseline, baselineRoot, names))
  }
}
