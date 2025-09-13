# Playwright Test Creation Template

## Goals
- Guarantee a smoke test per feature
- Provide patterns for functional tests

## Structure
```
tests/
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

## Fixtures
- Place reusable setup in `tests/fixtures/` and import where needed.
