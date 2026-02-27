import { ChannelContext } from './ChannelContext.js';

type ChannelTestFn<TFixtures> = (fixtures: TFixtures) => Promise<void>;
type RegisterChannelTest<TFixtures> = (
    testName: string,
    testFn: ChannelTestFn<TFixtures>
) => void;

type DescribeBlock = (name: string, callback: () => void) => void;
type Hook = (callback: () => void | Promise<void>) => void;

export interface ChannelDescribeApi {
    describe: DescribeBlock;
    beforeEach: Hook;
    afterEach: Hook;
}

export function registerChannelTest<TFixtures>(
    registerTest: RegisterChannelTest<TFixtures>,
    channelTypes: string[],
    testName: string,
    testFn: ChannelTestFn<TFixtures>
): void {
    const channelEnv = process.env.CHANNEL;
    const channelsToRun =
        channelEnv != null && channelEnv !== ''
            ? channelTypes.filter((c) => c === channelEnv)
            : channelTypes;

    for (const channel of channelsToRun) {
        registerTest(`[${channel} Channel] ${testName}`, async (fixtures) => {
            try {
                ChannelContext.set(channel);
                await testFn(fixtures);
            } finally {
                ChannelContext.clear();
            }
        });
    }
}

export function createChannel<TFixtures>(
    registerTest: RegisterChannelTest<TFixtures>,
    ...channelTypes: string[]
): (testName: string, testFn: ChannelTestFn<TFixtures>) => void {
    return (testName: string, testFn: ChannelTestFn<TFixtures>) => {
        registerChannelTest(registerTest, channelTypes, testName, testFn);
    };
}

export function withChannels(
    channelApi: ChannelDescribeApi,
    ...channelTypes: string[]
): (block: () => void) => void {
    return (block: () => void) => {
        const channelEnv = process.env.CHANNEL;
        const channelsToRun =
            channelEnv != null && channelEnv !== ''
                ? channelTypes.filter((c) => c === channelEnv)
                : channelTypes;

        for (const channel of channelsToRun) {
            channelApi.describe(`[${channel} Channel]`, () => {
                channelApi.beforeEach(() => {
                    ChannelContext.set(channel);
                });
                channelApi.afterEach(() => {
                    ChannelContext.clear();
                });
                block();
            });
        }
    };
}
