async function main() {

    await import("./utils/index.js");
    await (await import("./utils/cli.js")).default.setup();

    await import("./handlers/configHandler.js");
    await (await import("./storage/blockchain.js")).default.waitAllinit();
    
    await (await import("./netInitialization.js")).default();
    (await import("./validator/index.js")).default.initIfActive();

}

main();
