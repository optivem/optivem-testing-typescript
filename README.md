# Optivem Testing (TypeScript)

[![Commit Stage](https://github.com/optivem/optivem-testing-typescript/actions/workflows/commit-stage.yml/badge.svg)](https://github.com/optivem/optivem-testing-typescript/actions/workflows/commit-stage.yml)
[![Acceptance Stage](https://github.com/optivem/optivem-testing-typescript/actions/workflows/acceptance-stage.yml/badge.svg)](https://github.com/optivem/optivem-testing-typescript/actions/workflows/acceptance-stage.yml)
[![Release Stage](https://github.com/optivem/optivem-testing-typescript/actions/workflows/release-stage.yml/badge.svg)](https://github.com/optivem/optivem-testing-typescript/actions/workflows/release-stage.yml)

[![npm](https://img.shields.io/npm/v/@optivem/optivem-testing)](https://www.npmjs.com/package/@optivem/optivem-testing)

Composable Playwright helpers for channelized tests.

## Installation

```bash
npm install @optivem/optivem-testing
```

## Exports

- `forChannels` and channel primitives from `channel`
- `bindChannels(test)`
- `bindTestEach(test)`
- `channelTest` (legacy convenience helper)

## Example

```typescript
import { test as base, expect } from '@playwright/test';
import { bindChannels, bindTestEach } from '@optivem/optivem-testing';

const _test = base.extend<{ app: MyApp }>({
	app: async ({}, use) => {
		const app = createMyApp();
		await use(app);
		await app.close();
	},
});

const test = Object.assign(_test, {
	each: bindTestEach(_test),
});

const { forChannels } = bindChannels(test);

forChannels('UI', 'API')(() => {
	test.each(['3.5', 'lala'])(
		'rejects non-integer quantity ($quantity)',
		async ({ app, quantity }) => {
			await expect(app.placeOrder(quantity)).resolves.toBeDefined();
		},
	);
});
```

## Notes

- This package does **not** define domain fixtures like `app` or `scenario`.
- Build domain fixtures in your test-infrastructure layer, then compose them with these helpers.
