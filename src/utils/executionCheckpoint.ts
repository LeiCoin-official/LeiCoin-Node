import { Deferred } from "./deferred.js";

export class ExecutionCheckpoint {

    private readonly deferred = new Deferred<void>();

    /**
     * @param code - (Optional) The code to execute when the checkpoint is passed.
     */
    constructor(
        protected readonly code?: () => Promise<void> | void
    ) {}

    /** Set the checkpoint as passed. */
    async pass() {
        if (this.code) {
            await this.code();
        }
        this.deferred.resolve();
    }

    /** Wait for the checkpoint to be passed. */
    public passing() {
        return this.deferred.awaitResult();
    }

    /** Check if the checkpoint has already been passed. */
    public hasPassed() {
        return this.deferred.hasResolved();
    }

}