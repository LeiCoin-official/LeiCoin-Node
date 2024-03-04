import crypto from "crypto";

function createHash(obj: { [key: string]: any }, excludedKeys: string[] = []) {
    return crypto.createHash('sha256')
        .update(JSON.stringify(
            getPreparedObjectForHashing(obj, excludedKeys)
        )).digest('hex');
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
    createHash,
    getPreparedObjectForHashing
}

