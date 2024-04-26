import { Uint64 } from "../src/utils/binary.js"

describe('binary_testing', () => {

    test('addition_and_subtraction', () => {

        const unit = Uint64.alloc();

        const randInt = Math.floor(Math.random() * 1_000_000);
        
        const y1 = Uint64.from(randInt);
        const y2 = randInt;
        const y3 = BigInt(randInt);

        unit.add(y1);
        unit.add(y2);
        unit.add(y3);
        
        unit.sub(y1);
        unit.sub(y2);
        unit.sub(y3);

        expect(unit.buffer.toString("hex")).toBe("0000000000000000");
    });

});

