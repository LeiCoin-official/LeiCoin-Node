
export class Deferred<T = void> {

    protected _resolve: ((value: any) => void) | null = null;
    protected _reject: ((reason?: any) => void) | null = null;

    protected readonly promise: Promise<T>;
    protected resolved = false;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    protected cleanup() {
        this._resolve = null;
        this._reject = null;
    }

    public resolve(value: T | PromiseLike<T>) {
        if (!this._resolve) return;

        this._resolve(value);
        this.resolved = true;
        this.cleanup();
    }

    public reject(reason?: any) {
        if (!this._reject) return;

        this._reject(reason);
        this.resolved = true;
        this.cleanup();
    }

    public awaitResult() {
        return this.promise;
    }

    public hasResolved() {
        return this.resolved;
    }

}

