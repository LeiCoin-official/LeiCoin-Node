import { beforeAll } from "bun:test";

beforeAll(() => {
    process.env.NO_CLI = "true";
});
