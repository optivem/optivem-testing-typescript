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
    testObj: (name: string, fn: (fixtures: any) => Promise<void>) => void,
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
                testObj(testName, async (fixtures: any) => {
                    await fn({ ...fixtures, ...row });
                });
            });
        };
    };
}
