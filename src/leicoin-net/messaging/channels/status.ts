import { Uint, Uint16, Uint256 } from "../../../binary/uint.js";
import { IPv6Addr, Port } from "../../../objects/netinfo.js";
import LeiCoinNetNode from "../../index.js";
import { type LNSocket } from "../../socket.js";
import { MessagingChannel } from "../abstractChannel.js";
import { LNMsgType } from "../messageTypes.js";

export class StatusMsg {

    constructor(
        readonly version: Uint16,
        readonly port: Port,
        readonly challenge: Uint256
    ) {}

    public encodeToHex() {
        return Uint.concat([
            this.version,
            this.port,
            this.challenge
        ]);
    }
    
    public static fromDecodedHex(hexData: Uint) {
        if (hexData.getLen() !== 52) return null;

        return new StatusMsg(
            new Uint16(hexData.slice(0, 2)),
            new Port(hexData.slice(2, 4)),
            new Uint256(hexData.slice(4, 36))
        );
    }

}

export class StatusMC extends MessagingChannel {
    readonly id = LNMsgType.STATUS;

    async receive(data: Uint, socket: LNSocket) {
        
        const status = StatusMsg.fromDecodedHex(data);

        if (!status) {
            return null;
        }

        if (socket.meta.id.eq(0)) {
            
        }

    }

    async send(socket: LNSocket) {

        const { host: localAddr, port: localPort } = LeiCoinNetNode.getServerDetails();

        socket.send(
            new StatusMsg(
                new Uint16(0),
                new Port(1234),
                new Uint256(Uint.random(32))
            ).encodeToHex()
        )

    }

}
