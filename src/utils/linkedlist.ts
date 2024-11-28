
export class ListNode<T> {
    constructor(
        public data: T,
        public next: ListNode<T> | null = null
    ) {}
}

export class LinkedList<T> {
    private head: ListNode<T> | null = null;
    private tail: ListNode<T> | null = null;

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

    public getFirst() {
        return this.head?.data;
    }

    public getLast() {
        return this.tail?.data;
    }

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


    public clear() {
        this.head = this.tail = null;
    }

}
