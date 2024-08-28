import { beforeAll } from "bun:test";
import { Blockchain } from "../../src/storage/blockchain";

beforeAll(() => {
    //Bun.env.NO_CLI = "true";
    Blockchain.init();
});

