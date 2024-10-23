import { Uint128, Uint16, Uint32, Uint96 } from "low-level";
import { LockedUint } from "./prefix.js";

export class IPv4Addr extends LockedUint {
    static readonly byteLength = 4;
    
    static from(addr: string) {
        const buffer = Buffer.alloc(4);
        const parts = addr.split('.');
        if (parts.length !== 4) {
            return;
        }

        for (let i = 0; i < 4; i++) {
            buffer.writeUInt8(parseInt(parts[i]), i);
        }

        return new IPv4Addr(buffer);
    }

    public toString() {
        return this.split(1).map((byte) => byte.toInt()).join('.');
    }
}

export class IPv6Addr extends LockedUint {
    static readonly byteLength = 16;

    static from(addr: string) {
        const buffer = Buffer.alloc(16);
        const parts = addr.split(':');
        if (parts.length !== 8) {
            return;
        }

        for (let i = 0; i < 8; i++) {
            buffer.writeUInt16BE(parseInt(parts[i], 16), i * 2);
        }

        return new IPv6Addr(buffer);
    }

    public toString() {
        return this.split(2).map((byte) => byte.toHex()).join(':');
    }

    public isIPv4() {
        const prefix = Uint96.alloc();
        prefix.set([0xFF, 0xFF], 10);

        if (this.slice(0, 12).eq(prefix)) {
            return true;
        }
    }

    public toIPv4() {
        if (this.isIPv4()) {
            return new IPv4Addr(this.slice(12));
        }
    }

}


export class Port extends LockedUint {
    static readonly byteLength = 2;

    static from(port: number | string) {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(Number(port));
        return new Port(buffer);
    }
}
