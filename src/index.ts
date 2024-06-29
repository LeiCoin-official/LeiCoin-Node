
export default class Main {

    public static async init() {

        (await import("./utils/index.js"));
        await (await import("./cli/cli.js")).default.setup();
    
        await import("./handlers/configHandler.js");
        await (await import("./storage/blockchain.js")).default.waitAllinit();
        
        await (await import("./netInitialization.js")).default();
        (await import("./minter/index.js")).MinterClient.initIfActive();
    
        (await import("./pos/index.js")).POS.init();

    }

}

Main.init();

