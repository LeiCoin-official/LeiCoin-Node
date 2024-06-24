async function main() {

    await import("./utils/index.js");
    await (await import("./cli/cli.js")).default.setup();

    await import("./handlers/configHandler.js");
    await (await import("./storage/blockchain.js")).default.waitAllinit();
    
    await (await import("./netInitialization.js")).default();
    (await import("./validator/index.js")).default.initIfActive();

    (await import("./pos/index.js")).default.init();

}

main();
