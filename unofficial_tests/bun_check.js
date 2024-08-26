
const buf1 = Buffer.from('01020304');
const buf2 = Buffer.from(buf1);

buf2[0] = 0x05;

console.log(buf1);
console.log(buf2);
