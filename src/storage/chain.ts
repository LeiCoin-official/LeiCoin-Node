import BlockDB from "./blocks";
import WalletDB from "./wallets";

export class Chain {

    public readonly name: string;
    public readonly blocks: BlockDB;
    public readonly wallets: WalletDB;

    constructor(name = "main") {
        this.name = name;
        this.blocks = new BlockDB(name);
        this.wallets = new WalletDB();
    }

}

export default Chain;