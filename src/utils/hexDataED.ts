import { Uint, Uint64, Uint8 } from "./binary.js";
import { Dict } from "./objects.js";

type BasicTypes = "string" | "int" | "bigint" | "array" | "bool" | "object" | "bigintWithLenPrefix";
type AdvancedTypes = "address" | "hash" | "signature" | "nonce" | "version";
type DefaultDataTypes = BasicTypes | AdvancedTypes;

interface DataFromHexArguments {
    key: string;
    length?: number;
    lengthBefore?: boolean | "unlimited";
    type?: DefaultDataTypes;
    decodeFunc?(hexData: Uint, returnLength: boolean): any;
}

interface DataToHexArguments {
    key: string;
    lengthBefore?: boolean | "unlimited";
    type?: DefaultDataTypes;
    encodeFunc?(add_empty_bytes: boolean, forHash: boolean): Uint;
}

interface HexDataType {
    defaultLength?: number;
    lengthBefore?: boolean;
    encode?(v: any): Uint;
    parse?(v: Uint): any;
}

const hexDataBasicTypes: Dict<HexDataType> = {
    bigint: {
        encode: Uint64.prototype.toShortUint.call,
        parse: Uint64.create
    },
    bool: {
        defaultLength: 1,
        encode: (v: any) => (v ? Uint8.from(1) : Uint8.from(0)),
        parse: (v: Uint8) => (v.eq(1))
    },
    default: {}
}

const hexDataTemplateTypes: Dict<HexDataType> = {
    bigintWithLenPrefix: {
        defaultLength: 1, lengthBefore: true,
        ...hexDataBasicTypes.bigint
    }
}

const hexDataAdvancedTypes: Dict<HexDataType> = {
    address: { defaultLength: 21 },
    signature: { defaultLength: 66 },
    hash: { defaultLength: 32 },
    nonce: hexDataTemplateTypes.bigintWithLenPrefix,
    index: hexDataTemplateTypes.bigintWithLenPrefix,
    timestamp: hexDataTemplateTypes.bigintWithLenPrefix,
    version: { defaultLength: 1 }
}

const hexDataTypes: Dict<HexDataType> = {
    ...hexDataBasicTypes,
    ...hexDataTemplateTypes,
    ...hexDataAdvancedTypes
}

function encodeUint(input: Uint) {
    return input;
}

function decodeUint(input: Uint) {
    
}

class HexDataED {

    private static initialized = false; 

    public static init() {
        if (this.initialized) return;
        this.initialized = true;

        for (const key in hexDataTypes) {
            if (hexDataTypes.hasOwnProperty(key)) {
                const type = hexDataTypes[key];
                if (type.classType) {
                    type.classType.fromHex = fromClass;
                }
            }
        }
    }

    public static getTypeInfo() {

    }

    public static encodeBin() {



    }

    public static decodeBin() {

    }

}