import { withChannels as sharedWithChannels } from '../channel.js';

/**
 * Creates channel helpers (withChannels) bound to a specific Playwright test object.
 *
 * Usage:
 * ```typescript
 * const test = base.extend<{ app: MyApp }>({ ... });
 * const { withChannels } = createChannelHelpers(test);
 *
 * withChannels('UI', 'API')(() => {
 *     test('my test', async ({ app }) => { ... });
 * });
 * ```
 */
export function createChannelHelpers(testObj: {
    describe: (name: string, callback: () => void) => void;
    beforeEach: (callback: () => void | Promise<void>) => void;
    afterEach: (callback: () => void | Promise<void>) => void;
}) {
    const withChannels = (...channelTypes: string[]): ((block: () => void) => void) => {
        return sharedWithChannels(
            {
                describe: (name, callback) => testObj.describe(name, callback),
                beforeEach: (callback) => testObj.beforeEach(callback),
                afterEach: (callback) => testObj.afterEach(callback),
            },
            ...channelTypes,
        );
    };

    return { withChannels };
}
