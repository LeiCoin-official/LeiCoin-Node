
export class BoundedExecutor<T> {
    private code: () => Promise<T>;
    private timeout: number;
    private promise: Promise<T | null>;

    constructor(code: () => Promise<T>, timeout: number) {
        this.code = code;
        this.timeout = timeout;

        this.promise = Promise.race([
            this.executeCode(),
            this.timeoutPromise()
        ]);
    }

    public awaitResult() {
        return this.promise;
    }

    private async executeCode() {
        return await this.code();
    }

    private timeoutPromise() {
        return new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), this.timeout);
        });
    }
}
