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

function getPreparedObjectForHashing(obj: { [key: string]: any }, excludedKeys: string[] = []): { [key: string]: any } {
    const deepSort = (input: any): any => {
        if (typeof input !== 'object' || input === null) {
            return input;
        }

        if (Array.isArray(input)) {
            return input.map(deepSort);
        }

        const sortedObj: { [key: string]: any } = {};
        Object.keys(input)
            .sort()
            .forEach(key => {
                if (!excludedKeys.includes(key)) {
                    sortedObj[key] = deepSort(input[key]);
                }
            });
        return sortedObj;
    };

    const sortedObj = deepSort(obj);
    return sortedObj;
}

export default {
    base64EncodeToString,
    base64DecodeToString,
    base64EncodeToBuffer,
    encodePublicKeyToEncodedPublicKey,
    decodeEncodedPublicKeyToPublicKey,
    getPreparedObjectForHashing
}

