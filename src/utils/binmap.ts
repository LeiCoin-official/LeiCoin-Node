import { BasicUintConstructable, Uint } from "./binary.js";


/** @deprecated Dont Use BMap because it Dont work */
export class BMap<K extends Uint, V> extends Map {

    private readonly CLS: BasicUintConstructable<K>;
    
    // @ts-ignore
    constructor(CLS: BasicUintConstructable<K> = Uint) {
        super();
        this.CLS = CLS;
    }

    public delete(key: K) {
        return super.delete(key.getAB());
    }

    /*public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {

    }*/

    public get(key: K) {
        return super.get(key.getAB());
    }

    public has(key: K) {
        return super.has(key.getAB());
    }

    public set(key: K, value: V) {
        return super.set(key.getAB(), value);
    }

    public [Symbol.iterator](): IterableIterator<[K, V]> {
        /*const result: [K, V][] = [];
        for (const [key, value] of super[Symbol.iterator]()) {
            result.push([this.CLS.from(key), value]);
        }
        return result.values();*/

        const CLS = this.CLS;
        const entriesIterator = super[Symbol.iterator]();

        return {
            [Symbol.iterator]() {
                return this;
            },
            next(): IteratorResult<[K, V]> {
                const result = entriesIterator.next();
                console.log("result", result.value)
                if (result.done) {
                    return { done: true, value: undefined as any };
                }
                const [key, value] = result.value;
                return {
                    done: false,
                    value: [new CLS(Buffer.from(key)), value as V]
                };
            }
        };

    }


    public entries() {
        const result: [K, V][] = [];
        for (const [key, value] of super.entries()) {
            result.push([new this.CLS(Buffer.from(key)), value]);
        }
        return result.values();
    }
    
    /*public keys() {
        const result = new Set();
        for (const key of super.keys()) {
            result.push(new this.CLS(Buffer.from(key)));
        }
        return result.values(;
    }*/

}

export { BMap as BinMap };
export default BMap;
