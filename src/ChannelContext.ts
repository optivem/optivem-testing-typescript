export class ChannelContext {
    private static channel: string | undefined;

    static set(channel: string): void {
        this.channel = channel;
    }

    static get(): string | undefined {
        return this.channel;
    }

    static clear(): void {
        this.channel = undefined;
    }
}
