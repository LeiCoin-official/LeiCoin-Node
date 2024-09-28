import { BasicUintConstructable, Uint } from "./uint.js";
import { Dict } from "../utils/dataUtils.js";

abstract class BMapIteratorLike<T, M> implements IterableIterator<T> {

    constructor(protected mapEntries: IterableIterator<M>) {}

    public [Symbol.iterator]() { return this; }

    public next(): IteratorResult<T> {
        const result = this.mapEntries.next();
        if (result.done) {
            return { done: true, value: undefined as M };
        }
        return { done: false, value: this._next(result.value) };
    }
    protected abstract _next(value: M): T;

    public all(): T[] {
        const result: T[] = [];
        for (const value of this) {
            result.push(value);
        }
        return result;
    }
}

class BMapEntriesIterator<K extends Uint, V> extends BMapIteratorLike<[K, V], [string, any]> {
    constructor(protected CLS: BasicUintConstructable<K>, mapEntries: IterableIterator<[string, V]>) {
        super(mapEntries);
    }
    protected _next(value: [string, V]): [K, V] {
        return [this.CLS.from(value[0]), value[1]];
    }
}

class BMapKeysIterator<K extends Uint> extends BMapIteratorLike<K, string> {
    constructor(protected CLS: BasicUintConstructable<K>, mapEntries: IterableIterator<string>) {
        super(mapEntries);
    }
    protected _next(value: string): K {
        return this.CLS.from(value);
    }
}

class BMapValuesIterator<V> extends BMapIteratorLike<V, V> {
    constructor(mapEntries: IterableIterator<V>) {
        super(mapEntries);
    }
    protected _next(value: V): V {
        return value;
    }
}

export {
    type BMapIteratorLike,
    type BMapEntriesIterator,
    type BMapKeysIterator,
    type BMapValuesIterator,
}


export abstract class AbstractBinaryMap<K extends Uint, V> {
    
    protected readonly store: Dict<V> = {};

    constructor(
        protected readonly CLS: BasicUintConstructable<K>,
        entries?: readonly (readonly [K, V])[]
    ) {
        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    public get size() {
        return Object.keys(this.store).length;
    }

    public get(key: K) {
        return this.store[key.toHex()];
    }

    public set(key: K, value: V) {
        return this.store[key.toHex()] = value;
    }

    public delete(key: K) {
        return delete this.store[key.toHex()];
    }

    public has(key: K) {
        return key.toHex() in this.store;
    }

    public [Symbol.iterator]() {
        return this.entries();
    }
    public entries() {
        return new BMapEntriesIterator(this.CLS, Object.entries(this.store).values());
    }
    public keys() {
        return new BMapKeysIterator(this.CLS, Object.keys(this.store).values());
    }
    public values() {
        return new BMapValuesIterator(Object.values(this.store).values());
    }

    public forEach(callbackfn: (value: V, key: K) => void, thisArg?: any) {
        for (const [key, value] of this.entries()) {
            callbackfn.call(thisArg, value, key);
        };
    }

    public clear() {
        for (const key of this.keys()) {
            this.delete(key);
        }
    }

    public get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}

export class UintMap<V> extends AbstractBinaryMap<Uint, V> {
    constructor(entries?: readonly (readonly [Uint, V])[]) {
        super(Uint, entries);
    }
}


