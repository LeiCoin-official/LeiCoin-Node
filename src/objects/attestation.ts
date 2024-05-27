import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
import cli from "../utils/cli.js";
import Crypto from "../crypto/index.js";
import { AddressHex } from "./address.js";
import { DataUtils } from "../utils/dataUtils.js";
import { Uint, Uint256, Uint64 } from "../utils/binary.js";
import Signature from "./signature.js";
import { PX } from "./prefix.js";

export class Attestation {
    
    public attester: AddressHex;
    public blockHash: Uint256;
    public vote: boolean;
    public nonce: Uint64;
    public signature: Signature;
    public readonly version: PX;

    constructor(attester: AddressHex, blockHash: Uint256, vote: boolean, nonce: Uint64, signature: Signature, version = PX.V_00) {
        this.attester = attester;
        this.blockHash = blockHash;
        this.vote = vote;
        this.nonce = nonce;
        this.signature = signature;
        this.version = version;
    }

    public encodeToHex(forHash = false) {
        return ObjectEncoding.encode(this, Attestation.encodingSettings, forHash).data;
    }

    public static fromDecodedHex(hexData: Uint, withAttesterAddress = true) {
        try {
            const returnData = ObjectEncoding.decode(hexData, Attestation.encodingSettings);
            const data = returnData.data;
        
            if (data && data.version.eq(0)) {

                data.attester = null;
                const instance = DataUtils.createInstanceFromJSON(Attestation, data);

                if (withAttesterAddress) {
                    instance.attester = AddressHex.fromSignature(instance.calculateHash(), data.signature);
                }

                return instance;
            }
        } catch (err: any) {
            cli.data_message.error(`Error loading Attestation from Decoded Hex: ${err.message}`);
        }
        return null;
    }

    public calculateHash() {
        return Crypto.sha256(this.encodeToHex(true));
    }

    private static encodingSettings: EncodingSettings[] =[
        {key: "version"},
        {key: "blockHash", type: "hash"},
        {key: "vote", type: "bool"},
        {key: "nonce"},
        {key: "signature", hashRemove: true}
    ]

}

export default Attestation;
