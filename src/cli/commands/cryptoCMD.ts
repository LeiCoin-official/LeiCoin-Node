import CLICMD, { CLISubCMD } from "../cliCMD.js";
import { PrivateKey } from "../../crypto/cryptoKeys.js";
import LCrypt from "../../crypto/index.js";
import { Address32, AddressHex } from "../../objects/address.js";
import { PX } from "../../objects/prefix.js";
import cli from "../cli.js";
import CLIUtils from "../cliUtils.js";


export default class CryptoCMD extends CLISubCMD {
    public name = "crypto";
    public description = "Crypto commands";
    public usage = "crypto <command> [args]";

    protected registerCommands(): void {
        this.register(new GenKeyPairCMD());
    }

}

class GenKeyPairCMD extends CLICMD {
    public name = "genKeyPair";
    public description = "Generate a new key pair";
    public usage = "genKeyPair (wallet|staker|smart-contract)";

    public async run(args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const privKey = LCrypt.generatePrivateKey().toHex();
        let prefix = null;

        switch (args[0]) {
            case "wallet":
                prefix = PX.A_00;
                break;
            case "minter":
                prefix = PX.A_0e;
                break;
            case "smart-contract":
                prefix = PX.A_0c;
                break;
            default:
                cli.cmd.info("Invalid key pair type!");
                return;
        }

        const addressHex = AddressHex.fromPrivateKey(prefix!, PrivateKey.from(privKey));
        const address32 = Address32.fromAddressHex(addressHex); 

        cli.cmd.info(
            `Here is your new key pair:\n` +
            ` - Private Key: ${privKey}\n` +
            ` - AddressHex: ${addressHex.toHex()}\n` +
            ` - Address32: ${address32}`
        );

    }
}