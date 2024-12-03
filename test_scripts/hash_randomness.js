import crypto from 'crypto';

function generateHashes() {
    const hashes = [];
    const charCounts = {};

    for (let i = 0; i < 1_000_000; i++) {
        const hash = crypto.createHash('sha256').update(i.toString()).digest('hex');
        const firstSixChars = hash.substring(0, 6);
        hashes.push(firstSixChars);

        for (let j = 0; j < firstSixChars.length; j++) {
            const char = firstSixChars[j];
            charCounts[char] = (charCounts[char] || 0) + 1;
        }
    }

    return { hashes, charCounts };
}

const { hashes, charCounts } = generateHashes();

console.log('Hashes:', hashes);
console.log('Character Counts:', charCounts);