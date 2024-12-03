import { BasicBinaryMap } from "low-level";
import { Uint256 } from "low-level";
import { type PeerSocket } from "./socket.js";

abstract class AbstractPeerConnectionsMap {

    private readonly store: BasicBinaryMap<Uint256, PeerSocket>;

    constructor(entries?: [Uint256, PeerSocket][]) {
        this.store = new BasicBinaryMap<Uint256, PeerSocket>(Uint256, entries);
    }

    public get size() { return this.store.size; }

    public add(socket: PeerSocket) {
        this.store.set(socket.uuid, socket);
    }

    public get(uuid: Uint256) { return this.store.get(uuid); }

    public remove(uuid: Uint256): boolean;
    public remove(socket: PeerSocket): boolean;
    public remove(arg0: Uint256 | PeerSocket) {
        if (arg0 instanceof Uint256) {
            return this.store.delete(arg0);
        }
        return this.store.delete(arg0.uuid);
    }
    
    public getAll() {
        return this.values().all();
    }

    public [Symbol.iterator]() { return this.entries(); }
    public entries() { return this.store.entries(); }
    public keys() { return this.store.keys(); }
    public values() { return this.store.values(); }

}

export class PeerConnections extends AbstractPeerConnectionsMap {

    readonly queue: PeerConnectionsQueue;

    constructor(entries?: [Uint256, PeerSocket][], queueEntries?: PeerConnectionsQueue) {
        super(entries);
        this.queue = queueEntries || new PeerConnectionsQueue();
    }

    public remove(uuid: Uint256, alsoRemoveFromQueue?: boolean): boolean;
    public remove(socket: PeerSocket, alsoRemoveFromQueue?: boolean): boolean;
    public remove(arg0: Uint256 | PeerSocket, alsoRemoveFromQueue = true) {
        const result1 = super.remove(arg0 as any);
        const result2 = alsoRemoveFromQueue ? this.queue.remove(arg0 as any) : false;
        return result1 || result2;
    }

    public moveFromQueue(uuid: Uint256) {
        const socket = this.queue.get(uuid);
        if (socket) {
            this.add(socket);
            this.queue.remove(uuid);
        }
    }

}


export class PeerConnectionsQueue extends AbstractPeerConnectionsMap {}

