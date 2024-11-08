import { AbstractBinaryMap } from "low-level";
import { Uint256 } from "low-level";
import { type PeerSocket } from "./socket.js";

abstract class AbstractPeerConnectionsMap extends AbstractBinaryMap<Uint256, PeerSocket> {

    constructor(entries?: [Uint256, PeerSocket][]) {
        super(Uint256, entries);
    }

    public get size() { return super.size; }

    public add(socket: PeerSocket) {
        super.set(socket.uuid, socket);
    }

    public get(uuid: Uint256) { return super.get(uuid); }

    public remove(uuid: Uint256): boolean;
    public remove(socket: PeerSocket): boolean;
    public remove(arg0: Uint256 | PeerSocket) {
        if (arg0 instanceof Uint256) {
            return super.delete(arg0);
        }
        return super.delete(arg0.uuid);
    }
    
    public getAll() {
        return this.values().all();
    }

    public [Symbol.iterator]() { return this.entries(); }
    public entries() { return super.entries(); }
    public keys() { return super.keys(); }
    public values() { return super.values(); }

}

export class PeerConnections extends AbstractPeerConnectionsMap {

    readonly queue: PeerConnectionsQueue;

    constructor(entries?: [Uint256, PeerSocket][], queueEntries?: PeerConnectionsQueue) {
        super(entries);
        this.queue = queueEntries || new PeerConnectionsQueue();
    }

    public moveFromQueue(uuid: Uint256) {
        const socket = this.queue.get(uuid);
        if (socket) {
            this.add(socket);
            this.queue.remove(uuid);
        }
    }

}


export class PeerConnectionsQueue extends AbstractPeerConnectionsMap {
    
    
}

