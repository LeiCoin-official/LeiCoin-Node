import { beforeAll } from "bun:test";
import { Blockchain } from "../../src/storage/blockchain";

beforeAll(() => {
    //process.env.NO_CLI = "true";
    Blockchain.init();
});

