
export class ExternalPromise<T = void> {

    private _resolve!: (value: T | PromiseLike<T>) => void;
    private _reject!: (reason?: any) => void;

    private readonly promise: Promise<T>;
    private resolved = false;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public resolve(value: T | PromiseLike<T>) {
        this._resolve(value);
        this.resolved = true;
    }

    public reject(reason?: any) {
        this._reject(reason);
        this.resolved = true;
    }

    public get result() {
        return this.promise;
    }

    public get finished() {
        return this.resolved;
    }
}
