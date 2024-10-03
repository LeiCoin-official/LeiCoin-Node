import { AbstractBinaryMap } from "../binary/map.js";
import { Uint256 } from "../binary/uint.js";
import { type LNSocket } from "./socket.js";

export class LNConnections extends AbstractBinaryMap<Uint256, LNSocket> {

    private static instance: LNConnections;
    
    static getInstance(connections?: [Uint256, LNSocket][]) {
        if (!this.instance) {
            this.instance = new LNConnections(connections);
        }
        return this.instance;
    }
    
    private constructor(
        connections?: [Uint256, LNSocket][]
    ) { super(Uint256, connections); }

    public get size() { return super.size; }

    public add(socket: LNSocket) {
        super.set(socket.meta.id, socket);
    }

    public get(id: Uint256) { return super.get(id); }

    public remove(id: Uint256): boolean;
    public remove(socket: LNSocket): boolean;
    public remove(arg0: Uint256 | LNSocket) {
        if (arg0 instanceof Uint256) {
            return super.delete(arg0);
        }
        return super.delete(arg0.meta.id);
    }
    
    public getAll() {
        return this.values().all();
    }

    public [Symbol.iterator]() { return this.entries(); }
    public entries() { return super.entries(); }
    public keys() { return super.keys(); }
    public values() { return super.values(); }

}
