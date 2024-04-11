function gcd(a: number, b: number): number {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

function simplifyFraction(a: number, b: number): [number, number] {
    const divisor = gcd(a, b);
    return [b / divisor, a / divisor];
}

function smallestCommonPower(a: number, b: number) {
    return simplifyFraction(Math.log(b), Math.log(a));
}

console.log(smallestCommonPower(16, 32));