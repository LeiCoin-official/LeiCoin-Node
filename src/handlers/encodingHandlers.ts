
function base64EncodeToString(data: string) {
    return Buffer.from(data).toString('base64');
}

function base64EncodeToBuffer(data: string) {
    return Buffer.from(data, 'base64');
}

function base64DecodeToString(data: string) {
    return Buffer.from(data, 'base64').toString();
}

function encodePublicKeyToEncodedPublicKey(public_key_pem: string) {
    return base64EncodeToString(public_key_pem);
}

function decodeEncodedPublicKeyToPublicKey(encoded_public_key: string) {
    return base64DecodeToString(encoded_public_key);
}


function stringToHex(stringData: string) {
    return Buffer.from(stringData).toString("hex");
}
  
function hexToString(hexData: string) {
    return Buffer.from(hexData, "hex").toString();
}

function compressZeros(numberStr: string) {
    // Define a regular expression pattern to match consecutive zeros
    const pattern = /0{3,9}/g; // Matches 4 or more consecutive zeros globally

    // Replace matches with E(number of zeros)
    const convertedStr = numberStr.replace(pattern, function(match) {
        return 'E' + match.length;
    });

    return convertedStr;
}

function decompressZeros(compressedStr: string) {
    // Define a regular expression pattern to match compressed sequences
    var pattern = /E(\d+)/g; // Matches E followed by one or more digits

    // Replace matches with the corresponding number of zeros
    var decompressedStr = compressedStr.replace(pattern, function(match, numZeros) {
        return '0'.repeat(parseInt(numZeros));
    });

    return decompressedStr;
}

function encodeAddressToHex(address: string) {
    return address.slice(2, address.length).replace("x", "0");
}

function decodeHexToAddress(hexKey: string) {
    const splitetHexKey = hexKey.split("");

    splitetHexKey[1] = splitetHexKey[1].replace("0", "x");
    const address = "lc" + splitetHexKey.join("");
    return address;
}

function splitHex(hexData: string, values: {key: string, length: number | string, type?: "string" | "int" | "bigint", decode?: boolean}[]) {

    const final_data: {[key: string]: any} = {};
    let current_length = 0;

    for (const data of values) {
        const key = data.key;
        let length: number;
        const type = data.type;

        if (typeof(data.length) === "string") {
            length = parseInt(final_data[data.length]);
        } else {
            length = data.length;
        }
        
        let value = hexData.substring(current_length, current_length + length);
        if (value.length !== length) {
            return {};
        }

        if (data.decode) {
            value = hexToString(value);
        }

        if (type === "int") {
            final_data[key] = parseInt(value);
        } else if (type === "bigint") {
            final_data[key] = BigInt(value);
        } else {
            final_data[key] = value;
        }

        current_length += length;
    }

    return final_data;

}

export default {
    base64EncodeToString,
    base64DecodeToString,
    base64EncodeToBuffer,
    encodePublicKeyToEncodedPublicKey,
    decodeEncodedPublicKeyToPublicKey,
    stringToHex,
    hexToString,
    compressZeros,
    decompressZeros,
    encodeAddressToHex,
    decodeHexToAddress,
    splitHex
}