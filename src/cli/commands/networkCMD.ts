import LeiCoinNetNode from "../../leicoin-net";
import cli from "../cli";
import { CLICMD, CLISubCMD } from "../cliCMD.js";

export class NetworkCMD extends CLISubCMD {

    readonly name = "network";
    readonly description = "LeiCoin network related commands";
    readonly usage = "network <command> [...args]";

    protected registerCommands(): void {
        this.register(new StatsCMD());   
    }

}


class StatsCMD extends CLICMD {
    readonly name = "stats";
    readonly description = "Show network stats";
    readonly usage = "stats";

    public async run(args: string[]): Promise<void> {
        
        cli.cmd.info(
            `Network Stats:\n` +
            `Connected Peers: ${LeiCoinNetNode.connections.count}\n` +
            `Pending Peers: ${LeiCoinNetNode.connections.queue}`
        );

    }
}

