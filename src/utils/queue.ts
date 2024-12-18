import { Deferred } from "./deferred.js";
import { LinkedList } from "./linkedlist.js";

export class Queue<T> {
    
    protected list = new LinkedList<T>()

    public get size() { return this.list.size; }

    public enqueue(data: T) {
        this.list.addLast(data);
    }

    public dequeue() {
        const data = this.list.getFirst() || null;
        this.list.removeFirst();
        return data;
    }

    public front() { return this.list.getFirst(); }
    public back() { return this.list.getLast(); }

    public clear() { this.list.clear(); }

    public values() { return this.list.values(); }
    public [Symbol.iterator]() { return this.values(); }


    get [Symbol.toStringTag]() { return this.constructor.name; }
    [Symbol.toPrimitive](hint: "string") { return this.list.toString(); }
    [Symbol.for('nodejs.util.inspect.custom')]() { return this.list.toString(); }

}



class ProcessState<T> {
    constructor(
        readonly data: T,
        readonly proccessed = new Deferred()
    ) {}
}

export class AutoProcessingQueue<T> {

    protected queue = new Queue<ProcessState<T>>();
    protected processing = false;

    constructor(
        protected readonly process: (data: T) => Promise<void>
    ) {}

    public async enqueue(data: T) {
        const ps = new ProcessState(data);
        this.queue.enqueue(ps);
        this.processAll();
        return ps.proccessed.awaitResult();
    }

    protected async processAll() {
        if (this.processing || this.queue.size === 0) return;
        this.processing = true;

        while (this.queue.size > 0) {
            const ps = this.queue.dequeue() as ProcessState<T>;
            await this.process(ps.data);
            ps.proccessed.resolve();
        }

        this.processing = false;
    }

}

