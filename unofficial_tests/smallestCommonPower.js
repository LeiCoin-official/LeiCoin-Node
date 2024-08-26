"use strict";
function gcd(a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}
function simplifyFraction(a, b) {
    const divisor = gcd(a, b);
    return [b / divisor, a / divisor];
}
function smallestCommonPower(a, b) {
    return simplifyFraction(Math.log(b), Math.log(a));
}
console.log(smallestCommonPower(16, 32));
