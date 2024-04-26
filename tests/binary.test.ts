import { Uint64, Uint } from "../src/utils/binary.js"

describe('binary_testing', () => {

    test('addition_and_subtraction', () => {

        const uint = Uint.from("00000000000000ff", "hex");

        //const randInt = Math.floor(Math.random() * 1_000_000);
        const randInt = 1;
        
        //const y1 = Uint64.from(randInt);
        const y1 = Uint.from(randInt, 8);
        const y2 = randInt;
        const y3 = BigInt(randInt);

        //uint.add(y1);
        uint.add(y2);
        //uint.add(y3);

        console.log(uint);

        //uint.sub(y1);
        uint.add((-1 * y2));
        //uint.sub(y3);

        expect(uint.buffer.toString("hex")).toBe("00000000000000ff");
    });

});

