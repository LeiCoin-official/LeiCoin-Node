import { Uint, Uint16, Uint256 } from "../../../binary/uint.js";
import LCrypt from "../../../crypto/index.js";
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
            return;
        }

        if (socket.meta.id.eq(0)) {
            
        }

    }

    async send(data: null, socket: LNSocket) {

        socket.send(
            new StatusMsg(
                Uint16.from(0),
                Port.from(LeiCoinNetNode.getServerInfo().port),
                new Uint256(LCrypt.randomBytes(32))
            ).encodeToHex()
        )

    }

}

new StatusMC()