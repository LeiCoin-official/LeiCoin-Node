import utils from "../../utils/index.js";
import CLICMD from "../cliCMD.js";

export default class StopCMD extends CLICMD {
    public name = "stop";
    public description = "Stops The Server and Staker";
    public usage = "stop";

    readonly environment = "runtime";

    public async run(args: string[]): Promise<void> {
        utils.gracefulShutdown();
    }
}

