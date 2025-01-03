import { AddressHex } from "../../objects/address.js";
import { PX } from "../../objects/prefix.js";
import Wallet from "../../objects/wallet.js";
import { Blockchain } from "../../storage/blockchain.js";
import { Uint64 } from "low-level";
import cli from "../cli.js";
import CLICMD, { CLISubCMD } from "../cliCMD.js";
import CLIUtils from "../cliUtils.js";
import { DataUtils } from "../../utils/dataUtils.js";

export default class WalletDBCMD extends CLISubCMD {
    public name = "walletdb";
    public description = "Manage the Wallet database";
    public usage = "walletdb <command> [...args]";

    protected registerCommands(): void {
        this.register(new ReadCMD());
        this.register(new InsertCMD());
        this.register(new RemoveCMD());
    }

    async run(args: string[], parent_args: string[]) {
        await Blockchain.init();
        await Blockchain.waitAllChainsInit();

        super.run(args, parent_args);
    }

}


class ReadCMD extends CLICMD {
    public name = "read";
    public description = "Read the Wallet database";
    public usage = "read (<wallet_address> | all)";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        if (args[0] === "all") {
            cli.cmd.info(
                "Wallets:\n" + 
                (await Blockchain.wallets.getAllKeys()).map((address) => {
                    return address.toHex();
                }).join("\n")
            );
            return;
        }

        const address = AddressHex.from(args[0]);
        const wallet = await Blockchain.wallets.getWallet(address);
        if (await Blockchain.wallets.existsWallet(address)) {
            cli.cmd.info(DataUtils.stringify(wallet, (key, value) => {
                if (key === "balance") {
                    return (value.toInt() / 100).toFixed(2);
                }
            }, 2));
        } else {
            cli.cmd.info("Wallet not found!");
        }

    }
}

class InsertCMD extends CLICMD {
    public name = "insert";
    public description = "Insert Data into the Wallet database";
    public usage = "insert <wallet_address> <stake> <nonce> <version>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 4) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const wallet = new Wallet(
            AddressHex.from(args[0]),
            Uint64.from(parseInt(args[1])),
            Uint64.from(parseInt(args[2])),
            PX.from(args[3])
        );
        await Blockchain.wallets.setWallet(wallet);
        cli.cmd.info("Wallet inserted!");
    }
}

class RemoveCMD extends CLICMD {
    public name = "remove";
    public description = "Remove Data from the Wallet database";
    public usage = "remove <wallet_address>";

    public async run(args: string[], parent_args: string[]): Promise<void> {
        if (args.length !== 1) {
            CLIUtils.invalidNumberOfArguments();
            return;
        }

        const address = AddressHex.from(args[0]);
        if (await Blockchain.wallets.existsWallet(address)) {
            await Blockchain.wallets.deleteWallet(address);
            cli.cmd.info("Wallet removed!");
        } else {
            cli.cmd.info("Wallet not found!");
        }

    }
}

