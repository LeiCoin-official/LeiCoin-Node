
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

export default {
    compressZeros,
    decompressZeros
}
