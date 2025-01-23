import { Utils } from "@leicoin/utils";
import { CLICMD } from "../handler/command.js";

export class StopCMD extends CLICMD {
    readonly name = "stop";
    readonly description = "Stops The Server and Staker";
    readonly usage = "stop";
    readonly environment = "runtime";

    public async run(args: string[]): Promise<void> {
        Utils.gracefulShutdown();
    }
}

