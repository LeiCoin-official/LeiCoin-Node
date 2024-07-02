// import cli from "../cli/cli.js";
// import Crypto from "../crypto/index.js";
// import ObjectEncoding, { EncodingSettings } from "../encoding/objects.js";
// import Block from "../objects/block.js";
// import { PX } from "../objects/prefix.js";
// import { Uint, Uint256 } from "../utils/binary.js";
// import { Callbacks } from "../utils/callbacks.js";
// import { DataUtils, Dict } from "../utils/dataUtils.js";
// import BCUtils from "./blockchainUtils.js";


// export class ForkChainstateData {
//     public readonly parent: Uint256;
//     public readonly stateHash: Uint256;
//     public readonly base: Block;
//     public latestBlock: Block;

//     constructor(parent: Uint256, stateHash: Uint256, base: Block, latestBlock: Block) {
//         this.parent = parent;
//         this.stateHash = stateHash;
//         this.base = base;
//         this.latestBlock = latestBlock;
//     }

//     public encodeToHex(forHash = false) {
//         return ObjectEncoding.encode(this, ForkChainstateData.encodingSettings, forHash).data;
//     }

//     public static fromDecodedHex(hexData: Uint, returnLength = false) {
        
//         try {
//             const returnData = ObjectEncoding.decode(hexData, ForkChainstateData.encodingSettings, returnLength);

//             const data = returnData.data;
        
//             if (data && data.version.eq(0)) {
//                 const forkChainstateData = DataUtils.createInstanceFromJSON(ForkChainstateData, data);

//                 if (returnLength) {
//                     return {data: forkChainstateData, length: returnData.length};
//                 }
//                 return forkChainstateData;
//             }
//         } catch (err: any) {
//             cli.data.error(`Error loading ForkChainstateData from Decoded Hex: ${err.message}`);
//         }

//         return null;
//     }

//     public calculateHash() {
//         return Crypto.sha256(this.encodeToHex(true));
//     }

//     private static encodingSettings: EncodingSettings[] = [
//         {key: "parent", type: "hash"},
//         {key: "stateHash", type: "hash", hashRemove: true},
//         {key: "base", type: "object", encodeFunc: Block.prototype.encodeToHex, decodeFunc: Block.fromDecodedHex},
//         {key: "latestBlock", type: "object", encodeFunc: Block.prototype.encodeToHex, decodeFunc: Block.fromDecodedHex}
//     ]

// }


// export class ChainstateData {
//     public readonly chains: Dict<ForkChainstateData> = {};
//     public readonly version: PX;

//     constructor(chains: ForkChainstateData[], version: PX) {
//         for (const chain of chains) {
//             this.chains[chain.base.hash.toHex()] = chain;
//         }
//         this.version = version;
//     }

//     public encodeToHex(forHash = false) {
//         return ObjectEncoding.encode(
//             {
//                 version: this.version,
//                 chains: Object.values(this.chains)
//             },
//             ChainstateData.encodingSettings,
//             forHash
//         ).data;
//     }

//     public static fromDecodedHex(hexData: Uint) {
        
//         try {
//             const returnData = ObjectEncoding.decode(hexData, ChainstateData.encodingSettings);

//             const data = returnData.data;
        
//             if (data && data.version.eq(0)) {
//                 return DataUtils.createInstanceFromJSON(ChainstateData, data);
//             }
//         } catch (err: any) {
//             cli.data.error(`Error loading ForkChainstateData from Decoded Hex: ${err.message}`);
//         }

//         return null;
//     }

//     public calculateHash() {
//         return Crypto.sha256(this.encodeToHex(true));
//     }

//     private static encodingSettings: EncodingSettings[] = [
//         {key: "version"},
//         {key: "chains", type: "array", length: 2, encodeFunc: ForkChainstateData.prototype.encodeToHex, decodeFunc: ForkChainstateData.fromDecodedHex}
//     ]

// }

// export class Chainstate {

//     private static instance: Chainstate;

//     public static getInstance() {
//         if (!Chainstate.instance) {
//             Chainstate.instance = new Chainstate();
//         }
//         return Chainstate.instance;
//     }

//     private readonly chainStateData: ChainstateData;

//     private constructor() {
//         BCUtils.ensureFileExists('/chainstate.dat', new ChainstateData([], PX.V_00).encodeToHex());
//         this.chainStateData = this.getChainStateFile().data;
//     }

//     private getChainStateFile(): {cb: Callbacks, data: ChainstateData} {
//         try {

//             const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.dat`);
//             const hexData = fs.readFileSync(latestBlockInfoFilePath, { encoding: "hex" });

//             const data = EncodingUtils.decodeHexToString(hexData);

//             return {cb: Callbacks.SUCCESS, data: JSON.parse(data)};
//         } catch (err: any) {
//             cli.data.error(`Error reading latest block info: ${err.message}`);
//             return {cb: Callbacks.ERROR, data: { version: "00", chains: {} }};
//         }
//     }
    
//     private updateChainStateFile() {
//         try {

//             const latestBlockInfoFilePath = BCUtils.getBlockchainDataFilePath(`/chainstate.dat`);
            
//             const hexData = EncodingUtils.encodeStringToHex(JSON.stringify(this.chainStateData, (key, value) => {
//                 if (value instanceof Block) {
//                     return value.encodeToHex().toHex();
//                 }
//                 return value;
//             }));
    
//             fs.writeFileSync(latestBlockInfoFilePath, hexData, { encoding: "hex" });
//             return {cb: Callbacks.SUCCESS};
//         } catch (err: any) {
//             cli.data.error(`Error updating Chainstate File: ${err.message}`);
//             return {cb: Callbacks.ERROR};
//         }
//     }    

// }

// export default Chainstate;