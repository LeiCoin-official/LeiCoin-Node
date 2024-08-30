import HTTP_API from "../../http_api/index.js";
import Utils from "../../utils/index.js";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD";

export default class StartServiceCMD extends CLISubCMD {
    public name = "start-service";
    public description = "Start a service even after initial startup";
    public usage = "start-service <service-name> [options]";

    protected registerCommands() {
        this.register(new StartAPI());
    }
}

class StartAPI extends CLICMD {
    public name = "api";
    public description = "Start the API service";
    public usage = "api [options]";

    public async run(args: string[], parent_args: string[]) {

        if (!args[0]) {
            cli.cmd.info("No host or port specified");
            return;
        }

        const [host, port] = args[0].split(":");

        if (!host || !port) {
            cli.cmd.info("Invalid host or port");
            return;
        }

        await HTTP_API.init();
        await HTTP_API.start({
            host,
            port: parseInt(port),
            eventHandler: Utils.events
        });

    }
}
