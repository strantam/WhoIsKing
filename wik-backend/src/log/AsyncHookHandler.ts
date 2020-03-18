import * as asyncHooks from 'async_hooks';
import * as uuid from 'uuid';

const context: Map<number, string> = new Map();

export class AsyncHookHandler {
    private static handler: AsyncHookHandler;

    private constructor() {
        this.createHooks();
    }

    public static getAsyncHookHandler(): AsyncHookHandler {
        if (!this.handler) {
            this.handler = new AsyncHookHandler();
        }
        return this.handler;
    }

    public createHooks(): void {
        function init(asyncId, type, triggerId): void {
            if (context.has(triggerId)) {
                context.set(asyncId, context.get(triggerId));
            }
        }

        function destroy(asyncId): void {
            context.delete(asyncId);
        }

        const asyncHook = asyncHooks.createHook({init, destroy});
        asyncHook.enable();
    }

    public init(): void {
        const eid = asyncHooks.executionAsyncId();
        const uid = uuid.v4();
        context.set(eid, uid);
    }

    public getTransactionId(): string {
        return context.get(asyncHooks.executionAsyncId());
    }
}