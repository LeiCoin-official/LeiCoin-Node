import { existsSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';

const workingDir = "/localtests/mintertest/";
const rootDir = process.cwd() + workingDir;

function getFullPath(path: string) {
    return rootDir + path;
}

function getRelativePath(path: string) {
    return "." + workingDir + path;
}

function existsPath(path: string) {
    return existsSync(getFullPath(path));
}

function createDirIfNotExists(path = "") {
    if (!existsPath(path)) {
        mkdirSync(getFullPath(path), { recursive: true });
    }
}

function touchFile(path: string, content = "") {
    writeFileSync(getFullPath(path), content);
}

function touchFileIfNotExists(path: string, contentIfNotExists = "", content = "") {
    if (!existsPath(path)) {
        touchFile(path, contentIfNotExists);
        return;
    }
    appendFileSync(getFullPath(path), content);
}

async function run(args: string[]) {
    const minterCount = parseInt(args[0]) || 1000;
    const slotCount = parseInt(args[1]) || 1000;
    const prefixLength = parseInt(args[2]) || 1;

    let cmd = `bun run ./unofficial_tests/database/newMinterSelectionAlgorithm/randomness.ts ${minterCount} ${slotCount} ${prefixLength}`;
    cmd += ` 2>&1 | tee -a ${getRelativePath("result.log")}`;
    const msg = `Run at ${new Date().toUTCString()} with minterCount: ${minterCount}, slotCount: ${slotCount}, prefixLength: ${prefixLength}`;

    console.log(msg);
    touchFileIfNotExists("result.log", msg, `\n${msg}`);

    await Bun.$`${{ raw: cmd }}`.nothrow();
}

async function main() {
    const args = process.argv.slice(2);

    let force = false;
    if (args[0] === "-f") {
        args.shift();
        force = true;
    }

    createDirIfNotExists();
    if (existsPath(".lock") && !force) {
        console.log("Already Executed");
        return;
    }

    touchFile(".lock");
	await run(args);
    touchFile(".finish");
}

await main();

