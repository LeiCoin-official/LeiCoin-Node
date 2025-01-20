import { LCrypt } from "@leicoin/crypto";
import { Address32, AddressHex } from "@leicoin/objects/address";
import { PX } from "@leicoin/objects/prefix";
import { CLICMD, CLISubCMD } from "../cliCMD.js";
import { cli } from "../cli.js";
import { CLIUtils } from "../cliUtils.js";


export class CryptoCMD extends CLISubCMD {
    readonly name = "crypto";
    readonly description = "Crypto commands";
    readonly usage = "crypto <command> [...args]";

    protected registerCommands(): void {
        this.register(new GenKeyPairCMD());
    }

}

class GenKeyPairCMD extends CLICMD {
    readonly name = "genKeyPair";
    readonly description = "Generate a new key pair";
    readonly usage = "genKeyPair (wallet|minter|smart-contract)";

    public async run(args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const privKey = LCrypt.generatePrivateKey();
        let prefix: PX;

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

        const addressHex = AddressHex.fromPrivateKey(prefix, privKey);
        const address32 = Address32.fromAddressHex(addressHex); 

        cli.cmd.info(
            `Here is your new key pair:\n` +
            ` - Private Key: ${privKey.toHex()}\n` +
            ` - AddressHex: ${addressHex.toHex()}\n` +
            ` - Address32: ${address32}`
        );

    }
}