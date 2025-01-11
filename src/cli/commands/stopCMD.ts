import utils from "../../utils/index.js";
import CLICMD from "../cliCMD.js";

export default class StopCMD extends CLICMD {
    readonly name = "stop";
    readonly description = "Stops The Server and Staker";
    readonly usage = "stop";
    readonly environment = "runtime";

    public async run(args: string[]): Promise<void> {
        utils.gracefulShutdown();
    }
}

