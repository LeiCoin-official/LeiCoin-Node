import cli from "../cli/cli.js";
import type { Socket, SocketHandler } from "bun";
import { Uint, Uint256 } from "low-level";
import LCrypt from "../crypto/index.js";
import { LNBroadcastMsg, LNRequestMsg, LNResponseMsg, LNStandartMsg } from "./messaging/networkMessages.js";
import { LNActiveRequests, LNResponseData } from "./requests.js";
import type { LNMsgRequestHandler, LNBroadcastingMsgHandler, LNMsgDefaultHandler } from "./messaging/abstractMsgHandler.js";
import LeiCoinNetNode from "./index.js";
import { LNMsgID, LNAbstractMsgBody } from "./messaging/abstractMsg.js";
import { MessageRouter } from "./messaging/index.js";
import { LNController, PeerSocketController } from "./controller.js";
import { AutoProcessingQueue, Queue } from "../utils/queue.js";
import { LNDataChunk } from "./packets.js";


export class PeerSocket {
    
    readonly host: string;
    public port: number;
    readonly uuid = new Uint256(LCrypt.randomBytes(32));
    readonly challenge = new Uint256(LCrypt.randomBytes(32));

    private _state: "OPENING" | "READY" | "VERIFIED" | "CLOSED" = "OPENING";

    private sendingQueue = new AutoProcessingQueue<Uint>(this.processOutgoingData.bind(this));
    private recvQueue: Queue<Uint> | null = new Queue();

    /**
     * The buffer array stores Buffers with a maximum size of 8192 bytes per buffer.
     * The Maximum size of the Array is 65536 which results in maximum storage capacity of 512 MB
     */
    private recvBufferArray: Uint[] = [];
    /**
     * The Maximum size of the buffer array is 65536.
     * @todo maybe adjust this value later 
     */
    private recvBufferChunkLimit = 65536;

    constructor(
        protected readonly tcpSocket: Socket<any>,
        readonly type: "INCOMING" | "OUTGOING",
        readonly activeRequests: LNActiveRequests = new LNActiveRequests()
    ) {
        this.host = tcpSocket.remoteAddress;
        /** @todo Change this to `this.port = tcpSocket.remotePort;` when Bun has implemented scoket.remotePort */
        this.port = 0;

        tcpSocket.data = this;
    }

    static async connect(
        host: string,
        port: number,
        skipStatusCheck = false
    ) {
        try {
            const socket = (await Bun.connect({
                hostname: host, port,
                socket: LNSocketHandler.Client,
            })).data;
            socket.port = port;

            if (skipStatusCheck) {
                socket.state = "READY";
            } else {
                cli.leicoin_net.info(`A Connection was established with ${socket.uri}. Connection Type: ${socket.type}`);
                await PeerSocketController.accomplishHandshake(socket);
            }

            return socket;
        } catch (error: any) {
            return null;
        }
    }


    get uri() {
        return `${this.host}:${this.port}`;
    }


    set state(newState: "READY" | "VERIFIED" | "CLOSED") {
        if (newState === "READY" && this._state === "OPENING" && this.recvQueue) {

            while (this.recvQueue.size > 0) {
                const data = this.recvQueue.dequeue() as Uint;
                this.handleIncomingMsg(data);
            }
            this.recvQueue = null;
        }
        if (newState === "VERIFIED") {
            LeiCoinNetNode.connections.moveFromQueue(this.uuid);
        }
        this._state = newState;
    }
    get state(): typeof this._state {
        return this._state;
    }


    async send(data: LNAbstractMsgBody | LNStandartMsg | Uint) {
        let raw: Uint;
        if (data instanceof LNAbstractMsgBody) {
            raw = new LNStandartMsg(data).encodeToHex();
        } else if (data instanceof LNStandartMsg) {
            raw = data.encodeToHex();
        } else {
            raw = data;
        }
        return this.sendingQueue.enqueue(raw);
    }

    private async processOutgoingData(data: Uint) {
        if (data.getLen() === 0) return

        const chunks = data.split(LNDataChunk.MAX_CHUNK_SIZE);

        for (let i = 0; i < chunks.length - 1; i++) {
            const chunk = LNDataChunk.create(chunks[i], false);
            this.tcpSocket.write(chunk.encodeToHex().getRaw());
        }

        const lastChunk = LNDataChunk.create(chunks[chunks.length - 1], true);
        this.tcpSocket.write(lastChunk.encodeToHex().getRaw());
    }


    async request<T extends LNAbstractMsgBody>(data: LNRequestMsg | LNAbstractMsgBody): Promise<LNResponseData<T>> {
        let reqmsg: LNRequestMsg;
        if (data instanceof LNAbstractMsgBody) {
            reqmsg = LNRequestMsg.create(data);
        } else {
            reqmsg = data;
        }

        this.send(reqmsg.encodeToHex());

        const req = this.activeRequests.add<T>(reqmsg);

        const response = await req.awaitResult();
        this.activeRequests.delete(req.id);

        return response;
    }
    

    async receiveDataChunk(rawChunk: Uint) {
        const chunk = LNDataChunk.fromDecodedHex(rawChunk);
        if (!chunk) return;

        if (this.recvBufferArray.length >= this.recvBufferChunkLimit) {
            return;
        }
        this.recvBufferArray.push(chunk.data);

        if (chunk.isLast()) {
            const completeData = Uint.concat(this.recvBufferArray);
            this.recvBufferArray = [];

            if (this.state === "OPENING" && this.recvQueue) {
                return this.recvQueue.enqueue(completeData);
            }
            return this.handleIncomingMsg(completeData);
        }
    }


    private async handleIncomingMsg(rawMsg: Uint) {
        const handler = MessageRouter.getMsgInfo(rawMsg.slice(0, 2) as LNMsgID)?.Handler;
        if (!handler) return;

        switch (handler.type) {

            case "DEFAULT": {
                const msg = LNStandartMsg.fromDecodedHex(rawMsg);
                if (!msg) return;

                (handler as LNMsgDefaultHandler).receive(msg.data, this);
                return;
            }
            case "REQUEST": {
                const msg = LNRequestMsg.fromDecodedHex(rawMsg);
                if (!msg) return;

                // Reserved Space for internal use
                if (msg.requestID.lte(0xff) || this.activeRequests.has(msg.requestID)) {
                    return;
                }

                const response = await (handler as LNMsgRequestHandler).receive(msg.data, this, msg.requestID);
                if (response) {
                    this.send(new LNResponseMsg(msg.requestID, response));
                }
                return;
            }
            case "RESPONSE": {
                const msg = LNResponseMsg.fromDecodedHex(rawMsg);
                if (!msg) return;

                const request = this.activeRequests.get((msg as LNResponseMsg).requestID);
                if (request) {
                    request.resolve(msg.data);
                }
                return;
            }
            case "BROADCAST": {
                const msg = LNBroadcastMsg.fromDecodedHex(rawMsg);
                if (!msg) return;

                const cb = await (handler as LNBroadcastingMsgHandler).receive(msg.data);
                if (cb) {
                    LNController.broadcast(new LNBroadcastMsg(cb));
                }
                return;
            }
        }
    }

    async close(lastMessage?: Uint | null): Promise<void | number>;
    async close(lastMessage: Uint | null, reason: string): Promise<void | number>;
    async close(lastMessage: Uint | null, silent: boolean): Promise<void | number>;
    async close(lastMessage?: Uint | null, arg1?: string | boolean) {
        if (this.state === "CLOSED") return;
        const cb = this.tcpSocket.end(lastMessage?.getRaw());

        if (arg1 !== true) {
            cli.leicoin_net.info(`Connection to ${this.uri} closed.${arg1 ? ` Reason: ${arg1}` : ""}`);
        }
        return cb;
    }
}

export namespace LNSocketHandler {
    
    abstract class BasicSocketHandler implements SocketHandler<PeerSocket> {

        readonly binaryType = "buffer";
    
        protected static instance: BasicSocketHandler;
    
        constructor() {
            const CLS = this.constructor as typeof BasicSocketHandler;
            if (!CLS.instance) {
                CLS.instance = this;
            }
            return CLS.instance;
        }
    
        async open(tcpSocket: Socket<PeerSocket>) {
            const socket = new PeerSocket(tcpSocket, tcpSocket.listener ? "INCOMING" : "OUTGOING");
            LeiCoinNetNode.connections.queue.add(socket);
        }
    
        async close(tcpSocket: Socket<PeerSocket>) {
            tcpSocket.data.state = "CLOSED";
            LeiCoinNetNode.connections.remove(tcpSocket.data);
        }
        async end(tcpSocket: Socket<PeerSocket>) {
            tcpSocket.data.state = "CLOSED";
            LeiCoinNetNode.connections.remove(tcpSocket.data);

            cli.leicoin_net.info(`${tcpSocket.data.uri} has ended the connection.`);
        }
    
        async timeout(tcpSocket: Socket<PeerSocket>) {
            cli.leicoin_net.info(`Connection to ${tcpSocket.data.uri} timed out.`);
        }
    
        async error(tcpSocket: Socket<PeerSocket>, error: Error) {
            cli.leicoin_net.error(`Connection Error: ${error.stack}`);
        }
    
        async data(tcpSocket: Socket<PeerSocket>, data: Buffer) {
            tcpSocket.data.receiveDataChunk(new Uint(data));
        }
    
        async drain(tcpSocket: Socket<PeerSocket>) {
            cli.leicoin_net.info(`Connection to ${tcpSocket.data.uri} drained.`);
        }
    
        async handshake(tcpSocket: Socket<PeerSocket>, success: boolean, authorizationError: Error | null) {}
    }

    export type Basic = BasicSocketHandler;

    
    export const Server: BasicSocketHandler = new class LNServerSocketHandler extends BasicSocketHandler {
        
        async open(tcpSocket: Socket<PeerSocket>) {
            await super.open(tcpSocket);
            cli.leicoin_net.info(`A Connection was established with ${tcpSocket.data.uri}. Connection Type: ${tcpSocket.data.type}`);
            PeerSocketController.accomplishHandshake(tcpSocket.data);
        }

    }
    
    export const Client: BasicSocketHandler = new class LNClientSocketHandler extends BasicSocketHandler {}

}

