import { beforeAll } from "bun:test";

beforeAll(() => {
    process.env.nocli = "true";
});
