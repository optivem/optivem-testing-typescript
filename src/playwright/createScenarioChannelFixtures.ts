import { test as base, expect } from '@playwright/test';
import {
    registerChannelTest,
    withChannels as sharedWithChannels,
} from '../channel.js';

export interface ScenarioChannelFixtures<TScenario> {
    scenario: TScenario;
}

export interface ScenarioChannelFixtureBuilderOptions<TApp, TScenario> {
    createApp: () => TApp | Promise<TApp>;
    closeApp?: (app: TApp) => void | Promise<void>;
    createScenario: (app: TApp) => TScenario;
}

export interface ScenarioChannelFixtureBundle<TApp, TScenario> {
    test: ReturnType<typeof base.extend<{ app: TApp; scenario: TScenario }>> & {
        each: <TCase extends Record<string, unknown>>(
            cases: ReadonlyArray<TCase>
        ) => (name: string, fn: (args: { scenario: TScenario } & TCase) => Promise<void>) => void;
    };
    expect: typeof expect;
    scenarioChannelTest: (
        _externalSystemMode: unknown,
        channelTypes: string[],
        testName: string,
        testFn: (fixtures: ScenarioChannelFixtures<TScenario>) => Promise<void>
    ) => void;
    Channel: (
        ...channelTypes: string[]
    ) => (testName: string, testFn: (fixtures: ScenarioChannelFixtures<TScenario>) => Promise<void>) => void;
    withChannels: (...channelTypes: string[]) => (block: () => void) => void;
    testEach: <TCase extends Record<string, unknown>>(
        cases: ReadonlyArray<TCase>
    ) => (name: string, fn: (args: { scenario: TScenario } & TCase) => Promise<void>) => void;
}

export function createScenarioChannelFixtures<TApp, TScenario>(
    options: ScenarioChannelFixtureBuilderOptions<TApp, TScenario>
): ScenarioChannelFixtureBundle<TApp, TScenario> {
    const test = base.extend<{ app: TApp; scenario: TScenario }>({
        app: async ({}, use) => {
            const app = await options.createApp();
            await use(app);
            if (options.closeApp) {
                await options.closeApp(app);
            }
        },
        scenario: async ({ app }, use) => {
            const scenario = options.createScenario(app);
            await use(scenario);
        },
    });

    const scenarioChannelTest = (
        _externalSystemMode: unknown,
        channelTypes: string[],
        testName: string,
        testFn: (fixtures: ScenarioChannelFixtures<TScenario>) => Promise<void>
    ): void => {
        registerChannelTest<ScenarioChannelFixtures<TScenario>>(
            (name, scenarioTestFn) => {
                test(name, async ({ scenario }) => {
                    await scenarioTestFn({ scenario });
                });
            },
            channelTypes,
            testName,
            testFn
        );
    };

    const Channel =
        (...channelTypes: string[]) =>
        (testName: string, testFn: (fixtures: ScenarioChannelFixtures<TScenario>) => Promise<void>): void => {
            scenarioChannelTest(undefined, channelTypes, testName, testFn);
        };

    const testEach = <TCase extends Record<string, unknown>>(
        cases: ReadonlyArray<TCase>
    ): ((name: string, fn: (args: { scenario: TScenario } & TCase) => Promise<void>) => void) => {
        return (name: string, fn: (args: { scenario: TScenario } & TCase) => Promise<void>): void => {
            cases.forEach((row) => {
                const testName = name.replaceAll(/\$(\w+)/g, (_, key) => {
                    const value = row[key];
                    if (typeof value === 'string') return value;
                    if (typeof value === 'number') return value.toString();
                    return '';
                });
                test(testName, async ({ scenario }) => {
                    await fn({ scenario, ...row } as { scenario: TScenario } & TCase);
                });
            });
        };
    };

    (test as unknown as { each: typeof testEach }).each = testEach;

    const withChannels = (...channelTypes: string[]): ((block: () => void) => void) => {
        return sharedWithChannels(
            {
                describe: (name, callback) => test.describe(name, callback),
                beforeEach: (callback) => test.beforeEach(callback),
                afterEach: (callback) => test.afterEach(callback),
            },
            ...channelTypes
        );
    };

    return {
        test: test as ScenarioChannelFixtureBundle<TApp, TScenario>['test'],
        expect,
        scenarioChannelTest,
        Channel,
        withChannels,
        testEach,
    };
}
