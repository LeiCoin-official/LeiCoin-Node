import { UintMap } from "../binary/map.js";
import { Uint } from "../binary/uint.js";
import { SocketData, type LNSocket } from "./socket.js";

export class LNConnections {

    private static instance: LNConnections;
    
    static createInstance(connections: UintMap<LNSocket> = new UintMap()) {
        if (!this.instance) {
            this.instance = new LNConnections(connections);
        }
        return this.instance;
    }
    
    private constructor(
        protected readonly connections: UintMap<LNSocket>
    ) {}

    public get size() {
        return this.connections.size;
    }

    public add(socket: LNSocket) {
        if (!socket.data) {
            socket.data = new SocketData(socket.remoteAddress, socket.localPort);
        }
        this.connections.set(socket.data.id, socket);
    }

    public get(id: Uint) {
        return this.connections.get(id);
    }

    public remove(id: Uint): boolean;
    public remove(socket: LNSocket): boolean;
    public remove(arg0: Uint | LNSocket) {
        if (arg0 instanceof Uint) {
            return this.connections.delete(arg0);
        }
        return this.connections.delete(arg0.data.id);
    }
    
    public getAll() {
        return this.values().all();
    }

    public [Symbol.iterator]() { return this.entries(); }
    public entries() { return this.connections.entries(); }
    public keys() { return this.connections.keys(); }
    public values() { return this.connections.values(); }

}
