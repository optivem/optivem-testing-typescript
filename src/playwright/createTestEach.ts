/**
 * Creates a `test.each`-style helper bound to a specific Playwright test object.
 * Merges Playwright fixture values with each test-case row so tests can destructure both.
 *
 * Usage:
 * ```typescript
 * const testEach = createTestEach(test);
 *
 * testEach([{ quantity: 1 }, { quantity: 5 }])(
 *     'should handle quantity=$quantity',
 *     async ({ scenario, quantity }) => { ... }
 * );
 * ```
 */
export function createTestEach(
    testObj: any,
) {
    return <TCase extends Record<string, unknown>>(
        cases: ReadonlyArray<TCase>,
    ): ((name: string, fn: (args: any) => Promise<void>) => void) => {
        return (name: string, fn: (args: any) => Promise<void>): void => {
            cases.forEach((row) => {
                const testName = name.replace(/\$(\w+)/g, (_: string, key: string) => {
                    const value = row[key];
                    if (typeof value === 'string') return value;
                    if (typeof value === 'number') return value.toString();
                    return '';
                });
                // Inject each row property as a Playwright fixture so we
                // never need rest-property syntax in the test callback.
                const rowFixtures: Record<string, any> = {};
                for (const [key, value] of Object.entries(row)) {
                    rowFixtures[key] = async ({}: any, use: any) => {
                        await use(value);
                    };
                }
                const extendedTest = testObj.extend(rowFixtures);
                extendedTest(testName, fn);
            });
        };
    };
}
