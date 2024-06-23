import CLICMD, { CLISubCMD } from "../cliCMD";
import { PrivateKey } from "../../crypto/cryptoKeys.js";
import Crypto from "../../crypto/index.js";
import { Address32, AddressHex } from "../../objects/address.js";
import { PX } from "../../objects/prefix.js";
import cli from "../cli.js";


export default class CryptoCMD extends CLISubCMD {
    public name = "crypto";
    public description = "Crypto commands";
    public usage = "crypto <command> [args]";

    protected registerCommands(): void {
        this.register(new GenKeyPairCMD());
    }

    protected async run_empty(parent_args: string[]): Promise<void> {
        await this.run_help(parent_args);
    }

}

export class GenKeyPairCMD extends CLICMD {
    public name = "genKeyPair";
    public description = "Generate a new key pair";
    public usage = "genKeyPair <wallet|staker|smart-contract>";

    public async run(args: string[]): Promise<void> {
        if (args.length !== 1) {
            cli.default_message.info("Invalid number of arguments!");
            return;
        }

        const privKey = Crypto.ec.genKeyPair().getPrivate("hex");
        let prefix = null;

        switch (args[0]) {
            case "wallet":
                prefix = PX.A_00;
                break;
            case "staker":
                prefix = PX.A_0e;
                break;
            case "smart-contract":
                prefix = PX.A_0c;
                break;
            default:
                cli.default_message.info("Invalid key pair type!");
                return;
        }

        const addressHex = AddressHex.fromPrivateKey(prefix!, PrivateKey.from(privKey));
        const address32 = Address32.fromAddressHex(addressHex); 

        cli.default_message.info(
            `Here is your new key pair:\n` +
            ` - Private Key: ${privKey}\n` +
            ` - AddressHex: ${addressHex.toHex()}\n` +
            ` - Address32: ${address32}`
        );

    }
}