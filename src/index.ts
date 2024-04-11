async function main() {

    await import("./utils/index.js");
    (await import("./utils/cli.js")).default.setup();

    await import("./handlers/configHandler.js");
    await import("./storage/blockchain.js");
    
    (await import("./netInitialization.js")).default();
    (await import("./validators/index.js")).default.initIfActive();

}

main();
