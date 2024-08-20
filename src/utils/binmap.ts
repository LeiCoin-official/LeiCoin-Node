import { type ObjORNull } from "./dataUtils.js";
import cli from "../cli/cli.js";
import { BasicUintConstructable, Uint, Uint64 } from "./binary.js";

type BinaryMapIteratorResultType<K, V> = K extends Uint ?
                                             V extends null ? K : [K, V]
                                         : V;

type BasicUintConstructableORNull<T> = T extends Uint ? BasicUintConstructable<T> : null;


class BinaryMapIterator<KVT extends [Uint, NonNullable<any>] | [Uint, null] | [null, NonNullable<any>]> implements IterableIterator<KVT> {

    private CLS: BasicUintConstructable<Uint> | null;
    private mapEntries: IterableIterator<[string, V] | string | V>;

    constructor(CLS: BasicUintConstructable<Uint>, mapEntries: IterableIterator<[string, KVT[1]]>);
    constructor(CLS: BasicUintConstructable<Uint>, mapEntries: IterableIterator<string>);
    constructor(CLS: null, mapEntries: IterableIterator<V>);
    constructor(CLS: BasicUintConstructable<Uint> | null, mapEntries: IterableIterator<[string, KVT[1]] | string | KVT[1]>) {
        this.CLS = CLS;
        this.mapEntries = mapEntries
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<KVT> {
        const result = this.mapEntries.next();
        if (result.done) {
            return { done: true, value: undefined as V };
        }
        if (Array.isArray(result.value)) {
            return {
                done: false,
                value: [
                    this.CLS.from(result.value[0]),
                    result.value[1]
                ]
            };
        } else {
            return {
                done: true,
                value: result.value
            };
        }
    }
}


///** @deprecated Dont Use BMap because it Dont work */
abstract class AbstractBinaryMap<K extends Uint, V = any> implements Map<K, V> {

    protected readonly map: Map<string, V>;
    
    constructor(
        protected readonly CLS: BasicUintConstructable<K>
    ) {
        this.CLS = CLS;
        this.map = new Map();
    }

    public get size() {
        return this.map.size;
    }

    public get(key: K) {
        return this.map.get(key.toHex());
    }

    public set(key: K, value: V) {
        this.map.set(key.toHex(), value);
        return this;
    }

    public delete(key: K) {
        return this.map.delete(key.toHex());
    }

    public has(key: K) {
        return this.map.has(key.toHex());
    }

    public [Symbol.iterator]() {
        return new BinaryMapIterator(this.CLS, this.map[Symbol.iterator]());
    }

    public entries() {
        const result: [K, V][] = [];
        for (const [key, value] of super.entries()) {
            result.push([new this.CLS(Buffer.from(key)), value]);
        }
        return result.values();
    }
    
    public keys() {
        return new BinaryMapIterator(this.CLS, this.map.keys());
    }

    public values() {
        
    }


    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {

    }

    public clear(): void {
        throw new Error("Method not implemented.");
    }

    public get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}

export class UintMap<V = any> extends AbstractBinaryMap<Uint, V> {
    constructor() {
        super(Uint);
    }
}

new BinaryMapIterator<[Uint, number]>(Uint, new Map<string, number>()[Symbol.iterator]()).next();

