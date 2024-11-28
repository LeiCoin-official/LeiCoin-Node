
export class ListNode<T> {
    constructor(
        public data: T,
        public next: ListNode<T> | null = null
    ) {}
}


class LinkedListIterator<T> implements IterableIterator<T> {

    constructor(protected list: LinkedList<T>, protected current = list.getHeadNode()) {}
    
    public [Symbol.iterator]() { return this; }

    public next(): IteratorResult<T> {
        if (this.current) {
            const data = this.current.data;
            this.current = this.current.next;
            return { value: data, done: false };
        }
        return { value: undefined as T, done: true };
    }
}


export class LinkedList<T> {

    protected head: ListNode<T> | null = null;
    protected tail: ListNode<T> | null = null;


    public get size() {
        let size = 0;
        let current = this.head;
        while (current) {
            size++;
            current = current.next;
        }
        return size;
    }


    public addFirst(data: T) {
        const node = new ListNode(data, this.head);
        this.head = node;
        if (!this.tail) this.tail = node;
    }

    public addLast(data: T) {
        const node = new ListNode(data);
        if (this.tail) {
            this.tail.next = node;
            this.tail = node;
        } else {
            this.head = this.tail = node;
        }
    }

    public getFirst() { return this.head?.data; }
    public getLast() { return this.tail?.data; }

    public removeFirst() {
        if (!this.head) return false;
        this.head = this.head.next;
        if (!this.head) this.tail = null;
        return true;
    }

    public removeLast() {
        if (!this.head) return false;
        if (this.head === this.tail) {
            this.head = this.tail = null;
            return true;
        }
        
        let current = this.head;
        while (current.next !== this.tail) {
            current = current.next as ListNode<T>;
        }
        this.tail = current;
        this.tail.next = null;
        return true;
    }

    public getHeadNode() { return this.head; }
    public getTailNode() { return this.tail; }


    public clear() {
        this.head = this.tail = null;
    }


    public toArray() {
        let values = [];
        let current = this.head;
        while (current) {
            values.push(current.data);
            current = current.next;
        }
        return values;
    }

    public toString() {
        return this.toArray().join(" -> ");
    }


    public values() { return new LinkedListIterator(this); }
    public [Symbol.iterator]() { return this.values(); }


    get [Symbol.toStringTag]() { return this.constructor.name; }
    [Symbol.toPrimitive](hint: "string") { return this.toString(); }
    [Symbol.for('nodejs.util.inspect.custom')]() { return this.toString(); }

}


export class Queue<T> {

    constructor(protected list = new LinkedList<T>()) {}

    public get size() { return this.list.size; }

    public enqueue(data: T) {
        this.list.addLast(data);
    }

    public dequeue() {
        const data = this.list.getFirst() as T;
        this.list.removeFirst();
        return data;
    }

    public clear() { this.list.clear(); }

    public values() { return this.list.values(); }
    public [Symbol.iterator]() { return this.values(); }


    get [Symbol.toStringTag]() { return this.constructor.name; }
    [Symbol.toPrimitive](hint: "string") { return this.list.toString(); }
    [Symbol.for('nodejs.util.inspect.custom')]() { return this.list.toString(); }

}
