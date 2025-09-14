# Playwright Test Creation Template

## Goals
- Guarantee a smoke test per feature
- Provide patterns for functional tests

## Structure
```text
web/tests/e2e/
├── smoke/
├── functional/
└── fixtures/
```

## Smoke Test Template (TypeScript)
```ts
import { test, expect } from '@playwright/test';

test.describe('Smoke Test - [Feature Name]', () => {
  test('Critical path verification', async ({ page }) => {
    // Arrange
    // Act
    // Assert
    expect(true).toBeTruthy();
  });
});
```

## Functional Test Guidance
- Use descriptive `describe` and `test` names.
- Prefer data-testids for selectors.
- Isolate network with fixtures/mocks when necessary.
- Include basic accessibility checks where relevant:
  ```ts
  const snapshot = await page.accessibility.snapshot({ interestingOnly: true })
  expect(snapshot).toBeTruthy()
  ```
- Optionally capture perf metrics if meaningful (e.g., navigation timing):
  ```ts
  const nav = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.toJSON())
  expect(nav).toBeDefined()
  // Example: sanity check key timings exist
  expect((nav as any).domContentLoadedEventEnd).toBeGreaterThan(0)
  ```

## Fixtures
- Place reusable setup in `web/tests/e2e/fixtures/` and import where needed.
